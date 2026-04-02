"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import CollectionsCarousel from "@/components/CollectionsCarousel";
import SuggestedUsers from "@/components/SuggestedUsers";
import Footer from "@/components/Footer";

type Profile = {
  id: string;
  avatar_url: string | null;
  display_url: string | null;
  username: string | null;
  location: string | null;
  bio: string | null;
  tier: string | null;
  items_count: number | null;
  collections_count: number | null;
  followers_count: number | null;
  following_count: number | null;
  vault_value: number | null;
  likes_count: number | null;
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

  // Load current user
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

  // Load collections
  useEffect(() => {
    supabase
      .from("collections")
      .select("id, title, cover_url, item_count")
      .eq("user_id", userId)
      .then(({ data }) => setCollections(data || []));
  }, [userId]);

  // Load recent community drops
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
          profiles: { username: drop.profiles?.[0]?.username || null }
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
          (blob) => resolve(blob ? new File([blob], file.name) : file),
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
    const ext = file.name.split(".").pop();
    const path = `${currentUserId}/avatar-${Date.now()}.${ext}`;

    await supabase.storage
      .from("avatars")
      .upload(path, resized, { upsert: true });

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

  async function saveProfile() {
    if (!currentUserId) return;

    await supabase
      .from("profiles")
      .update({
        display_url: editedDisplayUrl,
        bio: editedBio,
        location: editedLocation,
        tier: editedTier
      })
      .eq("id", currentUserId);

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            display_url: editedDisplayUrl,
            bio: editedBio,
            location: editedLocation,
            tier: editedTier
          }
        : prev
    );

    setEditMode(false);
  }

  const displayName = useMemo(
    () => profile?.display_url || profile?.username || "Collector",
    [profile]
  );

  // ==================== FIXED HEADER ====================
  function Header() {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 h-14 bg-black border-b border-zinc-800 z-50 flex items-center justify-between px-4">
          <img
            src="/CC-main-logo.png"
            alt="Collector Connector"
            width={130}
            height={130}
            style={{ objectFit: "contain" }}
          />

          <div className="flex items-center gap-5 text-white">
            {/* Search */}
            <button
              onClick={() => router.push("/search")}
              className="hover:scale-110 transition p-2"
            >
              <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 01-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Instagram */}
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
              <svg width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            {/* Facebook */}
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
              <svg width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.992 22 12z" />
              </svg>
            </a>

            {/* eBay */}
            <a href="https://ebay.com" target="_blank" rel="noopener noreferrer" className="text-base font-bold tracking-wide hover:scale-110 transition">
              eBay
            </a>

            {/* Discord */}
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
              <svg width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3853-.3969-.8748-.6083-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8851 1.515.0699.0699 0 00-.032.0277C.5336 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0775.0105c.1202.099.246.1981.372.2914a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6061 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
            </a>

            {/* Whatnot */}
            <a href="https://whatnot.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
              <svg width="26" height="26" viewBox="0 0 256 256" fill="currentColor">
                <path d="M28 64c0-8.8 7.2-16 16-16h168c8.8 0 16 7.2 16 16v80c0 8.8-7.2 16-16 16h-60l-24 32-24-32H44c-8.8 0-16-7.2-16-16V64z M128 96l40 40h-80l40-40z" />
              </svg>
            </a>

            {/* X / Twitter */}
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
              <svg width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
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

      <main className="pt-8 pb-24 max-w-[720px] mx-auto px-4 space-y-10">

        {/* Profile Card */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 text-center shadow-xl">

          {/* Smaller Squircle Avatar */}
          <div className="mb-6">
            {isOwnProfile ? (
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <img
                  src={previewImage || profile.avatar_url || "/default-avatar.png"}
                  className="w-16 h-16 rounded-[14%] object-cover border border-zinc-700 shadow-md"
                />
              </label>
            ) : (
              <img
                src={profile.avatar_url || "/default-avatar.png"}
                className="w-16 h-16 rounded-[14%] object-cover border border-zinc-700 shadow-md"
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
              value={editedDisplayUrl}
              onChange={(e) => setEditedDisplayUrl(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded px-4 py-2 text-xl font-bold w-full max-w-xs mx-auto text-center"
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

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            {isOwnProfile ? (
              editMode ? (
                <>
                  <button onClick={saveProfile} className="px-8 py-3 bg-indigo-600 rounded-xl">
                    Save
                  </button>
                  <button onClick={() => setEditMode(false)} className="px-8 py-3 bg-zinc-700 rounded-xl">
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setEditMode(true)} className="px-8 py-3 bg-zinc-700 rounded-xl">
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

          <div className="mt-10">
            <SuggestedUsers />
          </div>
        </section>

        {/* Stats - Followers & Following as clickable numbers only */}
        <section className="bg-zinc-950 p-10 rounded-2xl border border-zinc-800 shadow-xl grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-4xl font-bold">{profile.items_count ?? 0}</p>
            <p className="text-zinc-500">Items</p>
          </div>

          <div>
            <p className="text-4xl font-bold">{profile.collections_count ?? 0}</p>
            <p className="text-zinc-500">Collections</p>
          </div>

          <div
            className="cursor-pointer hover:text-indigo-400 transition"
            onClick={() => router.push(`/profile/${userId}/followers`)}
          >
            <p className="text-4xl font-bold">{profile.followers_count ?? 0}</p>
            <p className="text-zinc-500">Followers</p>
          </div>

          <div
            className="cursor-pointer hover:text-indigo-400 transition"
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
        </section>

        {/* Collections Carousel */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-xl">
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
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-xl">
          <h2 className="text-3xl font-bold mb-6 text-center">Live from the Community</h2>

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
                  <p className="text-white text-sm">@{drop.profiles.username}</p>
                  <p className="text-zinc-400 text-xs">{drop.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Logout */}
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
