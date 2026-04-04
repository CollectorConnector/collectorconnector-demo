"use client";

import { useEffect, useMemo, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SuggestedUsers from "@/components/SuggestedUsers";
import ImportInstagramModal from "@/components/ImportInstagramModal";
import Link from "next/link";

type Profile = {
  id: string;
  username?: string | null;
  display_url?: string | null;
  avatar_url?: string | null;
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

type Collection = {
  id: string;
  title: string;
  niche?: string | null;
  cover_url?: string | null;
  item_count?: number | null;
};

type Item = {
  id: string;
  title: string;
  image_url: string | null;
  created_at: string;
  profiles?: { username: string | null } | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [collections, setCollections] = useState<Collection[]>([]);
  const [recentItems, setRecentItems] = useState<Item[]>([]);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [showAddItem, setShowAddItem] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [itemUploading, setItemUploading] = useState(false);

  const [isImportOpen, setIsImportOpen] = useState(false);

  // Avatar
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [editedBio, setEditedBio] = useState("");
  const [editedLocation, setEditedLocation] = useState("");
  const [editedDisplayUrl, setEditedDisplayUrl] = useState("");
  const [editedTier, setEditedTier] = useState("");
  const [saving, setSaving] = useState(false);

  const isOwnProfile = profile?.id === currentUserId;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
  }, []);

  // Load Profile
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        if (error || !data) throw error || new Error("Profile not found");
        setProfile(data);
        setEditedBio(data.bio || "");
        setEditedLocation(data.location || "");
        setEditedDisplayUrl(data.display_url || "");
        setEditedTier(data.tier || "");
      } catch (err) {
        console.error(err);
        setError("Profile not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // Load collections
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase
        .from("collections")
        .select("id, title, niche, cover_url, item_count")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setCollections((data as Collection[]) || []);
    })();
  }, [userId]);

  // Load recent items
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("items")
        .select(`id, title, image_url, created_at, profiles!inner(username)`)
        .order("created_at", { ascending: false })
        .limit(6);
      setRecentItems((data as Item[]) || []);
    })();
  }, []);

  // Check following state
  useEffect(() => {
    if (!currentUserId || !userId || currentUserId === userId) return;
    (async () => {
      const { data } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", currentUserId)
        .eq("following_id", userId)
        .maybeSingle();
      setIsFollowing(!!data);
    })();
  }, [currentUserId, userId]);

  async function handleFollowToggle() {
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
    const selected = e.target.files?.[0];
    if (!selected || !currentUserId) return;
    setUploadingAvatar(true);
    try {
      const ext = selected.name.split(".").pop();
      const fileName = `avatar-${Date.now()}.${ext}`;
      const filePath = `${currentUserId}/${fileName}`;

      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, selected, { upsert: true });
      if (error) throw error;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", currentUserId);

      setPreviewAvatar(data.publicUrl);
      setProfile((p) => (p ? { ...p, avatar_url: data.publicUrl } : p));
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleItemUpload() {
    if (!file || !currentUserId) return alert("Please select a file");
    setItemUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `item-${Date.now()}.${ext}`;
      const filePath = `${currentUserId}/${fileName}`;

      const { error } = await supabase.storage
        .from("item-images")
        .upload(filePath, file, { upsert: true });
      if (error) throw error;

      const { data } = supabase.storage.from("item-images").getPublicUrl(filePath);
      await supabase.from("items").insert({
        user_id: currentUserId,
        image_url: data.publicUrl,
        title: "New Item",
      });

      setShowAddItem(false);
      setPreview(null);
      setFile(null);
      router.refresh();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Item upload failed");
    } finally {
      setItemUploading(false);
    }
  }

  async function saveProfile() {
    if (!currentUserId) return;
    setSaving(true);
    try {
      const updates = {
        display_url: editedDisplayUrl.trim() || null,
        bio: editedBio.trim() || null,
        location: editedLocation.trim() || null,
        tier: editedTier.trim() || null,
      };
      const { error } = await supabase.from("profiles").update(updates).eq("id", currentUserId);
      if (error) throw error;
      setProfile((p) => (p ? { ...p, ...updates } : p));
      setEditMode(false);
    } catch {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  }

  const displayName = useMemo(
    () => profile?.display_url || profile?.username || "Collector",
    [profile]
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );

  if (error || !profile)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      <Header />
      <main className="w-full max-w-[720px] flex flex-col items-center px-4 pt-12 pb-20 space-y-10">
        {/* Profile Header */}
        <section className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-10 text-center shadow-md">
          <div className="flex flex-col items-center">
            {isOwnProfile ? (
              <label htmlFor="avatar-upload" className="cursor-pointer mb-6 relative">
                <img
                  src={previewAvatar || profile.avatar_url || "/default-avatar.png"}
                  alt="Avatar"
                  className="w-24 h-24 object-cover border-2 border-white rounded-2xl shadow-md"
                />
              </label>
            ) : (
              <img
                src={profile.avatar_url || "/default-avatar.png"}
                alt="Avatar"
                className="w-24 h-24 object-cover border-2 border-white rounded-2xl mb-6 shadow-md"
              />
            )}

            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />

            {editMode ? (
              <input
                value={editedDisplayUrl}
                onChange={(e) => setEditedDisplayUrl(e.target.value)}
                className="text-3xl font-bold bg-zinc-900 border border-zinc-700 rounded px-4 py-2 text-center mb-2"
              />
            ) : (
              <h1 className="text-3xl font-bold mb-1">{displayName}</h1>
            )}

            {profile.username && (
              <p className="text-indigo-400 mb-4 text-lg">@{profile.username}</p>
            )}

            {editMode ? (
              <textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                className="text-gray-300 bg-zinc-900 border border-zinc-700 rounded p-3 w-full max-w-lg h-28 mb-4"
              />
            ) : (
              <p className="text-gray-300 mb-4 max-w-lg leading-relaxed">
                {profile.bio || "This collector hasn’t written a bio yet."}
              </p>
            )}

            {/* View Collections Button */}
            <Link
              href={`/profile/${userId}/collections`}
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 py-3 rounded-full text-lg transition mb-6"
            >
              View Collections
            </Link>

            {profile.location && <p className="text-gray-400">{profile.location}</p>}

            {isOwnProfile && (
              <div className="mt-10 flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setShowAddItem(true)}
                  className="border border-zinc-600 hover:bg-zinc-800 px-6 py-3 rounded-xl text-sm font-medium transition"
                >
                  + Add Item
                </button>

                <button
                  onClick={() => router.push("/collections/create")}
                  className="border border-zinc-600 hover:bg-zinc-800 px-6 py-3 rounded-xl text-sm font-medium transition"
                >
                  + Add Collection
                </button>

                <button
                  onClick={() => setIsImportOpen(true)}
                  className="bg-pink-600 hover:bg-pink-500 px-6 py-3 rounded-xl text-white font-medium transition"
                >
                  Import from Instagram
                </button>

                <button
                  onClick={() => (editMode ? saveProfile() : setEditMode(true))}
                  className="border border-zinc-600 hover:bg-zinc-800 px-6 py-3 rounded-xl text-sm font-medium transition"
                  disabled={saving}
                >
                  {editMode ? (saving ? "Saving..." : "Save") : "Edit Profile"}
                </button>
              </div>
            )}

            {!isOwnProfile && currentUserId && (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className="mt-8 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full text-lg font-medium transition disabled:opacity-50"
              >
                {followLoading ? "Loading..." : isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>

          <SuggestedUsers />
        </section>

        {/* Collections */}
        <section className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-bold mb-8">My Collections</h2>
          {collections.length === 0 ? (
            <p className="text-zinc-500 text-xl py-10">
              No collections yet. Create your first one!
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-6 place-items-center">
              {collections.map((col) => (
                <div
                  key={col.id}
                  onClick={() => router.push(`/collections/${col.id}`)}
                  className="cursor-pointer"
                >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-900 mx-auto">
                    <img
                      src={col.cover_url || "/CC-main-logo.png"}
                      alt={col.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-white font-semibold mt-3 truncate">{col.title}</p>
                  <p className="text-zinc-400 text-sm">{col.item_count || 0} items</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Community Items */}
        <section className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-bold mb-8">Live from the Community</h2>
          {recentItems.length === 0 ? (
            <p className="text-zinc-500 text-xl">No items yet — be the first!</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {recentItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/items/${item.id}`)}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition cursor-pointer"
                >
                  <img
                    src={item.image_url || "/default-item.png"}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4">
                    <p className="text-white text-sm font-medium">
                      @{item.profiles?.username || "collector"}
                    </p>
                    <p className="text-zinc-400 text-xs mt-1 line-clamp-1">
                      {item.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {isOwnProfile && (
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/auth/login");
            }}
            className="w-full py-4 bg-red-600 hover:bg-red-500 rounded-xl text-white text-xl font-semibold transition"
          >
            Log Out
          </button>
        )}

        <ImportInstagramModal onClose={() => setIsImportOpen(false)} />

        {/* Add Item Modal */}
        {showAddItem && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-neutral-900 p-6 rounded-xl w-80 max-w-[90%]">
              <h2 className="text-lg font-semibold mb-4">Add Item</h2>
              {!preview && (
                <label className="border border-neutral-700 rounded-lg p-4 flex items-center justify-center cursor-pointer hover:bg-neutral-800 transition">
                  Choose Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const selected = e.target.files?.[0];
                      if (selected) {
                        setFile(selected);
                        setPreview(URL.createObjectURL(selected));
                      }
                    }}
                  />
                </label>
              )}
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="rounded-lg mb-4 max-h-60 object-cover mx-auto"
                />
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowAddItem(false)}
                  className="flex-1 border border-neutral-700 rounded-lg py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleItemUpload}
                  disabled={itemUploading}
                  className="flex-1 bg-white text-black rounded-lg py-2 font-semibold disabled:opacity-50"
                >
                  {itemUploading ? "Uploading..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
