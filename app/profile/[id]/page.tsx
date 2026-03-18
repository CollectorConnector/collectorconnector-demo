"use client";

import { useEffect, useMemo, useState } from "react";
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

  return (
    <div className="min-h-screen bg-black text-white">
      <ProfileHeader />

      <main className="pt-8 pb-20">

        {/* PROFILE BOX */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-8 mb-10 inline-block w-full">

          <div className="flex items-center justify-center gap-4 mb-4">
            {currentUserId && currentUserId !== userId && (
              <button
                onClick={toggleFollow}
                disabled={followLoading}
                className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                  isFollowing
                    ? "bg-zinc-900 text-white hover:bg-zinc-800"
                    : "bg-zinc-800 text-white hover:bg-zinc-700"
                }`}
              >
                {followLoading ? "…" : isFollowing ? "Following" : "Follow"}
              </button>
            )}

            <img
              src={profile.avatar_url || "/default-avatar.png"}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border border-white/20"
            />
          </div>

          <h1 className="text-3xl font-bold">{displayName}</h1>

          <p className="text-gray-400 text-base mt-2">
            {profile.bio || "Collector of watches, Pokémon cards, coins & pub history"}
          </p>

          <p className="text-gray-500 text-sm mt-1">
            {profile.location || "Swindon, UK"}
          </p>
        </div>

        {/* STATS BOX */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 mb-10 inline-block w-full">
          <div className="flex justify-between text-center">
            <div>
              <p className="text-2xl font-bold">{profile.items_count || "2.1k"}</p>
              <p className="text-gray-500 text-sm">Items</p>
            </div>

            <div>
              <p className="text-2xl font-bold">{profile.collections_count || "4"}</p>
              <p className="text-gray-500 text-sm">Categories</p>
            </div>

            <div>
              <p className="text-2xl font-bold">90.8</p>
              <p className="text-gray-500 text-sm">Rarity</p>
            </div>
          </div>
        </div>

        {/* COLLECTIONS BOX */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 mb-10 inline-block w-full">
          <h2 className="text-2xl font-bold mb-4">Collections</h2>

          <div className="flex flex-wrap gap-3 justify-center">
            {["Cards", "Watches", "Coins", "Memorabilia"].map((c) => (
              <div
                key={c}
                className="px-5 py-2 bg-black/40 border border-zinc-800 rounded-lg text-sm font-medium"
              >
                {c}
              </div>
            ))}
          </div>
        </div>

        {/* ACTIVITY BOX */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 mb-10 inline-block w-full">
          <h2 className="text-2xl font-bold mb-4">Activity</h2>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
              <img
                src="/charizard.png"
                alt="Featured Card"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-white text-black text-xs font-bold px-2 py-0.5 rounded-md">
                Featured
              </div>
            </div>

            <div className="aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
              <img src="/watch.png" alt="Watch" className="w-full h-full object-cover" />
            </div>

            <div className="aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
              <img src="/coin.png" alt="Coin" className="w-full h-full object-cover" />
            </div>
          </div>

          <p className="text-gray-500 text-sm mb-1">2 hours ago</p>
          <p className="text-base">
            Just added this one to the collection. What do you think?
          </p>
        </div>

      </main>

      <Footer />
    </div>
  );
}

/* HEADER — UNCHANGED */
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
            gap: 16,
            color: "white",
          }}
        >
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm6.5-.75a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z"/>
            </svg>
          </a>

          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12a10 10 0 10-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.3l-.4 3h-1.9v7A10 10 0 0022 12z"/>
            </svg>
          </a>

          <a href="https://ebay.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: "14px", fontWeight: "bold" }}>
            eBay
          </a>

          <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3853-.3969-.8748-.6083-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8851 1.515.0699.0699 0 00-.032.0277C.5336 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0775.0105c.1202.099.246.1981.372.2914a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6061 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
            </svg>
          </a>

          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 2l-5.4 6.3L6 2H2l7.3 8.1L2 22h4l5.7-7.1L18 22h4l-7.6-8.6L22 2h-4z"/>
            </svg>
          </a>
        </div>
      </header>

      <div style={{ height: 56 }} />
    </>
  );
}
