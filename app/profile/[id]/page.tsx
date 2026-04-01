"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
    }

    loadProfile();
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
      {/* Avatar */}
      <img
        src={profile.avatar_url || "/default-avatar.png"}
        alt="Profile"
        className="w-24 h-24 object-cover border shadow"
        style={{ borderRadius: "35% / 30%" }}
      />

      {/* Name */}
      <h1 className="mt-4 text-2xl font-bold">
        {profile.full_name || "Unnamed User"}
      </h1>

      {/* Username */}
      <p className="text-gray-400">@{profile.username}</p>
    </div>
  );
}
