"use client";

import { useEffect, useMemo, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import CollectionsCarousel from "@/components/CollectionsCarousel";
import SuggestedUsers from "@/components/SuggestedUsers";
import Footer from "@/components/Footer";

// Types
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
  profiles: { username: string | null };
};

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [recentDrops, setRecentDrops] = useState<RecentDrop[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editedDisplayUrl, setEditedDisplayUrl] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [editedLocation, setEditedLocation] = useState("");
  const [editedTier, setEditedTier] = useState("");

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const isOwnProfile = currentUserId === userId;

  // ✅ Load logged-in user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  // ✅ Load profile
  useEffect(() => {
    if (!userId) return;

    async function loadProfile() {
      setLoading(true);

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!data) {
        setLoading(false);
        return;
      }

      setProfile(data);

      if (isOwnProfile) {
        setEditedDisplayUrl(data.display_url || "");
        setEditedBio(data.bio || "");
        setEditedLocation(data.location || "");
        setEditedTier(data.tier || "");
      }

      setLoading(false);
    }

    loadProfile();
  }, [userId, isOwnProfile]);

  // ✅ Load collections
  useEffect(() => {
    if (!userId) return;

    supabase
      .from("collections")
      .select("id, title, cover_url, item_count")
      .eq("user_id", userId)
      .then(({ data }) => setCollections(data || []));
  }, [userId]);

  // ✅ Load community feed (cleaned + fixed)
  useEffect(() => {
    supabase
      .from("items")
      .select(
        "id, name, image_url, created_at, profiles!user_id_fkey(username)"
      )
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (!data) return setRecentDrops([]);

        const cleaned = data.map((drop: any) => ({
          id: drop.id,
          name: drop.name,
          image_url: drop.image_url,
          created_at: drop.created_at,
          profiles: { username: drop.profiles?.[0]?.username || null }
        }));

        setRecentDrops(cleaned);
      });
  }, []);

  // ✅ Follow check
  useEffect(() => {
    if (!currentUserId || userId === currentUserId) return;

    supabase
      .from("follows")
      .select("*")
      .eq("follower_id", currentUserId)
      .eq("following_id", userId)
      .maybeSingle()
      .then(({ data }) => setIsFollowing(!!data));
  }, [currentUserId, userId]);

  // ✅ Follow/unfollow
  async function toggleFollow() {
    if (!currentUserId || currentUserId === userId) return;

    setFollowLoading(true);

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

    setFollowLoading(false);
  }

  // ✅ Resize image before uploading
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
          (blob) => resolve(blob ? new File([blob], file.name) : file),
          file.type,
          0.85
        );
      };
    });
  }

  // ✅ Avatar upload
  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentUserId) return;

    setUploadingAvatar(true);

    const resized = await resizeImage(file, 256);
    const ext = file.name.split(".").pop();
    const path = `${currentUserId}/avatar-${Date.now()}.${ext}`;

    await supabase.storage.from("avatars").upload(path, resized, {
      upsert: true
    });

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = data.publicUrl;

    await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("id", currentUserId);

    setProfile((prev) => (prev ? { ...prev, avatar_url: url } : prev));
    setPreviewImage(url);

    setUploadingAvatar(false);
  }

  // ✅ Save profile edits
  async function saveProfile() {
    if (!currentUserId) return;

    const updates = {
      display_url: editedDisplayUrl || null,
      bio: editedBio || null,
      location: editedLocation || null,
      tier: editedTier || null
    };

    await supabase.from("profiles").update(updates).eq("id", currentUserId);

    setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
    setEditMode(false);
  }

  const displayName = useMemo(
    () => profile?.display_url || profile?.username || "Collector",
    [profile]
  );

  // ✅ ✅ ✅ FULLY RESTORED HEADER WITH ALL ICONS ✅ ✅ ✅
  function Header() {
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
          /CC-main-logo.png

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
            https://instagram.com

            {/* Facebook */}
            https://facebook.com

            {/* eBay */}
            https://ebay.com

            {/* Discord */}
            https://discord.com

            {/* Whatnot */}
            https://whatnot.com

            {/* X */}
            https://twitter.com
          </div>
        </header>

        <div style={{ height: 56 }} />
      </>
    );
  }

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="flex justify-center items-center h-[80vh]">
          Loading...
        </div>
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="flex justify-center items-center h-[80vh]">
          Profile not found
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="pt-8 pb-20 max-w-[720px] mx-auto px-4 space-y-10">
        {/* PROFILE CARD */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-xl text-center">
          {/* Avatar */}
          <div className="mb-6">
            {isOwnProfile ? (
              <label htmlFor="avatar-upload" className="cursor-pointer">
                {previewImage
              </label>
            ) : (
              {profile.avatar_url
            )}
          </div>

          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />

          {/* Name */}
          {editMode ? (
            <input
              className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xl font-bold text-center w-full max-w-xs mx-auto"
              value={editedDisplayUrl}
              onChange={(e) => setEditedDisplayUrl(e.target.value)}
            />
          ) : (
            <h1 className="text-3xl font-bold">{displayName}</h1>
          )}

          {/* Username */}
          {profile.username && (
            <p className="text-indigo-400 text-xl">@{profile.username}</p>
          )}

          {/* Bio */}
          {editMode ? (
            <textarea
              className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded px-4 py-3 mt-4"
              value={editedBio}
              onChange={(e) => setEditedBio(e.target.value)}
            />
          ) : (
            <p className="text-zinc-300 mt-4">
              {profile.bio || "This collector hasn't written a bio yet."}
            </p>
          )}

          {/* Location */}
          {editMode ? (
            <input
              className="mt-3 bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
              value={editedLocation}
              onChange={(e) => setEditedLocation(e.target.value)}
            />
          ) : (
            profile.location && (
              <p className="text-zinc-400 mt-2">{profile.location}</p>
            )
          )}

          {/* Edit / Follow buttons */}
          <div className="flex justify-center gap-4 mt-6">
            {isOwnProfile ? (
              editMode ? (
                <>
                  <button
                    onClick={saveProfile}
                    className="px-8 py-3 bg-indigo-600 rounded-xl"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-8 py-3 bg-zinc-700 rounded-xl"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-8 py-3 bg-zinc-700 rounded-xl"
                >
                  Edit Profile
                </button>
              )
            ) : (
              <button
                onClick={toggleFollow}
                disabled={followLoading}
                className="px-8 py-3 bg-indigo-600 rounded-xl"
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>

          {/* Suggested users */}
          <div className="mt-10">
            <SuggestedUsers />
          </div>
        </section>

        {/* STATS */}
        <section className="bg-zinc-950 p-10 rounded-2xl border border-zinc-800 shadow-xl text-center grid grid-cols-2 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-4xl font-bold">{profile.items_count ?? 0}</p>
            <p className="text-zinc-500">Items</p>
          </div>
          <div>
            <p className="text-4xl font-bold">{profile.collections_count ?? 0}</p>
            <p className="text-zinc-500">Collections</p>
          </div>
          <div onClick={() => router.push(`/profile/${userId}/followers`)}>
            <p className="text-4xl font-bold">{profile.followers_count ?? 0}</p>
            <p className="text-zinc-500">Followers</p>
          </div>
          <div onClick={() => router.push(`/profile/${userId}/following`)}>
            <p className="text-4xl font-bold">{profile.following_count ?? 0}</p>
            <p className="text-zinc-500">Following</p>
          </div>
          <div>
            <p className="text-4xl font-bold">£{profile.vault_value ?? 0}</p>
            <p className="text-zinc-500">Vault Value</p>
          </div>
          <div>
            <p className="text-4xl font-bold">{profile.likes_count ?? 0}</p>
            <p className="text-zinc-500">Likes</p>
          </div>
        </section>

        {/* ✅ FIXED HORIZONTAL COLLECTIONS CAROUSEL */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-xl">
          <h2 className="text-3xl font-bold mb-6 text-center">
            My Collections 🎴
          </h2>

          {isOwnProfile && (
            <div className="flex justify-center mb-6">
              <button
                onClick={() => router.push("/collections/create")}
                className="px-6 py-3 bg-blue-600 rounded-xl"
              >
                + Add New Collection
              </button>
            </div>
          )}

          <CollectionsCarousel collections={collections} />
        </section>

        {/* COMMUNITY FEED */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-xl">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Live from the Community
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {recentDrops.map((drop) => (
              <div
                key={drop.id}
                onClick={() => router.push(`/items/${drop.id}`)}
                className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 cursor-pointer"
              >
                <img
                  src={drop.image_url || "/default-item.png"}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />

                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                  <p className="text-white text-sm">
                    @{drop.profiles.username}
                  </p>
                  <p className="text-zinc-400 text-xs">{drop.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LOGOUT */}
        {isOwnProfile && (
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/auth/login");
            }}
            className="w-full py-4 bg-red-600 rounded-xl text-xl"
          >
            Log Out
          </button>
        )}
      </main>

      <Footer />
    </div>
  );
}
