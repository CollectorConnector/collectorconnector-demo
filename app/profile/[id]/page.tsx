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
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
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

  // Load recent communal drops
  useEffect(() => {
    async function loadRecentDrops() {
      const { data } = await supabase
        .from("items")
        .select(`
          id, name, image_url, created_at,
          profiles!user_id_fkey (username)
        `)
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
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId, router, isOwnProfile]);

  // Follow logic (unchanged)
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

  // Avatar resize & upload (kept from your first script)
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
        .upload(filePath, resizedFile, { upsert: true, cacheControl: "31536000" });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);

      await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("id", currentUserId);

      setProfile((prev) => (prev ? { ...prev, avatar_url: urlData.publicUrl } : null));
      setPreviewImage(urlData.publicUrl);
      alert("Avatar updated successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Avatar update failed");
    } finally {
      setUploadingAvatar(false);
    }
  }

  // (rest of your saveProfileChanges, getTierIcon, displayName, etc. unchanged)
  async function saveProfileChanges() { /* ... your original function ... */ }
  const displayName = useMemo(() => profile?.display_url || profile?.username || "Collector", [profile]);
  const getTierIcon = (tier?: string | null) => { /* ... your original function ... */ };
  const tierIconSrc = getTierIcon(profile?.tier);

  if (loading) return <div className="min-h-screen bg-black text-white"><ProfileHeader /><div className="flex items-center justify-center h-[80vh]">Loading...</div></div>;
  if (error || !profile) return <div className="min-h-screen bg-black text-white"><ProfileHeader /><div className="flex flex-col items-center justify-center h-[80vh]"><h1 className="text-3xl mb-4">Error</h1><p>{error}</p></div></div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <ProfileHeader />

      <main className="pt-8 pb-20 space-y-10 max-w-[720px] mx-auto px-4">
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-lg shadow-black/30">
          <div className="flex flex-col items-center text-center">

            {/* FIXED AVATAR — exact style from your second script */}
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

            {/* Rest of your profile card (name, bio, edit mode, tier, follow button, etc.) remains exactly as before */}
            {/* ... (your original code from h1 down to SuggestedUsers) ... */}

          </div>
          <SuggestedUsers />
        </section>

        {/* All your other sections (Live Stats, Carousel, Live Feed, etc.) stay 100% unchanged */}
        {/* ... (your original sections) ... */}

      </main>

      {isOwnProfile && <div className="max-w-[720px] mx-auto px-4 pb-10"> {/* Log Out button */ } </div>}
      <Footer />
    </div>
  );
}

/* ProfileHeader stays exactly as you had it */
function ProfileHeader() { /* your original ProfileHeader code */ }
