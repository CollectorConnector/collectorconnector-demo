"use client";

import { useEffect, useMemo, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ImportInstagramModal from "@/components/ImportInstagramModal";
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

type RecentDrop = {
  id: string;
  name: string;
  image_url: string | null;
  created_at: string;
  profiles: { username: string | null } | null;
};

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Inline edit states
  const [editMode, setEditMode] = useState(false);
  const [editedDisplayUrl, setEditedDisplayUrl] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [editedLocation, setEditedLocation] = useState("");
  const [editedTier, setEditedTier] = useState("");
  const [saving, setSaving] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const [collections, setCollections] = useState<
    { id: string; title: string; nichem: string; cover_url: string | null; item_count: number | null }[]
  >([]);

  const [recentDrops, setRecentDrops] = useState<RecentDrop[]>([]);

  // Load collections
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

  // Load recent communal drops (live feed from any user)
  useEffect(() => {
    async function loadRecentDrops() {
      const { data, error } = await supabase
        .from("items")
        .select(`
          id,
          name,
          image_url,
          created_at,
          profiles!inner(user_id) (username)
        `)
        .order("created_at", { ascending: false })
        .limit(3);

      if (!error && data) {
        setRecentDrops(data as RecentDrop[]);
      }
    }
    loadRecentDrops();
  }, []);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  // Load profile
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
          setEditedTier(data.tier || "Diamond");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId, router, currentUserId]);

  // Check follow status
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

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);

      if (!urlData.publicUrl) throw new Error("No public URL – make sure avatars bucket is PUBLIC");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", currentUserId);

      if (updateError) throw updateError;

      setProfile((prev) => (prev ? { ...prev, avatar_url: urlData.publicUrl } : null));
      setPreviewImage(null); // Clear preview after successful save
      alert("Avatar updated successfully!");
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      alert("Avatar update failed: " + (err.message || "Check console"));
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
    () => profile?.display_url || profile?.username || "Stacy Pearce",
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
    return <div className="min-h-screen bg-black text-white"><ProfileHeader /><div className="flex items-center justify-center h-[80vh] text-xl">Loading...</div></div>;
  }

  if (error || !profile) {
    return <div className="min-h-screen bg-black text-white"><ProfileHeader /><div className="flex flex-col items-center justify-center h-[80vh]"><h1 className="text-3xl mb-4">Error</h1><p className="text-white/70">{error || "Profile not found"}</p></div></div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ProfileHeader />

      <main className="pt-8 pb-20 space-y-10 max-w-[720px] mx-auto px-4">
        {/* PROFILE BOX */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-lg shadow-black/30">
          <div className="flex flex-col items-center text-center">
            {/* CLEAN SQUIRCLE AVATAR */}
            <div className="relative flex items-center justify-center gap-10 mb-10 group">
              <div className="relative w-48 h-48">
                <img
                  src={previewImage || profile.avatar_url || "/default-avatar.png"}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-[30%] border-4 border-zinc-700 shadow-2xl"
                />

                {isOwnProfile && (
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-[30%] cursor-pointer transition-all"
                  >
                    <div className="absolute bottom-3 right-3 bg-zinc-900 hover:bg-zinc-800 p-2 rounded-2xl shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" width="28" height="28">
                        <path d="M12 5c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm9-1h-3.17l-1.84-2H7.01L5.17 4H2v2h19V4z" />
                      </svg>
                    </div>
                  </label>
                )}

                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPreviewImage(URL.createObjectURL(file));
                      handleAvatarChange(e);
                    }
                  }}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
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
                className="text-4xl font-bold mb-4 bg-zinc-900 border border-zinc-700 rounded px-6 py-3 text-center w-full max-w-lg"
              />
            ) : (
              <h1 className="text-4xl font-bold mb-3">{displayName}</h1>
            )}

            {profile.username && <p className="text-indigo-400 text-2xl mb-6">@CollectorConnector CEO</p>}

            {isOwnProfile && editMode ? (
              <textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                className="text-gray-300 text-xl mb-6 bg-zinc-900 border border-zinc-700 rounded px-6 py-4 w-full max-w-lg h-36 resize-none"
              />
            ) : (
              <p className="text-gray-300 text-xl mb-6 max-w-lg leading-relaxed">
                {profile.bio || "Building the ultimate home for collectors worldwide. I collect watches, cards, coins, sneakers, art & more — and I love connecting with fellow enthusiasts."}
              </p>
            )}

            {isOwnProfile && editMode ? (
              <input
                type="text"
                value={editedLocation}
                onChange={(e) => setEditedLocation(e.target.value)}
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
                      <img src={tierIconSrc} alt={`${profile.tier} tier`} className="w-14 h-14 object-contain" />
                    ) : (
                      <span className="text-4xl">🏆</span>
                    )}
                    <p className="text-indigo-400 text-2xl font-medium">Tier: {profile.tier}</p>
                  </div>
                )
              )}
            </div>

            {isOwnProfile && (
              <div className="mt-10 flex gap-6 flex-wrap justify-center">
                {editMode ? (
                  <>
                    <button onClick={saveProfileChanges} disabled={saving} className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-full text-xl font-medium transition disabled:opacity-50 min-w-[200px]">
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button onClick={() => setEditMode(false)} className="px-12 py-5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-full text-xl font-medium transition min-w-[200px]">
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditMode(true)} className="px-14 py-5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-full text-xl font-medium transition shadow-xl">
                    Edit Profile
                  </button>
                )}
                <button onClick={() => setShowImportModal(true)} className="px-6 py-3 bg-pink-600 rounded-full text-white">
                  Import from Instagram
                </button>
              </div>
            )}
          </div>
        </section>

        {showImportModal && <ImportInstagramModal onClose={() => setShowImportModal(false)} />}

        {/* STATS - Rarity removed */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-lg shadow-black/30">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold">{profile.items_count ?? 0}</p>
              <p className="text-gray-500 text-xl mt-3">Items</p>
            </div>
            <div>
              <p className="text-5xl font-bold">{profile.collections_count ?? 0}</p>
              <p className="text-gray-500 text-xl mt-3">Collections</p>
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
            <button onClick={() => router.push("/collections/create")} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-lg font-medium transition">
              + Add Collection
            </button>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {collections.length === 0 && <p className="text-gray-500 text-xl">No collections yet</p>}
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

        {/* COMMUNAL LIVE FEED - Recent Drops */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-lg shadow-black/30">
          <h2 className="text-4xl font-bold mb-8 text-center">Recent Drops</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-10">
            {recentDrops.length === 0 ? (
              <p className="text-gray-500 col-span-3 text-center">No drops yet — be the first to share!</p>
            ) : (
              recentDrops.map((drop) => (
                <div key={drop.id} className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 group">
                  <img
                    src={drop.image_url || "/default-item.png"}
                    alt={drop.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-white text-sm">@{drop.profiles?.username || "collector"} just added this</p>
                  </div>
                </div>
              ))
            )}
          </div>
          {recentDrops[0] && (
            <div className="text-center text-lg text-gray-400">
              Live from the Collector Connector community
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* HEADER – unchanged from your original */
function ProfileHeader() {
  return (
    <>
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "#000", borderBottom: "1px solid #1f1f1f", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
        <img src="/CC-main-logo.png" alt="Collector Connector" width={130} height={130} style={{ objectFit: "contain" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 20, color: "white" }}>
          {/* Your existing social icons here – Instagram, Facebook, eBay, Discord, Whatnot, X */}
          {/* (copy from your original code) */}
        </div>
      </header>
      <div style={{ height: 56 }} />
    </>
  );
}
