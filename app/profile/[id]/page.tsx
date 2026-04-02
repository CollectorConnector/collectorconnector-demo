"use client";

import { useEffect, useMemo, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Components
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
  profiles: { username: string | null } | null;
};

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  // State
  const [profile, setProfile] = useState<Profile | null>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [recentDrops, setRecentDrops] = useState<RecentDrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const [editedDisplayUrl, setEditedDisplayUrl] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [editedLocation, setEditedLocation] = useState("");
  const [editedTier, setEditedTier] = useState("");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const isOwnProfile = currentUserId === userId;

  // Load current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  // Load profile
  useEffect(() => {
    if (!userId) return;

    async function getProfile() {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error(error);
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

    getProfile();
  }, [userId, isOwnProfile]);

  // Load collections
  useEffect(() => {
    if (!userId) return;

    supabase
      .from("collections")
      .select("id, title, cover_url, item_count")
      .eq("user_id", userId)
      .then(({ data }) => {
        setCollections(data || []);
      });
  }, [userId]);

  // Load community drops
  useEffect(() => {
    supabase
      .from("items")
      .select(`id, name, image_url, created_at, profiles!user_id_fkey(username)`)
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => setRecentDrops(data as RecentDrop[]));
  }, []);

  // Check follow state
  useEffect(() => {
    if (!currentUserId || !userId || currentUserId === userId) return;

    supabase
      .from("follows")
      .select("*")
      .eq("follower_id", currentUserId)
      .eq("following_id", userId)
      .maybeSingle()
      .then(({ data }) => setIsFollowing(!!data));
  }, [currentUserId, userId]);

  // Follow/unfollow
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
      await supabase.from("follows").insert({
        follower_id: currentUserId,
        following_id: userId,
      });
      setIsFollowing(true);
    }

    setFollowLoading(false);
  }

  // Resize + upload avatar
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

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type }));
            } else resolve(file);
          },
          file.type,
          0.85
        );
      };
    });
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentUserId) return;

    setUploadingAvatar(true);

    const resized = await resizeImage(file, 256);
    const timestamp = Date.now();
    const ext = file.name.split(".").pop();
    const path = `${currentUserId}/avatar-${timestamp}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, resized, { upsert: true });

    if (uploadError) {
      alert("Upload failed.");
      setUploadingAvatar(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = data.publicUrl;

    await supabase.from("profiles").update({ avatar_url: url }).eq("id", currentUserId);

    setProfile((prev) => (prev ? { ...prev, avatar_url: url } : prev));
    setPreviewImage(url);

    setUploadingAvatar(false);
  }

  // Save profile edits
  async function saveProfile() {
    if (!currentUserId) return;

    const updates = {
      display_url: editedDisplayUrl.trim() || null,
      bio: editedBio.trim() || null,
      location: editedLocation.trim() || null,
      tier: editedTier.trim() || null,
    };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", currentUserId);

    if (error) {
      alert("Save failed");
      return;
    }

    setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
    setEditMode(false);
  }

  // Display name
  const displayName = useMemo(() => {
    return profile?.display_url || profile?.username || "Collector";
  }, [profile]);

  // Header
  function Header() {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 h-14 bg-black border-b border-zinc-800 z-50 flex items-center justify-between px-4">
          <img src="/CC-main-logo.png" alt="logo" className="h-10 object-contain" />

          <button
            onClick={() => router.push("/search")}
            className="text-white hover:text-indigo-400 transition"
          >
            🔍
          </button>
        </header>
        <div className="h-14" />
      </>
    );
  }

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="flex items-center justify-center h-[80vh]">Loading...</div>
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="flex items-center justify-center h-[80vh]">Profile not found</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="pt-8 pb-20 max-w-[720px] mx-auto px-4 space-y-10">
        {/* Profile card */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-xl">
          <div className="flex flex-col items-center text-center">

            {/* Avatar */}
            <div className="mb-6">
              {isOwnProfile ? (
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <img
                    src={previewImage || profile.avatar_url || "/default-avatar.png"}
                    alt="avatar"
                    className="w-16 h-16 object-cover border-2 border-white rounded-xl shadow"
                  />
                </label>
              ) : (
                <img
                  src={profile.avatar_url || "/default-avatar.png"}
                  className="w-16 h-16 object-cover border-2 border-white rounded-xl shadow"
                />
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
                className="text-3xl font-bold bg-zinc-900 border border-zinc-700 rounded px-4 py-2 w-full max-w-xs mb-4"
                value={editedDisplayUrl}
                onChange={(e) => setEditedDisplayUrl(e.target.value)}
              />
            ) : (
              <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
            )}

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
                {profile.bio || "This collector hasn’t written a bio yet."}
              </p>
            )}

            {/* Location */}
            {editMode ? (
              <input
                className="mt-4 bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
                value={editedLocation}
                onChange={(e) => setEditedLocation(e.target.value)}
              />
            ) : (
              profile.location && (
                <p className="text-zinc-400 mt-2">{profile.location}</p>
              )
            )}

            {/* Buttons */}
            <div className="flex gap-4 mt-6">
              {isOwnProfile ? (
                editMode ? (
                  <>
                    <button
                      onClick={saveProfile}
                      className="px-8 py-3 bg-indigo-600 rounded-xl text-lg"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-8 py-3 bg-zinc-700 rounded-xl text-lg"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-8 py-3 bg-zinc-700 rounded-xl text-lg"
                  >
                    Edit Profile
                  </button>
                )
              ) : (
                <button
                  onClick={toggleFollow}
                  disabled={followLoading}
                  className="px-8 py-3 bg-indigo-600 rounded-xl text-lg"
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>

            {/* Suggested Collectors */}
            <div className="mt-10 w-full">
              <SuggestedUsers />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-zinc-950 p-10 rounded-2xl border border-zinc-800 shadow-xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-4xl font-bold">{profile.items_count ?? 0}</p>
              <p className="text-zinc-500">Items</p>
            </div>

            <div>
              <p className="text-4xl font-bold">{profile.collections_count ?? 0}</p>
              <p className="text-zinc-500">Collections</p>
            </div>

            <div
              className="cursor-pointer"
              onClick={() => router.push(`/profile/${userId}/followers`)}
            >
              <p className="text-4xl font-bold">{profile.followers_count ?? 0}</p>
              <p className="text-zinc-500">Followers</p>
            </div>

            <div
              className="cursor-pointer"
              onClick={() => router.push(`/profile/${userId}/following`)}
            >
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
          </div>
        </section>

        {/* Collections */}
        <section className="bg-zinc-950 p-10 rounded-2xl border border-zinc-800 shadow-xl">
          <h2 className="text-3xl font-bold mb-6 text-center">My Collections 🎴</h2>

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

        {/* Community Feed */}
        <section className="bg-zinc-950 p-10 rounded-2xl border border-zinc-800 shadow-xl">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Live from the Community
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {recentDrops.map((drop) => (
              <div
                key={drop.id}
                onClick={() => router.push(`/items/${drop.id}`)}
                className="group relative aspect-square rounded-xl overflow-hidden border border-zinc-700 cursor-pointer"
              >
                <img
                  src={drop.image_url || "/default-item.png"}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />

                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                  <p className="text-white text-sm">
                    @{drop.profiles?.username || "collector"}
                  </p>
                  <p className="text-zinc-400 text-xs">{drop.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {isOwnProfile && (
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/auth/login");
            }}
            className="w-full py-4 bg-red-600 rounded-xl text-xl mt-4"
          >
            Log Out
          </button>
        )}
      </main>

      <Footer />
    </div>
  );
}
