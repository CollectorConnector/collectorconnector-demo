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
  followers_count?: number | null;
  following_count?: number | null;
  vault_value?: number | null;
  likes_count?: number | null;
};

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  // -----------------------------
  // STATE (cleaned + organized)
  // -----------------------------
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Inline edit states
  const [editMode, setEditMode] = useState(false);
  const [editedDisplayUrl, setEditedDisplayUrl] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [editedLocation, setEditedLocation] = useState("");
  const [editedTier, setEditedTier] = useState("");
  const [saving, setSaving] = useState(false);

  const [collections, setCollections] = useState<
    { id: string; title: string; nichem: string; cover_url: string | null; item_count: number | null }[]
  >([]);

  // -----------------------------
  // LOAD COLLECTIONS
  // -----------------------------
  useEffect(() => {
    if (!userId) return;

    async function loadCollections() {
      const { data, error } = await supabase
        .from("collections")
        .select("id, title, nichem, cover_url, item_count")
        .eq("user_id", userId);

      if (!error && data) setCollections(data);
    }

    loadCollections();
  }, [userId]);

  // -----------------------------
  // LOAD CURRENT USER
  // -----------------------------
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  // -----------------------------
  // LOAD PROFILE
  // -----------------------------
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

  // -----------------------------
  // CHECK FOLLOW STATUS
  // -----------------------------
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

  // -----------------------------
  // FOLLOW / UNFOLLOW
  // -----------------------------
  async function toggleFollow() {
    if (!currentUserId || currentUserId === userId) return;

    setFollowLoading(true);

    try {
      if (isFollowing) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", userId);

        setIsFollowing(false);
      } else {
        await supabase
          .from("follows")
          .insert({ follower_id: currentUserId, following_id: userId });

        setIsFollowing(true);
      }
    } finally {
      setFollowLoading(false);
    }
  }

  // -----------------------------
  // SAVE PROFILE CHANGES (NEW)
  // -----------------------------
  async function saveProfileChanges() {
    if (!currentUserId || !profile) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_url: editedDisplayUrl,
          bio: editedBio,
          location: editedLocation,
          tier: editedTier,
        })
        .eq("id", currentUserId);

      if (error) throw error;

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              display_url: editedDisplayUrl,
              bio: editedBio,
              location: editedLocation,
              tier: editedTier,
            }
          : null
      );

      setEditMode(false);
    } catch (err: any) {
      console.error("Save profile error:", err);
      alert("Failed to save changes: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------
  // AVATAR UPLOAD
  // -----------------------------
  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentUserId || currentUserId !== userId) return;

    setUploadingAvatar(true);
    setPreviewImage(URL.createObjectURL(file));

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

      if (!data.publicUrl) throw new Error("No public URL — check bucket is PUBLIC");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", currentUserId);

      if (updateError) throw updateError;

      setProfile((prev) =>
        prev ? { ...prev, avatar_url: data.publicUrl } : null
      );

      setPreviewImage(null);
    } catch (err: any) {
      console.error("Avatar failed:", err);
      alert("Avatar update failed: " + (err.message || "Check console"));
    } finally {
      setUploadingAvatar(false);
    }
  }

  const displayName = useMemo(
    () => profile?.display_url || profile?.username || "Unnamed Collector",
    [profile]
  );

  const getTierIcon = (tier?: string | null) => {
    if (!tier) return null;
    const lower = tier.toLowerCase();

    if (lower.includes("bronze")) return "/tier-badges/bronze.png";
    if (lower.includes("silver")) return "/tier-badges/silver.png";
    if (lower.includes("gold")) return "/tier-badges/gold.png";
    if (lower.includes("diamond")) return "/tier-badges/diamond.png";
    if (lower.includes("founder")) return "/tier-badges/founder.png";

    return null;
  };

  const tierIconSrc = getTierIcon(profile?.tier);
  const isOwnProfile = currentUserId === userId;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <ProfileHeader />
        <div className="flex items-center justify-center h-[80vh] text-xl">
          Loading...
        </div>
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

            {/* AVATAR */}
            <div className="relative flex flex-col items-center justify-center mb-10">
              <div className="relative w-40 h-40">
                <img
                  src={previewImage || profile.avatar_url || "/default-avatar.png"}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-[30%] border-4 border-zinc-700 shadow-xl transition-opacity"
                />

                {isOwnProfile && (
                  <>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-[30%] cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="white"
                        viewBox="0 0 24 24"
                        width="40"
                        height="40"
                      >
                        <path d="M12 5c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm9-1h-3.17l-1.84-2H7.01L5.17 4H2v2h19V4z"/>
                      </svg>
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
                  className={`mt-6 px-8 py-3 rounded-full text-lg font-medium transition min-w-[140px] ${
                    isFollowing
                      ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-600"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500"
                  }`}
                >
                  {followLoading ? "…" : isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>

            {/* NAME */}
            {isOwnProfile && editMode ? (
              <input
                type="text"
                value={editedDisplayUrl}
                onChange={(e) => setEditedDisplayUrl(e.target.value)}
                placeholder="Display Name"
                className="text-4xl font-bold mb-4 bg-zinc-900 border border-zinc-700 rounded px-6 py-3 text-center w-full max-w-lg"
              />
            ) : (
              <h1 className="text-4xl font-bold mb-3">{displayName}</h1>
            )}

            {profile.username && (
              <p className="text-gray-400 text-2xl mb-6">@{profile.username}</p>
            )}

            {/* BIO */}
            {isOwnProfile && editMode ? (
              <textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="text-gray-300 text-xl mb-6 bg-zinc-900 border border-zinc-700 rounded px-6 py-4 w-full max-w-lg h-36 resize-none"
              />
            ) : (
              <p className="text-gray-300 text-xl mb-6 max-w-lg leading-relaxed">
                {profile.bio || "Collector of rare finds • Watches, cards, coins & more • Always chasing the next grail"}
              </p>
            )}

            {/* LOCATION */}
            {isOwnProfile && editMode ? (
              <input
                type="text"
                value={editedLocation}
                onChange={(e) => setEditedLocation(e.target.value)}
                placeholder="Location"
                className="text-gray-400 text-xl bg-zinc-900 border border-zinc-700 rounded px-6 py-3 text-center w-full max-w-lg mb-6"
              />
            ) : (
              <p className="text-gray-400 text-xl mb-6">
                {profile.location || "Swindon, UK"}
              </p>
            )}

            {/* TIER */}
            <div className="flex items-center gap-4 mb-8">
              {isOwnProfile && editMode ? (
                <div className="w-full max-w-lg">
                  <label className="block text-gray-400 text-xl mb-3">
                    Collector Tier
                  </label>
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
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
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

            {/* EDIT / SAVE BUTTONS */}
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
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold">{profile.items_count ?? 0}</p>
              <p className="text-gray-500 text-xl mt-3">Items</p>
            </div>
            <div>
              <p className="text-5xl font-bold">{profile.collections_count ?? 0}</p>
              <p className="text-gray-500 text-xl mt-3">Categories</p>
            </div>
            <div>
              <p className="text-5xl font-bold">90.8</p>
              <p className="text-gray-500 text-xl mt-3">Rarity</p>
            </div>
            <div>
              <p className="text-5xl font-bold">{profile.followers_count ?? 0}</p>
              <p className="text-gray-500 text-xl mt-3">Followers</p>
            </div>
            <div>
              <p className="text-5xl font-bold">{profile.following_count ?? 0}</p>
              <p className="text-gray-500 text-xl mt-3">Following</p>
            </div>
            <div>
              <p className="text-5xl font-bold">£{profile.vault_value ?? 0}</p>
              <p className="text-gray-500 text-xl mt-3">Vault Value</p>
            </div>
            <div>
              <p className="text-5xl font-bold">{profile.likes_count ?? 0}</p>
              <p className="text-gray-500 text-xl mt-3">Likes</p>
            </div>
          </div>
        </section>

        {/* COLLECTIONS */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-lg shadow-black/30">
          <h2 className="text-4xl font-bold mb-8 text-center">Collections</h2>

          <div className="flex justify-center mb-6">
            <button
              onClick={() => router.push("/collections/create")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-lg font-medium transition"
            >
              + Add Collection
            </button>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {collections.length === 0 && (
              <p className="text-gray-500 text-xl">No collections yet</p>
            )}

            {collections.map((col) => (
              <button
                key={col.id}
                onClick={() => router.push(`/collections/${col.id}/add-item`)}
                className="min-w-[180px] h-[120px] bg-zinc-900/70 border border-zinc-700 rounded-xl flex items-center justify-center text-xl font-medium hover:bg-zinc-800 hover:border-zinc-500 transition"
              >
                {col.title}
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

/* HEADER remains unchanged */
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            color: "white",
          }}
        >
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
            {/* Instagram SVG */}
            <svg width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>

          {/* Facebook, eBay, Discord, Whatnot, X icons remain the same */}
          {/* ... (omitted for brevity — keep your original social icons here) */}
        </div>
      </header>

      <div style={{ height: 56 }} />
    </>
  );
}
