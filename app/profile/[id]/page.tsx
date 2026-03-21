"use client";

import { useEffect, useMemo, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";

type Profile = {
  id: string;
  avatar_url?: string | null;
  display_name?: string | null;
  username?: string | null;
  location?: string | null;
  bio?: string | null;
  items_count?: number | null;
  collections_count?: number | null;
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
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
        setProfile(data);
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

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentUserId || currentUserId !== userId) return;

    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split(".").pop() || "png";
      const fileName = `${currentUserId}.${fileExt}`;
      const filePath = `${currentUserId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", currentUserId);

      if (updateError) throw updateError;

      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));

      alert("Profile picture updated!");
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      alert("Failed to update avatar: " + (err.message || "Unknown error"));
    } finally {
      setUploadingAvatar(false);
    }
  }

  const displayName = useMemo(
    () => profile?.display_name || profile?.username || "Unnamed Collector",
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
                  className="w-40 h-40 rounded-full object-cover border-4 border-zinc-700 shadow-xl transition-opacity group-hover:opacity-80"
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

            <h1 className="text-3xl font-bold mb-2">{displayName}</h1>

            <p className="text-gray-300 text-lg mb-3 max-w-md">
              {profile.bio ||
                "Collector of rare finds • Watches, cards, coins & more • Always chasing the next grail"}
            </p>

            <p className="text-gray-500 text-sm">
              {profile.location || "Swindon, UK"}
            </p>

            {isOwnProfile && (
              <button
                onClick={() => router.push("/edit-profile")}
                className="mt-4 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-full text-sm font-medium transition"
              >
                Edit Profile
              </button>
            )}
          </div>
        </section>

        {/* STATS */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-lg shadow-black/30">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold">
                {profile.items_count || "2.1k"}
              </p>
              <p className="text-gray-500 text-sm mt-1">Items</p>
            </div>
            <div>
              <p className="text-3xl font-bold">
                {profile.collections_count || "4"}
              </p>
              <p className="text-gray-500 text-sm mt-1">Categories</p>
            </div>
            <div>
              <p className="text-3xl font-bold">90.8</p>
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

/* HEADER — SVG placeholders */
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
          {/* Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform"
          >
            {/* INSTAGRAM_SVG_HERE */}
          </a>

          {/* Facebook */}
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform"
          >
            {/* FACEBOOK_SVG_HERE */}
          </a>

          {/* eBay */}
          <a
            href="https://ebay.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform text-sm font-bold tracking-wide"
            style={{ letterSpacing: "0.5px" }}
          >
            eBay
          </a>

          {/* Discord */}
          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform"
          >
            {/* DISCORD_SVG_HERE */}
          </a>

          {/* Whatnot */}
          <a
            href="https://whatnot.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform"
          >
            {/* WHATNOT_SVG_HERE */}
          </a>

          {/* X */}
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform"
          >
            {/* X_SVG_HERE */}
          </a>
        </div>
      </header>

      <div style={{ height: 56 }} />
    </>
  );
}
