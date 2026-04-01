"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [collections, setCollections] = useState<any[]>([]);

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

  return (
    <div className="p-6 text-white flex flex-col items-center">

      {/* Avatar (50% smaller, matching logo squircle) */}
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

      {/* Edit Profile */}
      <button
        className="mt-4 px-4 py-2 rounded-lg border border-white/20 text-sm"
        onClick={() => alert("Edit Profile coming soon")}
      >
        Edit Profile
      </button>

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

      {/* Collections */}
<div className="w-full mt-10">
  <h2 className="text-lg font-semibold mb-4">Collections</h2>

  {collections.length === 0 ? (
    <p className="text-gray-500 text-sm">No collections yet.</p>
  ) : (
    <div
      className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
      style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}
    >
      {collections.map((col) => (
        <div
          key={col.id}
          className="w-32 flex-shrink-0 snap-center cursor-pointer"
        >
          <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-white/10 bg-[#111]">
            <img
              src={col.cover_url || "/CC-main-logo.png"}
              alt={col.name}
              className="w-full h-full object-cover"
            />
          </div>

          <p className="mt-2 text-sm font-semibold truncate">{col.name}</p>
          <p className="text-xs text-gray-400">
            {col.item_count || 0} items
          </p>
        </div>
      ))}
    </div>
  )}
</div>
