"use client";

import { useEffect, useMemo, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";

type Profile = {
  id: string;
  avatar_url?: string | null;
  display_url?: string | null; // maps to your DB column
  username?: string | null;
  location?: string | null;
  bio?: string | null;
  items_count?: number | null;
  collections_count?: number | null;
  rarity_score?: number | null;
};

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Edit profile state (use display_url to match DB)
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    display_url: "",
    username: "",
    bio: "",
    location: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId((data as any)?.user?.id || null);
    });
  }, []);

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

        if (error) throw error;
        setProfile(data as Profile);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId, router]);

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

  // populate edit form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        display_url: profile.display_url || "",
        username: profile.username || "",
        bio: profile.bio || "",
        location: profile.location || "",
      });
    }
  }, [profile]);

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
        await supabase.from("follows").insert({
          follower_id: currentUserId,
          following_id: userId,
        });

        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Follow toggle failed:", err);
    } finally {
      setFollowLoading(false);
    }
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentUserId || currentUserId !== userId) return;

    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split(".").pop() || "png";
      const fileName = `${currentUserId}.${fileExt}`;
      const filePath = `${currentUserId}/${fileName}`;

      // Upload (with upsert to overwrite old file)
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // getPublicUrl is synchronous in the client; handle response shape safely
      const publicData = supabase.storage.from("avatars").getPublicUrl(filePath).data;
      const publicUrl =
        (publicData as any)?.publicUrl || (publicData as any)?.public_url || "";

      if (!publicUrl) throw new Error("No public URL returned from storage");

      // Append timestamp to bust cache
      const publicUrlWithTs = `${publicUrl}?t=${Date.now()}`;

      // Update profile row (avatar_url exists in your schema)
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrlWithTs })
        .eq("id", currentUserId);

      if (updateError) throw updateError;

      // Update local state
      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrlWithTs } : null));
      alert("Profile picture updated!");
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      alert("Failed to update avatar: " + (err.message || "Unknown error"));
    } finally {
      setUploadingAvatar(false);
      const input = document.getElementById("avatar-upload") as HTMLInputElement | null;
      if (input) input.value = "";
    }
  }

  function onFormChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  async function saveProfileEdits() {
    if (!currentUserId || currentUserId !== userId) return;
    setSavingProfile(true);

    try {
      // Basic validation
      if (!form.username.trim()) {
        alert("Username cannot be empty");
        setSavingProfile(false);
        return;
      }

      // Update using the actual DB columns (display_url, username, bio, location)
      const { error } = await supabase
        .from("profiles")
        .update({
          display_url: form.display_url || null,
          username: form.username || null,
          bio: form.bio || null,
          location: form.location || null,
        })
        .eq("id", currentUserId);

      if (error) throw error;

      setProfile((p) => (p ? { ...p, ...form } : p));
      setIsEditing(false);
      alert("Profile updated");
    } catch (err: any) {
      console.error("Profile update failed:", err);
      alert("Failed to update profile: " + (err.message || "Unknown error"));
    } finally {
      setSavingProfile(false);
    }
  }

  const displayName = useMemo(
    () => profile?.display_url || profile?.username || "Unnamed Collector",
    [profile]
  );

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

  const isOwnProfile = currentUserId === userId;

  return (
    <div className="min-h-screen bg-black text-white">
      <ProfileHeader />

      <main className="pt-8 pb-20 space-y-10 max-w-[720px] mx-auto px-4">

        {/* PROFILE BOX */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 shadow-lg shadow-black/30">
          <div className="flex flex-col items-center text-center">
            <div className="relative flex items-center justify-center gap-6 mb-6 group">
              <div className="relative">
                <img
                  src={profile.avatar_url || "/default-avatar.png"}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-zinc-700 shadow-xl transition-opacity group-hover:opacity-80"
                />

                {isOwnProfile && (
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="text-white text-sm font-medium">
                      {uploadingAvatar ? "Uploading..." : "Change"}
                    </span>
                  </label>
                )}

                {isOwnProfile && (
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                )}
              </div>

              {!isOwnProfile && (
                <button
                  onClick={toggleFollow}
                  disabled={followLoading}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition min-w-[110px] ${
                    isFollowing
                      ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-600"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500"
                  }`}
                >
                  {followLoading ? "…" : isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>

            <div className="w-full max-w-xl">
              {!isEditing ? (
                <>
                  <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
                  <p className="text-gray-300 text-lg mb-3 max-w-md mx-auto">
                   
