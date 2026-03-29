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

  // Load current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  const isOwnProfile = currentUserId === userId;

  // Load collections for this profile
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

  // Load recent communal drops
  useEffect(() => {
    async function loadRecentDrops() {
      const { data, error } = await supabase
        .from("items")
        .select(`
          id, name, image_url, created_at,
          profiles!user_id_fkey (username)
        `)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        console.error("Failed to load recent drops:", error);
        return;
      }
      setRecentDrops((data as unknown as RecentDrop[]) || []);
    }
    loadRecentDrops();
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

        if (error || !data) {
          // If this is the logged-in user and they have no profile yet → onboarding
          if (isOwnProfile) {
            router.replace("/onboarding/step1");
            return;
          }

          // Otherwise, show not found
          setError("Profile not found");
          setProfile(null);
          return;
        }

        setProfile(data);

        if (data && isOwnProfile) {
          setEditedDisplayUrl(data.display_url || "");
          setEditedBio(data.bio || "");
          setEditedLocation(data.location || "");
          setEditedTier(data.tier || "");
        }
      } catch (err: any) {
        console.error("Profile load error:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId, router, isOwnProfile]);

  // Follow state
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

  async function resizeImage(file: File, maxSize: number): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: file.type }));
          } else {
            resolve(file);
          }
        }, file.type, 0.85);
      };
    });
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentUserId || currentUserId !== userId) return;

    setUploadingAvatar(true);
    try {
      const resizedFile = await resizeImage(file, 256);

      const timestamp = Date.now();
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `avatar-${timestamp}.${fileExt}`;
      const filePath = `${currentUserId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, resizedFile, {
          upsert: true,
          cacheControl: "31536000",
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) throw new Error("No public URL");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", currentUserId);

      if (updateError) throw updateError;

      setProfile((prev) =>
        prev ? { ...prev, avatar_url: urlData.publicUrl } : null
      );
      setPreviewImage(null);
      alert("Avatar updated successfully!");
    } catch (err: any) {
      console.error("Avatar failed:", err);
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
    () => profile?.display_url || profile?.username || "Collector",
    [profile]
  );

  const getTierIcon = (tier?: string | null) => {
    if (!tier) return null;
    const lower = tier.toLowerCase();
    if (lower.includes("bronze")) return "/bronze.png";
    if (lower.includes("silver")) return "/silver.png";
    if (lower.includes("gold")) return "/gold.png";
    if (lower.includes("diamond")) return "/diamond.png";
    if (lower.includes("founder")) return "/founder.png";
    return null;
  };

  const tierIconSrc = getTierIcon(profile?.tier);

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
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-lg shadow-black/30">
          <div className="flex flex-col items-center text-center">
            {/* SQUIRCLE AVATAR */}
            {isOwnProfile ? (
              <label
                htmlFor="avatar-upload"
                className="relative mb-8 cursor-pointer group"
              >
                <div className="mx-auto w-20 h-20 overflow-hidden rounded-[30%] border-4 border-zinc-700 shadow-2xl">
                  <img
                    src={
                      previewImage ||
                      profile.avatar_url ||
                      "/default-avatar.png"
                    }
                    alt="Avatar"
                    className="w-full h-full object-cover block"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 rounded-[30%] transition-all">
                  <span className="text-white text-xs font-medium">
                    Change Photo
                  </span>
                </div>
              </label>
            ) : (
              <div className="mb-8">
                <div className="mx-auto w-20 h-20 overflow-hidden rounded-[30%] border-4 border-zinc-700 shadow-2xl">
                  <img
                    src={
                      previewImage ||
                      profile.avatar_url ||
                      "/default-avatar.png"
                    }
                    alt="Avatar"
                    className="w-full h-full object-cover block"
                  />
                </div>
              </div>
            )}

            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={uploadingAvatar}
            />

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

            {/* Username line */}
            {profile.username && (
              <p className="text-indigo-400 text-2xl mb-6">
                @{profile.username}
              </p>
            )}

            {isOwnProfile && editMode ? (
              <textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                className="text-gray-300 text-xl mb-6 bg-zinc-900 border border-zinc-700 rounded px-6 py-4 w-full max-w-lg h-36 resize-none"
              />
            ) : (
              <p className="text-gray-300 text-xl mb-6 max-w-lg leading-relaxed">
                {profile.bio ||
                  "This collector hasn’t written a bio yet."}
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
              profile.location && (
                <p className="text-gray-400 text-xl mb-6">
                  {profile.location}
                </p>
              )
            )}

            <div className="flex items-center gap-4 mb-8">
              {profile.tier && (
                <div className="flex items-center gap-4">
                  {tierIconSrc ? (
                    <img
                      src={tierIconSrc}
                      alt={`${profile.tier} tier`}
                      className="w-14 h-14 object-contain"
                    />
                  ) : (
                    <span className="text-4xl">🏆</span>
                  )}
                  <p className="text-indigo-400 text-2xl font-medium">
                    Tier: {profile.tier}
                  </p>
                </div>
              )}
            </div>

            {/* Follow / Edit / Import */}
            <div className="mt-10 flex gap-6 flex-wrap justify-center">
              {isOwnProfile ? (
                editMode ? (
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
                  <>
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-14 py-5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-full text-xl font-medium transition shadow-xl"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="px-6 py-3 bg-pink-600 rounded-full text-white"
                    >
                      Import from Instagram
                    </button>
                  </>
                )
              ) : (
                currentUserId && (
                  <button
                    onClick={toggleFollow}
                    disabled={followLoading}
                    className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full text-lg font-medium transition disabled:opacity-50"
                  >
                    {followLoading
                      ? "Loading..."
                      : isFollowing
                      ? "Unfollow"
                      : "Follow"}
                  </button>
                )
              )}
            </div>
          </div>
        </section>

        {showImportModal && (
          <ImportInstagramModal onClose={() => setShowImportModal(false)} />
        )}

        {/* STATS */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-lg shadow-black/30">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold">
                {profile.items_count ?? 0}
              </p>
              <p className="text-gray-500 text-xl mt-3">Items</p>
            </div>
            <div>
              <p className="text-5xl font-bold">
                {profile.collections_count ?? 0}
              </p>
              <p className="text-gray-500 text-xl mt-3">Collections</p>
            </div>
            <div>
              <p className="text-5xl font-bold">
                {profile.followers_count ?? 0}
              </p>
              <p className="text-gray-500 text-xl mt-3">Followers</p>
            </div>
            <div>
              <p className="text-5xl font-bold">
                {profile.following_count ?? 0}
              </p>
              <p className="text-gray-500 text-xl mt-3">Following</p>
            </div>
            <div>
              <p className="text-5xl font-bold">
                £{profile.vault_value ?? 0}
              </p>
              <p className="text-gray-500 text-xl mt-3">Vault Value</p>
            </div>
            <div>
              <p className="text-5xl font-bold">
                {profile.likes_count ?? 0}
              </p>
              <p className="text-gray-500 text-xl mt-3">Likes</p>
            </div>
          </div>
        </section>

        {/* COLLECTIONS */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-lg shadow-black/30">
          <h2 className="text-4xl font-bold mb-8 text-center">Collections</h2>
          {isOwnProfile && (
            <div className="flex justify-center mb-6">
              <button
                onClick={() => router.push("/collections/create")}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-lg font-medium transition"
              >
                + Add Collection
              </button>
            </div>
          )}
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {collections.length === 0 && (
              <p className="text-gray-500 text-xl">
                No collections yet
              </p>
            )}
            {collections.map((col) => (
              <button
                key={col.id}
                onClick={() =>
                  router.push(`/collections/${col.id}/add-item`)
                }
                className="min-w-[180px] h-[120px] bg-zinc-900/70 border border-zinc-700 rounded-xl flex items-center justify-center text-xl font-medium hover:bg-zinc-800 hover:border-zinc-500 transition"
              >
                {col.title}
              </button>
            ))}
          </div>
        </section>

        {/* RECENT DROPS */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-lg shadow-black/30">
          <h2 className="text-4xl font-bold mb-8 text-center">
            Recent Drops
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-10">
            {recentDrops.length === 0 ? (
              <p className="text-gray-500 col-span-3 text-center">
                No drops yet — be the first to share something awesome!
              </p>
            ) : (
              recentDrops.map((drop) => (
                <div
                  key={drop.id}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 group"
                >
                  <img
                    src={drop.image_url || "/default-item.png"}
                    alt={drop.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-white text-sm">
                      @{drop.profiles?.username || "collector"} just
                      added this
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          {recentDrops.length > 0 && (
            <div className="text-center text-lg text-gray-400">
              Live from the Collector Connector community
            </div>
          )}
        </section>
      </main>

      {/* Logout button - only for own profile */}
      {isOwnProfile && (
        <div className="max-w-[720px] mx-auto px-4 pb-10">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/auth/login");
            }}
            className="w-full py-4 bg-red-600 hover:bg-red-500 rounded-xl text-white text-xl font-semibold transition"
          >
            Log Out
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}

/* HEADER with correct social icons */
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
          {/* Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform"
          >
            <svg width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform"
          >
            <svg width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.992 22 12z" />
            </svg>
          </a>

          {/* eBay */}
          <a
            href="https://ebay.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-bold tracking-wide hover:scale-110 transition-transform"
          >
            eBay
          </a>

          {/* Discord */}
          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform"
          >
            <svg width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3853-.3969-.8748-.6083-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8851 1.515.0699.0699 0 00-.032.0277C.5336 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0775.0105c.1202.099.246.1981.372.2914a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6061 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
            </svg>
          </a>

          {/* Whatnot */}
          <a
            href="https://whatnot.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform"
          >
            <svg width="26" height="26" viewBox="0 0 256 256" fill="currentColor">
              <path d="M28 64c0-8.8 7.2-16 16-16h168c8.8 0 16 7.2 16 16v80c0 8.8-7.2 16-16 16h-60l-24 32-24-32H44c-8.8 0-16-7.2-16-16V64z M128 96l40 40h-80l40-40z" />
            </svg>
          </a>

          {/* X */}
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform"
          >
            <svg width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </header>
      <div style={{ height: 56 }} />
    </>
  );
}
