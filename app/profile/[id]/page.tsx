"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProfileHeader from "@/components/ProfileHeader";

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

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Load logged‑in user
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  // Load profile
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

  // Check follow status
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

  // Follow / Unfollow
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">

        {/* PROFILE BOX */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 mb-10 text-center">
          <img
            src={profile.avatar_url || "/default-avatar.png"}
            alt="Avatar"
            className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border border-white/20"
          />

          <h1 className="text-3xl font-bold">{displayName}</h1>

          <p className="text-gray-400 text-base mt-2">
            {profile.bio || "Collector of watches, Pokémon cards, coins & pub history"}
          </p>

          <p className="text-gray-500 text-sm mt-1">
            {profile.location || "Swindon, UK"}
          </p>

          {currentUserId && currentUserId !== userId && (
            <button
              onClick={toggleFollow}
              disabled={followLoading}
              className={`mt-5 px-6 py-2 rounded-lg text-sm font-medium transition ${
                isFollowing
                  ? "bg-zinc-800 text-white hover:bg-zinc-700"
                  : "bg-white text-black hover:bg-gray-200"
              }`}
            >
              {followLoading ? "…" : isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>

        {/* STATS BOX */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 mb-10 flex justify-between">
          <div className="text-center">
            <p className="text-2xl font-bold">{profile.items_count || "2.1k"}</p>
            <p className="text-gray-500 text-sm">Items</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold">{profile.collections_count || "4"}</p>
            <p className="text-gray-500 text-sm">Categories</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold">90.8</p>
            <p className="text-gray-500 text-sm">Rarity</p>
          </div>
        </div>

        {/* COLLECTIONS BOX */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 mb-10">
          <h2 className="text-2xl font-bold mb-4">Collections</h2>

          <div className="flex flex-wrap gap-3">
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
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 mb-10">
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
    </div>
  );
}
