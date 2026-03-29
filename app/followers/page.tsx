"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Follower = {
  id: string;
  display_url: string | null;
  username: string | null;
  avatar_url: string | null;
  tier: string | null;
};

export default function FollowersPage() {
  const router = useRouter();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFollowers() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from("follows")
        .select(`
          profiles!follows_follower_id_fkey (
            id, 
            display_url, 
            username, 
            avatar_url, 
            tier
          )
        `)
        .eq("following_id", user.id);

      if (error) {
        console.error("Followers load error:", error);
      } else {
        // Safe flattening for Supabase join structure
        const flatFollowers: Follower[] = (data || [])
          .map((item: any) => item.profiles)
          .filter((profile: any): profile is Follower => profile !== null);

        setFollowers(flatFollowers);
      }
      setLoading(false);
    }

    loadFollowers();
  }, [router]);

  const handleUnfollow = async (followerId: string) => {
    if (!currentUserId) return;

    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", currentUserId);

    if (!error) {
      setFollowers((prev) => prev.filter(f => f.id !== followerId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-xl">
        Loading followers...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Followers</h1>

        {followers.length === 0 ? (
          <p className="text-center text-zinc-400 text-xl">No one is following you yet.</p>
        ) : (
          <div className="space-y-4">
            {followers.map((user) => (
              <div key={user.id} className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
                <div className="w-16 h-16 rounded-[30%] overflow-hidden border-2 border-zinc-700 flex-shrink-0">
                  <img
                    src={user.avatar_url || "/default-avatar.png"}
                    alt={user.display_url || ""}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xl truncate">{user.display_url || user.username}</p>
                  <p className="text-zinc-400">@{user.username || "collector"}</p>
                </div>
                <button
                  onClick={() => handleUnfollow(user.id)}
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
