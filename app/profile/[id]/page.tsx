"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ImportInstagramModal from "@/components/ImportInstagramModal";

type Profile = {
  id: string;
  avatar_url?: string | null;
  username?: string | null;
  location?: string | null;
  bio?: string | null;
  tier?: string | null;
  items_count?: number | null;
  collections_count?: number | null;
  followers_count?: number | null;
  following_count?: number | null;
  vault_value?: number | null;
};

type Collection = {
  id: string;
  title: string;
  nichem?: string | null;
  cover_url?: string | null;
  item_count?: number | null;
};

type RecentDrop = {
  id: string;
  name: string;
  image_url: string | null;
  created_at: string;
  profiles?: { username: string | null } | null;
};

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [recentDrops, setRecentDrops] = useState<RecentDrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Resize image before upload
  const resizeImage = (file: File, maxSize: number = 256): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(new File([blob], file.name, { type: "image/jpeg" }));
            else resolve(file);
          },
          "image/jpeg",
          0.85
        );
      };
    });
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserId || !isOwnProfile) return;

    setUploadingAvatar(true);
    try {
      const resizedFile = await resizeImage(file);
      const timestamp = Date.now();
      const fileExt = file.name.split(".").pop() || "jpg";
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
      alert("Profile picture updated!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to update avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      setIsOwnProfile(user?.id === userId);

      if (!userId) {
        setLoading(false);
        return;
      }

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      setProfile(profileData || null);

      // Load collections
      const { data: colData } = await supabase
        .from("collections")
        .select("id, title, nichem, cover_url, item_count")
        .eq("user_id", userId);

      setCollections(colData || []);

      // Load recent community drops
      const { data: dropData } = await supabase
        .from("items")
        .select(`
          id, 
          name, 
          image_url, 
          created_at, 
          profiles (username)
        `)
        .order("created_at", { ascending: false })
        .limit(6);

      const safeDrops: RecentDrop[] = (dropData || []).map((item: any) => ({
        ...item,
        profiles: item.profiles && item.profiles.length > 0 ? item.profiles[0] : null,
      }));

      setRecentDrops(safeDrops);

      setLoading(false);
    }

    loadProfile();
  }, [userId]);

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  }

  if (!profile) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Profile not found</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="max-w-[720px] mx-auto px-4 pt-8">

        {/* AVATAR - Exact squircle matching your reference */}
        <div className="flex justify-center mb-8">
          {isOwnProfile ? (
            <label htmlFor="avatar-upload" className="relative cursor-pointer group">
              <div
                className="w-24 h-24 overflow-hidden border-4 border-white shadow-2xl"
                style={{ borderRadius: "35% / 30%" }}
              >
                <img
                  src={previewImage || profile.avatar_url || "/default-avatar.png"}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all rounded-[35%/30%]">
                <span className="text-white text-xs font-medium">Change Photo</span>
              </div>
            </label>
          ) : (
            <div
              className="w-24 h-24 overflow-hidden border-4 border-white shadow-2xl"
              style={{ borderRadius: "35% / 30%" }}
            >
              <img
                src={profile.avatar_url || "/default-avatar.png"}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
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

        {/* Name + Bio */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">{profile.username || "Collector"}</h1>
          {profile.location && <p className="text-zinc-400 mt-1">📍 {profile.location}</p>}
          {profile.bio && <p className="mt-3 text-zinc-300 max-w-md mx-auto">{profile.bio}</p>}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-10 mb-10 text-center">
          <div>
            <div className="text-2xl font-semibold">{profile.items_count || 0}</div>
            <div className="text-xs text-zinc-500">ITEMS</div>
          </div>
          <div>
            <div className="text-2xl font-semibold">{profile.collections_count || 0}</div>
            <div className="text-xs text-zinc-500">COLLECTIONS</div>
          </div>
          <div>
            <div className="text-2xl font-semibold">{profile.followers_count || 0}</div>
            <div className="text-xs text-zinc-500">FOLLOWERS</div>
          </div>
        </div>

        {/* Collections Carousel */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-2xl font-bold">My Collections 🎴</h2>
            {isOwnProfile && (
              <button
                onClick={() => router.push("/collections/create")}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-full text-sm font-medium"
              >
                + New
              </button>
            )}
          </div>

          {collections.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">No collections yet</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide">
              {collections.map((col) => (
                <div
                  key={col.id}
                  onClick={() => router.push(`/collections/${col.id}`)}
                  className="w-52 flex-shrink-0 snap-center cursor-pointer group"
                >
                  <div className="relative h-52 rounded-2xl overflow-hidden border border-zinc-800">
                    <img
                      src={col.cover_url || "/CC-main-logo.png"}
                      alt={col.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent h-20" />
                    <div className="absolute bottom-3 left-3 text-white">
                      <p className="font-semibold">{col.title}</p>
                      <p className="text-xs text-zinc-400">{col.item_count || 0} items</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Import Instagram - safe render (no prop if it doesn't accept userId) */}
        {isOwnProfile && <ImportInstagramModal />}

        {/* Live Community Feed */}
        <div>
          <h2 className="text-2xl font-bold mb-4 px-1">Live from the Community</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {recentDrops.map((drop) => (
              <div key={drop.id} className="rounded-2xl overflow-hidden border border-zinc-800">
                <img 
                  src={drop.image_url || ""} 
                  alt={drop.name} 
                  className="w-full aspect-square object-cover" 
                />
                <div className="p-3 text-sm">
                  <p className="font-medium line-clamp-1">{drop.name}</p>
                  <p className="text-xs text-zinc-500">
                    by @{drop.profiles?.username || "Unknown"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
