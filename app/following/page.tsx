"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type FollowingUser = {
  id: string;
  display_url: string | null;
  username: string | null;
  avatar_url: string | null;
  tier: string | null;
};

export default function FollowingPage() {
  const router = useRouter();
  const [following, setFollowing] = useState<FollowingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFollowing() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from("follows")
        .select(`
          profiles!follows_following_id_fkey (
            id, 
            display_url, 
            username, 
            avatar_url, 
            tier
          )
        `)
        .eq("follower_id", user.id);

      if (error) {
        console.error("Following load error:", error);
      } else {
        const flatFollowing: FollowingUser[] = data
          ?.map((item: any) => item.profiles)
          .filter((profile: any) => profile !== null) || [];

        setFollowing(flatFollowing);
      }

      setLoading(false);
    }

    loadFollowing();
  }, [router]);

  const handleUnfollow = async (followingId: string) => {
    if (!currentUserId) return;

    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", currentUserId)
      .eq("following_id", followingId);

    if (!error) {
      setFollowing(following.filter(f => f.id !== followingId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-xl">
        Loading following...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Following</h1>

        {following.length === 0 ? (
          <p className="text-center text-zinc-400 text-xl">
            You aren't following anyone yet.
          </p>
        ) : (
          <div className="space-y-4">
            {following.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-2xl p-5"
              >
                <div className="flex flex-col min-w-0">
                  <p className="font-semibold text-xl truncate">
                    {user.display_url || user.username}
                  </p>
                  <p className="text-zinc-400">
                    @{user.username || "collector"}
                  </p>
                </div>

                <button
                  onClick={() => handleUnfollow(user.id)}
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-medium"
                >
                  Unfollow
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
