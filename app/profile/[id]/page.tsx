"use client";

import { useEffect, useMemo, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";

type Profile = {
  id: string;
  avatar_url?: string | null;
  display_url?: string | null;
  username?: string | null;
  location?: string | null;
  bio?: string | null;
  tier?: string | null;
  items_count?: number | null;
  collections_count?: number | null;
};

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Inline edit states
  const [editMode, setEditMode] = useState(false);
  const [editedDisplayUrl, setEditedDisplayUrl] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [editedLocation, setEditedLocation] = useState("");
  const [editedTier, setEditedTier] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!userId) {
      router.replace("/not-found");
      return;
    }

    async function loadData() {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) throw error;
        setProfile(data);

        if (data && currentUserId === userId) {
          setEditedDisplayUrl(data.display_url || "");
          setEditedBio(data.bio || "");
          setEditedLocation(data.location || "");
          setEditedTier(data.tier || "Standard");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId, router, currentUserId]);

  useEffect(() => {
    if (!currentUserId || !userId || currentUserId === userId) return;

    async function checkFollow() {
      const { data } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", currentUserId)
        .eq("following_id", userId)
        .maybeSingle();

      setIsFollowing(!!data);
    }

    checkFollow();
  }, [currentUserId, userId]);

  async function toggleFollow() {
    if (!currentUserId || currentUserId === userId) return;

    setFollowLoading(true);

    try {
      if (isFollowing) {
        await supabase.from("follows").delete().eq("follower_id", currentUserId).eq("following_id", userId);
        setIsFollowing(false);
      } else {
        await supabase.from("follows").insert({ follower_id: currentUserId, following_id: userId });
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Follow error:", err);
    } finally {
      setFollowLoading(false);
    }
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentUserId || currentUserId !== userId) return;

    setUploadingAvatar(true);

    try {
      const timestamp = Date.now();
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `avatar-${timestamp}.${fileExt}`;
      const filePath = `${currentUserId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true, cacheControl: "31536000" });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      console.log("Avatar public URL:", data.publicUrl);

      if (!data.publicUrl) throw new Error("No public URL – check bucket is PUBLIC");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", currentUserId);

      if (updateError) throw updateError;

      setProfile((prev) => (prev ? { ...prev, avatar_url: data.publicUrl } : null));

      alert("Avatar updated! Refresh page to confirm.");
    } catch (err: any) {
      console.error("Avatar failed:", err);
      alert("Avatar update failed: " + (err.message || "Check console (F12)"));
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function saveProfileChanges() {
    if (!currentUserId || currentUserId !== userId) return;

    setSaving(true);

    try {
      const updates = {
        display_url: editedDisplayUrl.trim() || null,
        bio: editedBio.trim() || null,
        location: editedLocation.trim() || null,
        tier: editedTier || null,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", currentUserId);

      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      setEditMode(false);
      alert("Profile saved!");
    } catch (err: any) {
      console.error("Save failed:", err);
      alert("Save failed: " + (err.message || "Check console"));
    } finally {
      setSaving(false);
    }
  }

  const displayName = useMemo(
    () => profile?.display_url || profile?.username || "Unnamed Collector",
    [profile]
  );

  const getTierIcon = (tier?: string | null) => {
    if (!tier) return null;
    const lower = tier.toLowerCase();

    if (lower.includes("bronze"))   return "/tier-badges/bronze.png";
    if (lower.includes("silver"))   return "/tier-badges/silver.png";
    if (lower.includes("gold"))     return "/tier-badges/gold.png";
    if (lower.includes("diamond"))  return "/tier-badges/diamond.png";
    if (lower.includes("founder"))  return "/tier-badges/founder.png";

    return null;
  };

  const tierIconSrc = getTierIcon(profile?.tier);

  const isOwnProfile = currentUserId === userId;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <ProfileHeader />
        <div className="flex items-center justify-center h-[80vh] text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-white">
        <ProfileHeader />
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <h1 className="text-3xl mb-4">Error</h1>
          <p className="text-white/70">{error || "Profile not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ProfileHeader />

      <main className="pt-8 pb-20 space-y-10 max-w-[720px] mx-auto px-4">

        {/* PROFILE BOX */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-lg shadow-black/30">
          <div className="flex flex-col items-center text-center">

            <div className="relative flex items-center justify-center gap-10 mb-10 group">
              <div className="relative">
                <img
                  src={profile.avatar_url || "/default-avatar.png"}
                  alt="Avatar"
                  className="w-96 h-96 sm:w-[28rem] sm:h-[28rem] rounded-full object-cover border-8 border-zinc-700 shadow-2xl transition-opacity group-hover:opacity-80"
                />

                {isOwnProfile && (
                  <>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="text-white text-xl font-medium">
                        {uploadingAvatar ? "Uploading..." : "Change Photo"}
                      </span>
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                  </>
                )}
              </div>

              {!isOwnProfile && (
                <button
                  onClick={toggleFollow}
                  disabled={followLoading}
                  className={`px-8 py-3 rounded-full text-lg font-medium transition min-w-[140px] ${
                    isFollowing
                      ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-600"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500"
                  }`}
                >
                  {followLoading ? "…" : isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>

            {isOwnProfile && editMode ? (
              <input
                type="text"
                value={editedDisplayUrl}
                onChange={(e) => setEditedDisplayUrl(e.target.value)}
                placeholder="Display Name (display_url)"
                className="text-4xl font-bold mb-4 bg-zinc-900 border border-zinc-700 rounded px-6 py-3 text-center w-full max-w-lg"
              />
            ) : (
              <h1 className="text-4xl font-bold mb-3">{displayName}</h1>
            )}

            {profile.username && (
              <p className="text-gray-400 text-2xl mb-6">@{profile.username}</p>
            )}

            {isOwnProfile && editMode ? (
              <textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                placeholder="Bio"
                className="text-gray-300 text-xl mb-6 bg-zinc-900 border border-zinc-700 rounded px-6 py-4 w-full max-w-lg h-36 resize-none"
              />
            ) : (
              <p className="text-gray-300 text-xl mb-6 max-w-lg leading-relaxed">
                {profile.bio || "Collector of rare finds • Watches, cards, coins & more • Always chasing the next grail"}
              </p>
            )}

            {isOwnProfile && editMode ? (
              <input
                type="text"
                value={editedLocation}
                onChange={(e) => setEditedLocation(e.target.value)}
                placeholder="Location"
                className="text-gray-400 text-xl bg-zinc-900 border border-zinc-700 rounded px-6 py-3 text-center w-full max-w-lg mb-6"
              />
            ) : (
              <p className="text-gray-400 text-xl mb-6">{profile.location || "Swindon, UK"}</p>
            )}

            <div className="flex items-center gap-4 mb-8">
              {isOwnProfile && editMode ? (
                <div className="w-full max-w-lg">
                  <label className="block text-gray-400 text-xl mb-3">Collector Tier</label>
                  <select
                    value={editedTier}
                    onChange={(e) => setEditedTier(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 rounded px-6 py-4 w-full text-white text-xl"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Diamond">Diamond</option>
                    <option value="Founder">Founder</option>
                  </select>
                </div>
              ) : (
                profile.tier && (
                  <div className="flex items-center gap-4">
                    {tierIconSrc ? (
                      <img
                        src={tierIconSrc}
                        alt={`${profile.tier} tier badge`}
                        className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }} // hide broken images
                      />
                    ) : (
                      <span className="text-4xl">🏆</span>
                    )}
                    <p className="text-indigo-400 text-2xl font-medium">
                      Tier: {profile.tier}
                    </p>
                  </div>
                )
              )}
            </div>

            {isOwnProfile && (
              <div className="mt-10 flex gap-6 flex-wrap justify-center">
                {editMode ? (
                  <>
                    <button
                      onClick={saveProfileChanges}
                      disabled={saving}
                      className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-full text-xl font-medium transition disabled:opacity-50 min-w-[200px]"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-12 py-5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-full text-xl font-medium transition min-w-[200px]"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-14 py-5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-full text-xl font-medium transition shadow-xl"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* STATS */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-lg shadow-black/30">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold">{profile.items_count || "2.1k"}</p>
              <p className="text-gray-500 text-xl mt-3">Items</p>
            </div>
            <div>
              <p className="text-5xl font-bold">{profile.collections_count || "4"}</p>
              <p className="text-gray-500 text-xl mt-3">Categories</p>
            </div>
            <div>
              <p className="text-5xl font-bold">90.8</p>
              <p className="text-gray-500 text-xl mt-3">Rarity Score</p>
            </div>
          </div>
        </section>

        {/* COLLECTIONS */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-lg shadow-black/30">
          <h2 className="text-4xl font-bold mb-8 text-center">My Vault</h2>
          <div className="flex flex-wrap gap-5 justify-center">
            {["Cards", "Watches", "Coins", "Memorabilia"].map((cat) => (
              <button
                key={cat}
                className="px-10 py-4 bg-zinc-900/70 border border-zinc-700 rounded-full text-xl font-medium hover:border-zinc-500 hover:bg-zinc-800 transition"
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* RECENT DROPS */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-lg shadow-black/30">
          <h2 className="text-4xl font-bold mb-8 text-center">Recent Drops</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-10">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 group">
              <img
                src="/charizard.png"
                alt="Featured Card"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-5 left-5 bg-indigo-600/90 text-white text-base font-bold px-4 py-2 rounded-md">
                Featured
              </div>
            </div>

            <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 group">
              <img
                src="/watch.png"
                alt="Watch"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 group">
              <img
                src="/coin.png"
                alt="Coin"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>

          <div className="text-center text-lg text-gray-400">
            <p className="mb-2">2 hours ago</p>
            <p>Just added this beauty to the vault. Thoughts?</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* HEADER — Icons only, eBay as text, Whatnot included */
function ProfileHeader() {
  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "#000",
          borderBottom: "1px solid #1f1f1f",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
        }}
      >
        <img
          src="/CC-main-logo.png"
          alt="Collector Connector"
          width={130}
          height={130}
          style={{ objectFit: "contain" }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 20, color: "white" }}>
          {/* Instagram */}
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
            <svg width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>

          {/* Facebook */}
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
            <svg width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.992 22 12z"/>
            </svg>
          </a>

          {/* eBay */}
          <a href="https://ebay.com" target="_blank" rel="noopener noreferrer" className="text-base font-bold tracking-wide hover:scale-110 transition-transform">
            eBay
          </a>

          {/* Discord */}
          <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
            <svg width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3853-.3969-.8748-.6083-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8851 1.515.0699.0699 0 00-.032.0277C.5336 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0775.0105c.1202.099.246.1981.372.2914a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6061 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
            </svg>
          </a>

          {/* Whatnot */}
          <a href="https://whatnot.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
            <svg width="26" height="26" viewBox="0 0 256 256" fill="currentColor">
              <path d="M28 64c0-8.8 7.2-16 16-16h168c8.8 0 16 7.2 16 16v80c0 8.8-7.2 16-16 16h-60l-24 32-24-32H44c-8.8 0-16-7.2-16-16V64z M128 96l40 40h-80l40-40z"/>
            </svg>
          </a>

          {/* X */}
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
            <svg width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
        </div>
      </header>

      <div style={{ height: 56 }} />
    </>
  );
}
