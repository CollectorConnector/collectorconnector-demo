"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type SuggestedUser = {
  id: string;
  display_url: string | null;
  username: string | null;
  avatar_url: string | null;
  tier: string | null;
};

export default function SuggestedUsers() {
  const router = useRouter();
  const [suggested, setSuggested] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadSuggested() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get who the current user is already following
      const { data: followsData } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      const alreadyFollowing = new Set(followsData?.map((f: any) => f.following_id) || []);
      setFollowingIds(alreadyFollowing);

      // Get other users (exclude self)
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_url, username, avatar_url, tier")
        .neq("id", user.id)
        .limit(8);   // Increased a bit for small user base

      if (error) {
        console.error("Suggested users error:", error);
      } else if (data) {
        // Shuffle lightly and take up to 5
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setSuggested(shuffled.slice(0, 5));
      }
      setLoading(false);
    }

    loadSuggested();
  }, []);

  const handleFollow = async (targetId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: user.id, following_id: targetId });

    if (!error) {
      setFollowingIds((prev) => new Set([...prev, targetId]));
      setSuggested((prev) => prev.filter((u) => u.id !== targetId));
    }
  };

  if (loading) return <div className="text-zinc-400 py-8">Finding cool collectors...</div>;

  if (suggested.length === 0) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 text-center">
        <p className="text-zinc-400">No other collectors yet.</p>
        <p className="text-sm mt-2">Invite friends to join CollectorConnector!</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Suggested Collectors</h2>
        <button 
          onClick={() => window.location.reload()} 
          className="text-indigo-400 hover:text-white text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-5">
        {suggested.map((user) => {
          const isFollowing = followingIds.has(user.id);

          return (
            <div key={user.id} className="flex items-center gap-4 group">
              <div 
                onClick={() => router.push(`/profile/${user.id}`)}
                className="w-14 h-14 rounded-[30%] overflow-hidden border-2 border-zinc-700 cursor-pointer flex-shrink-0 hover:border-indigo-500 transition"
              >
                <img
                  src={user.avatar_url || "/default-avatar.png"}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate group-hover:text-indigo-400 transition">
                  {user.display_url || user.username}
                </p>
                <p className="text-zinc-400 text-sm">@{user.username || "collector"}</p>
              </div>

              <button
                onClick={() => handleFollow(user.id)}
                disabled={isFollowing}
                className={`px-7 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                  isFollowing 
                    ? "bg-zinc-800 text-zinc-400 cursor-not-allowed" 
                    : "bg-white text-black hover:bg-zinc-100 active:scale-95"
                }`}
              >
                {isFollowing ? "Following ✓" : "Follow"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <a 
          href="/search" 
          className="inline-block text-indigo-400 hover:text-indigo-300 font-medium"
        >
          Discover more collectors →
        </a>
      </div>
    </div>
  );
}
