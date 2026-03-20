"use client";

import { useEffect, useMemo, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";

type Profile = {
  id: string;
  avatar_url?: string | null;
  display_url?: string | null;
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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
      setCurrentUserId(data?.user?.id || null);
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

  const TARGET_SIZE = 256;
  const QUALITY = 0.9;

  async function resizeImageToSquare(file: File, size = TARGET_SIZE, quality = QUALITY): Promise<Blob> {
    const imgBitmap = await createImageBitmap(file);
    const srcW = imgBitmap.width;
    const srcH = imgBitmap.height;
    const side = Math.min(srcW, srcH);
    const sx = Math.floor((srcW - side) / 2);
    const sy = Math.floor((srcH - side) / 2);

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    ctx.drawImage(imgBitmap, sx, sy, side, side, 0, 0, size, size);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/webp", quality)
    );
    if (blob) return blob;

    const jpegBlob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
    );
    if (!jpegBlob) throw new Error("Image resize failed");
    return jpegBlob;
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return alert("No file selected.");

    if (!profile || profile.id !== currentUserId) {
      alert("Your profile is still loading… try again.");
      return;
    }
    if (!currentUserId) return alert("You must be logged in.");
    if (currentUserId !== userId) return alert("You can only update your own avatar.");

    setUploadingAvatar(true);

    const originalPreview = URL.createObjectURL(file);
    setAvatarPreview(originalPreview);

    try {
      const resizedBlob = await resizeImageToSquare(file, TARGET_SIZE, QUALITY);
      const ext = resizedBlob.type === "image/webp" ? "webp" : "jpg";

      // UNIQUE FILENAME — this fixes the disappearing avatar on iPhone/Safari
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileName = `${currentUserId}-${timestamp}-${randomStr}.${ext}`;
      const filePath = `${currentUserId}/${fileName}`;

      console.log("Uploading to new path:", filePath);

      const resizedFile = new File([resizedBlob], fileName, { type: resizedBlob.type });

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, resizedFile, {
          upsert: true,
          cacheControl: "no-cache, max-age=0, must-revalidate",
          contentType: resizedBlob.type,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      if (!publicUrl) throw new Error("Failed to get public URL");

      const finalUrlWithTs = `${publicUrl}?t=${timestamp}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: finalUrlWithTs })
        .eq("id", currentUserId);

      if (updateError) throw updateError;

      // Re-fetch profile (gives CDN time to serve new file)
      await new Promise((r) => setTimeout(r, 2500));
      const { data: freshProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUserId)
        .single();

      if (freshProfile) setProfile(freshProfile as Profile);

      alert("Avatar updated successfully! Pull down to refresh.");
    } catch (err: any) {
      console.error("Avatar error:", err);
      alert("Failed to update avatar: " + (err?.message || JSON.stringify(err)));
    } finally {
      setUploadingAvatar(false);
      setAvatarPreview(null);

      const input = document.getElementById("avatar-upload") as HTMLInputElement | null;
      if (input) input.value = "";

      if (originalPreview) URL.revokeObjectURL(originalPreview);
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
      if (!form.username.trim()) {
        alert("Username cannot be empty");
        setSavingProfile(false);
        return;
      }

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
        <div className="flex items-center justify-center h-[80vh] text-xl">Loading...</div>
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
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-zinc-700 shadow-xl bg-zinc-900">
                  <img
                    key={profile.avatar_url || "default"} // Forces re-render when URL changes
                    src={
                      uploadingAvatar
                        ? avatarPreview || "/default-avatar.png"
                        : profile.avatar_url
                        ? `${profile.avatar_url}?t=${Date.now()}`
                        : "/default-avatar.png"
                    }
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />

                  {uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {isOwnProfile && (
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-end justify-end p-0.5 -translate-y-2 cursor-pointer"
                    style={{ pointerEvents: uploadingAvatar ? "none" : "auto" }}
                  >
                    <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-md">Change</div>
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
                    {profile.bio || "Collector of rare finds • Watches, cards, coins & more"}
                  </p>
                  <p className="text-gray-500 text-sm mb-4">{profile.location || "Swindon, UK"}</p>

                  {isOwnProfile && (
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700"
                      >
                        Edit Profile
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <input
                    name="display_url"
                    value={form.display_url}
                    onChange={onFormChange}
                    placeholder="Display name"
                    className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800"
                  />
                  <input
                    name="username"
                    value={form.username}
                    onChange={onFormChange}
                    placeholder="Username"
                    className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800"
                  />
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={onFormChange}
                    placeholder="Bio"
                    rows={3}
                    className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800"
                  />
                  <input
                    name="location"
                    value={form.location}
                    onChange={onFormChange}
                    placeholder="Location"
                    className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800"
                  />

                  <div className="flex justify-center gap-3 mt-2">
                    <button
                      onClick={saveProfileEdits}
                      disabled={savingProfile}
                      className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      {savingProfile ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-lg shadow-black/30">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold">{profile.items_count || "2.1k"}</p>
              <p className="text-gray-500 text-sm mt-1">Items</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{profile.collections_count || "4"}</p>
              <p className="text-gray-500 text-sm mt-1">Categories</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{profile.rarity_score ?? "90.8"}</p>
              <p className="text-gray-500 text-sm mt-1">Rarity Score</p>
            </div>
          </div>
        </section>

        {/* COLLECTIONS */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-lg shadow-black/30">
          <h2 className="text-2xl font-bold mb-5 text-center">My Vault</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {["Cards", "Watches", "Coins", "Memorabilia"].map((cat) => (
              <button
                key={cat}
                className="px-6 py-2.5 bg-zinc-900/70 border border-zinc-700 rounded-full text-sm font-medium hover:border-zinc-500 hover:bg-zinc-800 transition"
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* RECENT DROPS */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-lg shadow-black/30">
          <h2 className="text-2xl font-bold mb-5 text-center">Recent Drops</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 group">
              <img
                src="/charizard.png"
                alt="Featured Card"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 bg-indigo-600/90 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                Featured
              </div>
            </div>

            <div className="aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 group">
              <img
                src="/watch.png"
                alt="Watch"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 group">
              <img
                src="/coin.png"
                alt="Coin"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>

          <div className="text-center text-sm text-gray-400">
            <p className="mb-1">2 hours ago</p>
            <p>Just added this beauty to the vault. Thoughts?</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* HEADER */
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
          padding: "0 16px",
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
            color: "white",
          }}
        >
          {/* Social icons here */}
        </div>
      </header>

      <div style={{ height: 56 }} />
    </>
  );
}
