"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [collections, setCollections] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      // 1. Get logged‑in user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // 2. Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      // 3. Load followers count
      const { count: followers } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", user.id);

      setFollowersCount(followers || 0);

      // 4. Load following count
      const { count: following } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", user.id);

      setFollowingCount(following || 0);

      // 5. Load collections
      const { data: collectionsData } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", user.id);

      setCollections(collectionsData || []);
    }

    loadData();
  }, []);

  if (!profile) {
    return (
      <div className="p-6 text-white">
        <p>Loading…</p>
      </div>
    );
  }

  const isOwnProfile = true; // later: compare user.id to params.id

  return (
    <div className="p-6 text-white flex flex-col items-center">

      {/* Avatar (50% smaller, logo-matching squircle) */}
      <img
        src={profile.avatar_url || "/default-avatar.png"}
        alt="Profile"
        className="w-14 h-14 object-cover border border-white/10 shadow"
        style={{ borderRadius: "14%" }}
      />

      {/* Name */}
      <h1 className="mt-4 text-xl font-bold">
        {profile.full_name || "Unnamed User"}
      </h1>

      {/* Username */}
      <p className="text-gray-400 text-sm">
        @{profile.username || "username"}
      </p>

      {/* Bio */}
      {profile.bio && (
        <p className="mt-3 text-center text-gray-300 text-sm max-w-xs">
          {profile.bio}
        </p>
      )}

      {/* Location */}
      {profile.location && (
        <p className="mt-1 text-gray-400 text-xs">
          📍 {profile.location}
        </p>
      )}

      {/* Followers / Following */}
      <div className="flex gap-8 mt-6 text-center">
        <div>
          <p className="text-lg font-semibold">{followersCount}</p>
          <p className="text-gray-400 text-xs">Followers</p>
        </div>
        <div>
          <p className="text-lg font-semibold">{followingCount}</p>
          <p className="text-gray-400 text-xs">Following</p>
        </div>
      </div>

      {/* Swipeable Collections Carousel */}
      <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-lg shadow-black/30 mt-10 w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">My Collections 📕</h2>

        {isOwnProfile && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => router.push("/collections/create")}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-medium transition"
            >
              + Add New Collection
            </button>
          </div>
        )}

        {collections.length === 0 ? (
          <p className="text-center text-zinc-500 text-sm py-8">
            No collections yet. Create your first one above!
          </p>
        ) : (
          <div
            className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
            style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}
          >
            {collections.map((col) => (
              <div
                key={col.id}
                onClick={() => router.push(`/collections/${col.id}`)}
                className="relative w-40 h-56 flex-shrink-0 snap-center rounded-2xl overflow-hidden cursor-pointer group bg-black"
              >
                <img
                  src={col.cover_url || "/CC-main-logo.png"}
                  alt={col.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md">
                  {col.item_count || 0} items
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white text-sm font-semibold tracking-tight line-clamp-1">
                    {col.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
