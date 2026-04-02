"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ImportInstagramModal from "@/components/ImportInstagramModal";
import Footer from "@/components/Footer";
import SuggestedUsers from "@/components/SuggestedUsers";

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

type Collection = {
  id: string;
  title: string;
  nichem: string;
  cover_url: string | null;
  item_count: number | null;
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

  const [collections, setCollections] = useState<Collection[]>([]);
  const [recentDrops, setRecentDrops] = useState<RecentDrop[]>([]);

  // Load current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) =>
      setCurrentUserId(data.user?.id || null)
    );
  }, []);

  const isOwnProfile = currentUserId === userId;

  // Load collections
  useEffect(() => {
    if (!userId) return;
    async function loadCollections() {
      const { data } = await supabase
        .from("collections")
        .select("id, title, nichem, cover_url, item_count")
        .eq("user_id", userId);
      if (data) setCollections(data as Collection[]);
    }
    loadCollections();
  }, [userId]);

  // Load recent drops
  useEffect(() => {
    async function loadRecentDrops() {
      const { data } = await supabase
        .from("items")
        .select(
          `id, name, image_url, created_at, profiles!user_id_fkey (username)`
        )
        .order("created_at", { ascending: false })
        .limit(6);

      if (!data) return setRecentDrops([]);

      const cleaned = data.map((drop: any) => ({
        id: drop.id,
        name: drop.name,
        image_url: drop.image_url,
        created_at: drop.created_at,
        profiles: { username: drop.profiles?.[0]?.username || null }
      }));

      setRecentDrops(cleaned);
    }
    loadRecentDrops();
  }, []);

  // Load profile
  useEffect(() => {
    if (!userId) return;

    async function loadData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error || !data) {
          if (isOwnProfile) {
            router.replace("/onboarding/step1");
            return;
          }
          setError("Profile not found");
          return;
        }

        setProfile(data as Profile);

        if (data && isOwnProfile) {
          setEditedDisplayUrl(data.display_url || "");
          setEditedBio(data.bio || "");
          setEditedLocation(data.location || "");
          setEditedTier(data.tier || "");
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId, router, isOwnProfile]);

  // Follow logic
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
    if (!currentUserId || currentUserId === userId || followLoading) return;
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

  // Avatar resize & upload
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
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) =>
            resolve(blob ? new File([blob], file.name, { type: file.type }) : file),
          file.type,
          0.85
        );
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
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `avatar-${timestamp}.${ext}`;
      const filePath = `${currentUserId}/${fileName}`;

      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, resizedFile, {
          upsert: true,
          cacheControl: "31536000"
        });

      if (error) throw error;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", currentUserId);

      setProfile((prev) =>
        prev ? { ...prev, avatar_url: data.publicUrl } : prev
      );
      setPreviewImage(data.publicUrl);
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
        tier: editedTier || null
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", currentUserId);

      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
      setEditMode(false);
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
    const t = tier.toLowerCase();
    if (t.includes("bronze")) return "/bronze.png";
    if (t.includes("silver")) return "/silver.png";
    if (t.includes("gold")) return "/gold.png";
    if (t.includes("diamond")) return "/diamond.png";
    if (t.includes("founder")) return "/founder.png";
    return null;
  };

  const tierIconSrc = getTierIcon(profile?.tier);

  // ✅ ✅ ✅ FIXED HEADER (your original)
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
            padding: "0 16px"
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
              color: "white"
            }}
          >
            {/* Search */}
            <button
              onClick={() => router.push("/search")}
              className="hover:scale-110 transition-transform p-2"
              aria-label="Search"
            >
              <svg
                width="26"
                height="26"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 01-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition-transform"
            >
              <svg width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 ... " />
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
                <path d="M22 12c0-5.523-4.477-10..." />
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
                <path d="M20.317 4.3698a19.7913... " />
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
                <path d="M28 64c0-8.8 7.2-16..." />
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
                <path d="M18.244 2.25h3.308..." />
              </svg>
            </a>
          </div>
        </header>

        <div style={{ height: 56 }} />
      </>
    );
  }

  // ✅ RENDER
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <ProfileHeader />
        <div className="flex items-center justify-center h-[80vh]">Loading...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-white">
        <ProfileHeader />
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <h1 className="text-3xl mb-4">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ProfileHeader />

      <main className="pt-8 pb-20 space-y-10 max-w-[720px] mx-auto px-4">

        {/* ✅ PROFILE CARD */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-lg shadow-black/30">
          <div className="flex flex-col items-center text-center">

            {/* ✅ SQUIRCLE AVATAR */}
            <div className="relative mb-8">
              {isOwnProfile ? (
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <img
                    src={previewImage || profile.avatar_url || "/default-avatar.png"}
                    alt="Avatar"
                    className="w-20 h-20 object-cover border-2 border-white shadow-md"
                    style={{ borderRadius: "14%" }}
                  />
                </label>
              ) : (
                <img
                  src={profile.avatar_url || "/default-avatar.png"}
                  alt="Avatar"
                  className="w-20 h-20 object-cover border-2 border-white shadow-md"
                  style={{ borderRadius: "14%" }}
                />
              )}
            </div>

            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={uploadingAvatar}
            />

            {/* ✅ NAME */}
            {isOwnProfile && editMode ? (
              <input
                type="text"
                value={editedDisplayUrl}
                onChange={(e) => setEditedDisplayUrl(e.target.value)}
                className="text-4xl font-bold mb-4 bg-zinc-900 border border-zinc-700 rounded px-6 py-3 text-center w-full max-w-lg"
              />
            ) : (
              <h1 className="text-4xl font-bold">{displayName}</h1>
            )}

            {/* ✅ USERNAME */}
            {profile.username && (
              <p className="text-indigo-400 text-2xl mb-6">@{profile.username}</p>
            )}

            {/* ✅ BIO */}
            {isOwnProfile && editMode ? (
              <textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                className="text-gray-300 text-xl mb-6 bg-zinc-900 border border-zinc-700 rounded px-6 py-4 w-full max-w-lg h-36 resize-none"
              />
            ) : (
              <p className="text-gray-300 text-xl mb-6 max-w-lg leading-relaxed">
                {profile.bio || "This collector hasn’t written a bio yet."}
              </p>
            )}

            {/* ✅ LOCATION */}
            {profile.location && (
              <p className="text-gray-400 text-xl mb-6">{profile.location}</p>
            )}

            {/* ✅ TIER */}
            <div className="flex items-center gap-4 mb-8">
              {tierIconSrc && (
                <img
                  src={tierIconSrc}
                  alt={`${profile.tier} tier`}
                  className="w-14 h-14 object-contain"
                />
              )}
              {profile.tier && (
                <p className="text-indigo-400 text-2xl font-medium">
                  Tier: {profile.tier}
                </p>
              )}
            </div>

            {/* ✅ BUTTONS */}
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
                    {followLoading ? "Loading..." : isFollowing ? "Unfollow" : "Follow"}
                  </button>
                )
              )}
            </div>
          </div>

          <SuggestedUsers />
        </section>

        {/* ✅ LIVE STATS */}
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
            <div
              onClick={() => router.push(`/profile/${userId}/followers`)}
              className="cursor-pointer hover:text-indigo-400 transition"
            >
              <p className="text-5xl font-bold">{profile.followers_count ?? 0}</p>
              <p className="text-gray-500 text-xl mt-3">Followers</p>
            </div>
            <div
              onClick={() => router.push(`/profile/${userId}/following`)}
              className="cursor-pointer hover:text-indigo-400 transition"
            >
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

        {/* ✅ COLLECTIONS CAROUSEL */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-lg shadow-black/30">
          <h2 className="text-4xl font-bold mb-8 text-center">My Collections 🎴</h2>

          {isOwnProfile && (
            <div className="flex justify-center mb-8">
              <button
                onClick={() => router.push("/collections/create")}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-lg font-medium transition"
              >
                + Add New Collection
              </button>
            </div>
          )}

          {collections.length === 0 ? (
            <p className="text-center text-zinc-500 text-xl py-12">
              No collections yet. Create your first one above!
            </p>
          ) : (
            <div
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
              style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}
            >
              {collections.map((col) => (
                <div
                  key={col.id}
                  onClick={() => router.push(`/collections/${col.id}`)}
                  className="relative w-48 h-64 flex-shrink-0 snap-center rounded-2xl overflow-hidden cursor-pointer group"
                >
                  <img
                    src={col.cover_url || "/CC-main-logo.png"}
                    alt={col.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                    {col.item_count || 0}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white text-lg font-semibold tracking-tight line-clamp-1">
                      {col.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ✅ COMMUNITY FEED */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-lg shadow-black/30">
          <h2 className="text-4xl font-bold mb-8 text-center">Live from the Community</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {recentDrops.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-zinc-500 text-xl">No drops yet — be the first!</p>
              </div>
            ) : (
              recentDrops.map((drop) => (
                <div
                  key={drop.id}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition cursor-pointer"
                  onClick={() => router.push(`/items/${drop.id}`)}
                >
                  <img
                    src={drop.image_url || "/default-item.png"}
                    alt={drop.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4">
                    <p className="text-white text-sm font-medium">
                      @{drop.profiles?.username || "collector"}
                    </p>
                    <p className="text-zinc-400 text-xs mt-1 line-clamp-1">
                      {drop.name}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

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
