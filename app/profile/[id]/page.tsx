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

  // Add Item modal state
  const [showAddItem, setShowAddItem] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

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

  const [collections, setCollections] = useState<Collection[]>([]);
  const [recentDrops, setRecentDrops] = useState<RecentDrop[]>([]);

  const [isImportOpen, setIsImportOpen] = useState(false);

  // Load current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
  }, []);

  const isOwnProfile = profile?.id === currentUserId;

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
        .select(`id, name, image_url, created_at, profiles!user_id_fkey (username)`)
        .order("created_at", { ascending: false })
        .limit(6);
      setRecentDrops((data as unknown as RecentDrop[]) || []);
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
      } catch (err) {
        console.error(err);
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
        await supabase.from("follows").delete().eq("follower_id", currentUserId).eq("following_id", userId);
        setIsFollowing(false);
      } else {
        await supabase.from("follows").insert({ follower_id: currentUserId, following_id: userId });
        setIsFollowing(true);
      }
    } catch (err) {
      console.error(err);
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
          if (width > maxSize) { height = Math.round((height * maxSize) / width); width = maxSize; }
        } else {
          if (height > maxSize) { width = Math.round((width * maxSize) / height); height = maxSize; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) resolve(new File([blob], file.name, { type: file.type }));
          else resolve(file);
        }, file.type, 0.85);
      };
    });
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !currentUserId || currentUserId !== userId) return;

    setUploadingAvatar(true);
    try {
      const resizedFile = await resizeImage(selectedFile, 256);
      const timestamp = Date.now();
      const fileExt = selectedFile.name.split(".").pop() || "jpg";
      const fileName = `avatar-${timestamp}.${fileExt}`;
      const filePath = `${currentUserId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, resizedFile, { upsert: true, cacheControl: "31536000" });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);

      await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("id", currentUserId);

      setProfile((prev) => (prev ? { ...prev, avatar_url: urlData.publicUrl } : null));
      setPreviewImage(urlData.publicUrl);
      alert("Avatar updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Avatar update failed");
    } finally {
      setUploadingAvatar(false);
    }
  }

  // Direct Supabase upload + insert into items table
  async function handleUpload() {
    if (!file || !currentUserId) {
      alert("Please select a file");
      return;
    }

    setUploadingAvatar(true);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `item-${Date.now()}.${ext}`;
      const filePath = `${currentUserId}/items/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("items")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("items").getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from("items")
        .insert({
          user_id: currentUserId,
          image_url: urlData.publicUrl,
          name: "New Collection Item",
          caption: "",
          collection_id: null,
        });

      if (insertError) throw insertError;

      alert("Item uploaded and saved successfully!");

      setShowAddItem(false);
      setPreview(null);
      setFile(null);

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Upload failed — check console for details");
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
      const { error } = await supabase.from("profiles").update(updates).eq("id", currentUserId);
      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      setEditMode(false);
      alert("Profile saved!");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  }

  const displayName = useMemo(() => profile?.display_url || profile?.username || "Collector", [profile]);

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
    return <div className="min-h-screen bg-black text-white"><ProfileHeader /><div className="flex items-center justify-center h-[80vh]">Loading...</div></div>;
  }

  if (error || !profile) {
    return <div className="min-h-screen bg-black text-white"><ProfileHeader /><div className="flex flex-col items-center justify-center h-[80vh]"><h1 className="text-3xl mb-4">Error</h1><p>{error}</p></div></div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ProfileHeader />

      <main className="pt-8 pb-20 space-y-10 max-w-[720px] mx-auto px-4">
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-lg shadow-black/30">
          <div className="flex flex-col items-center text-center">

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

            {isOwnProfile && editMode ? (
              <input type="text" value={editedDisplayUrl} onChange={(e) => setEditedDisplayUrl(e.target.value)} className="text-4xl font-bold mb-4 bg-zinc-900 border border-zinc-700 rounded px-6 py-3 text-center w-full max-w-lg" />
            ) : (
              <h1 className="text-4xl font-bold mb-3">{displayName}</h1>
            )}

            {profile.username && <p className="text-indigo-400 text-2xl mb-6">@{profile.username}</p>}

            {isOwnProfile && editMode ? (
              <textarea value={editedBio} onChange={(e) => setEditedBio(e.target.value)} className="text-gray-300 text-xl mb-6 bg-zinc-900 border border-zinc-700 rounded px-6 py-4 w-full max-w-lg h-36 resize-none" />
            ) : (
              <p className="text-gray-300 text-xl mb-6 max-w-lg leading-relaxed">
                {profile.bio || "This collector hasn’t written a bio yet."}
              </p>
            )}

            {profile.location && <p className="text-gray-400 text-xl mb-6">{profile.location}</p>}

            <div className="flex items-center gap-4 mb-8">
              {tierIconSrc && <img src={tierIconSrc} alt={`${profile.tier} tier`} className="w-14 h-14 object-contain" />}
              {profile.tier && <p className="text-indigo-400 text-2xl font-medium">Tier: {profile.tier}</p>}
            </div>

            {/* Upload buttons - always visible for own profile */}
            {isOwnProfile && (
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => setShowAddItem(true)}
                  className="border border-zinc-600 hover:bg-zinc-800 px-6 py-3 rounded-xl text-sm font-medium transition flex items-center gap-2"
                >
                  + Add Item
                </button>

                <button
                  onClick={() => setIsImportOpen(true)}
                  className="bg-pink-600 hover:bg-pink-500 px-6 py-3 rounded-xl text-white font-medium transition"
                >
                  Import from Instagram
                </button>

                <button
                  onClick={() => setEditMode(!editMode)}
                  className="border border-zinc-600 hover:bg-zinc-800 px-6 py-3 rounded-xl text-sm font-medium transition"
                >
                  {editMode ? "Cancel Edit" : "Edit Profile"}
                </button>
              </div>
            )}

            {!isOwnProfile && currentUserId && (
              <button
                onClick={toggleFollow}
                disabled={followLoading}
                className="mt-8 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full text-lg font-medium transition disabled:opacity-50"
              >
                {followLoading ? "Loading..." : isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>

          <SuggestedUsers />
        </section>

        {/* Live Stats */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-lg shadow-black/30">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
            <div><p className="text-5xl font-bold">{profile?.items_count ?? 0}</p><p className="text-gray-500 text-xl mt-3">Items</p></div>
            <div><p className="text-5xl font-bold">{profile?.collections_count ?? 0}</p><p className="text-gray-500 text-xl mt-3">Collections</p></div>
            <div onClick={() => router.push("/followers")} className="cursor-pointer hover:text-indigo-400 transition"><p className="text-5xl font-bold">{profile?.followers_count ?? 0}</p><p className="text-gray-500 text-xl mt-3">Followers</p></div>
            <div onClick={() => router.push("/following")} className="cursor-pointer hover:text-indigo-400 transition"><p className="text-5xl font-bold">{profile?.following_count ?? 0}</p><p className="text-gray-500 text-xl mt-3">Following</p></div>
            <div><p className="text-5xl font-bold">£{profile?.vault_value ?? 0}</p><p className="text-gray-500 text-xl mt-3">Vault Value</p></div>
            <div><p className="text-5xl font-bold">{profile?.likes_count ?? 0}</p><p className="text-gray-500 text-xl mt-3">Likes</p></div>
          </div>
        </section>

        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-lg shadow-black/30">
          <h2 className="text-4xl font-bold mb-8 text-center">My Collections</h2>

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
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-6">
              {collections.map((col) => (
                <div
                  key={col.id}
                  onClick={() => router.push(`/collections/${col.id}`)}
                  className="cursor-pointer"
                >
                  <div className="w-24 h-24 rounded-[14%] overflow-hidden border border-zinc-700 bg-zinc-900 mx-auto">
                    <img
                      src={col.cover_url || "/CC-main-logo.png"}
                      alt={col.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <p className="text-white text-center font-semibold mt-3 truncate">
                    {col.title}
                  </p>

                  <p className="text-zinc-400 text-center text-sm">
                    {col.item_count || 0} items
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Live Community Feed */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-lg shadow-black/30">
          <h2 className="text-4xl font-bold mb-8 text-center">Live from the Community</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {recentDrops.length === 0 ? (
              <div className="col-span-3 text-center py-12"><p className="text-zinc-500 text-xl">No drops yet — be the first!</p></div>
            ) : (
              recentDrops.map((drop) => (
                <div key={drop.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition cursor-pointer" onClick={() => router.push(`/items/${drop.id}`)}>
                  <img src={drop.image_url || "/default-item.png"} alt={drop.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4">
                    <p className="text-white text-sm font-medium">@{drop.profiles?.username || "collector"}</p>
                    <p className="text-zinc-400 text-xs mt-1 line-clamp-1">{drop.name}</p>
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

          <ImportInstagramModal
            onClose={() => setIsImportOpen(false)}
          />

          {/* Add Item Modal */}
          {showAddItem && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-neutral-900 p-6 rounded-xl w-80">
                <h2 className="text-lg font-semibold mb-4">Add Item</h2>

                {!preview && (
                  <label className="border border-neutral-700 rounded-lg p-4 flex items-center justify-center cursor-pointer hover:bg-neutral-800 transition">
                    Choose Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0];
                        if (selectedFile) {
                          setFile(selectedFile);
                          setPreview(URL.createObjectURL(selectedFile));
                        }
                      }}
                    />
                  </label>
                )}

                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="rounded-lg mb-4 max-h-60 object-cover"
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
                    onClick={handleUpload}
                    className="flex-1 bg-white text-black rounded-lg py-2 font-semibold"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
