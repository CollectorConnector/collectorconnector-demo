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
  profiles: { username: string | null };
};

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

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

  // Load logged-in user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  // Load profile
  useEffect(() => {
    if (!userId) return;

    async function loadProfile() {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
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

  // Load collections
  useEffect(() => {
    if (!userId) return;

    supabase
      .from("collections")
      .select("id, title, cover_url, item_count")
      .eq("user_id", userId)
      .then(({ data }) => setCollections(data || []));
  }, [userId]);

  // Load community feed
  useEffect(() => {
    supabase
      .from("items")
      .select("id, name, image_url, created_at, profiles!user_id_fkey(username)")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (!data) return setRecentDrops([]);

        const cleaned = data.map((drop: any) => ({
          id: drop.id,
          name: drop.name,
          image_url: drop.image_url,
          created_at: drop.created_at,
          profiles: {
            username: drop.profiles?.[0]?.username || null,
          },
        }));

        setRecentDrops(cleaned);
      });
  }, []);

  // Follow check
  useEffect(() => {
    if (!currentUserId || currentUserId === userId) return;

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

  // Resize image
  async function resizeImage(file: File, maxSize: number) {
    return new Promise<File>((resolve) => {
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
          (blob) =>
            resolve(blob ? new File([blob], file.name, { type: file.type }) : file),
          file.type,
          0.85
        );
      };
    });
  }

  // Avatar upload
  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentUserId) return;

    setUploadingAvatar(true);

    const resized = await resizeImage(file, 256);
    const ext = file.name.split(".").pop();
    const path = `${currentUserId}/avatar-${Date.now()}.${ext}`;

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

  // Save profile changes
  async function saveProfile() {
    if (!currentUserId) return;

    const updates = {
      display_url: editedDisplayUrl || null,
      bio: editedBio || null,
      location: editedLocation || null,
      tier: editedTier || null,
    };

    await supabase.from("profiles").update(updates).eq("id", currentUserId);

    setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
    setEditMode(false);
  }

  // Display name
  const displayName = useMemo(() => {
    return profile?.display_url || profile?.username || "Collector";
  }, [profile]);

  // Header FIXED ✅
  function Header() {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 h-14 bg-black border-b border-zinc-800 z-50 px-4 flex items-center justify-between">
          <img
            src="/CC-main-logo.png"
            alt="Collector Connector"
            className="h-10 object-contain"
          />

          <button
            onClick={() => router.push("/search")}
            className="text-white text-xl"
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Header />
        Loading...
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Header />
        Profile not found
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="pt-8 pb-20 max-w-[720px] mx-auto px-4 space-y-10">

        {/* PROFILE CARD */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-xl text-center">
          <div className="mb-6">
            {isOwnProfile ? (
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <img
                  src={previewImage || profile.avatar_url || "/default-avatar.png"}
                  className="w-16 h-16 border border-zinc-700 rounded-xl object-cover"
                />
              </label>
            ) : (
              <img
                src={profile.avatar_url || "/default-avatar.png"}
                className="w-16 h-16 border border-zinc-700 rounded-xl object-cover"
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

          {/* Display name */}
          {editMode ? (
            <input
              value={editedDisplayUrl}
              onChange={(e) => setEditedDisplayUrl(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xl font-bold text-center w-full max-w-xs mx-auto"
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
              value={editedBio}
              onChange={(e) => setEditedBio(e.target.value)}
              className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded px-4 py-3 mt-4"
            />
          ) : (
            <p className="text-zinc-300 mt-4">
              {profile.bio || "This collector hasn't written a bio yet."}
            </p>
          )}

          {/* Location */}
          {editMode ? (
            <input
              value={editedLocation}
              onChange={(e) => setEditedLocation(e.target.value)}
              className="mt-3 bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
            />
          ) : (
            profile.location && (
              <p className="text-zinc-400 mt-2">{profile.location}</p>
            )
          )}

          {/* Buttons */}
          <div className="flex gap-4 justify-center mt-6">
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

          {/* Suggested collectors (fixed no avatars) */}
          <div className="mt-10">
            <SuggestedUsers />
          </div>
        </section>

        {/* STATS */}
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

        {/* COLLECTIONS — FIXED ✅ horizontal */}
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

          <div
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide"
            style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}
          >
            <CollectionsCarousel collections={collections} />
          </div>
        </section>

        {/* COMMUNITY FEED */}
        <section className="bg-zinc-950 p-10 rounded-2xl border border-zinc-800 shadow-xl">
          <h2 className="text-3xl font-bold mb-6 text-center">Live from the Community</h2>

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
                    @{drop.profiles.username || "collector"}
                  </p>
                  <p className="text-zinc-400 text-xs">{drop.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LOGOUT BUTTON */}
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
