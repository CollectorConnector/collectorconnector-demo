"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import TierBadge from "@/components/TierBadge";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setProfile(data);
      setLoading(false);
    }

    fetchProfile();
  }, [id]);

  if (loading) return <div className="p-6 text-white">Loading…</div>;
  if (!profile) return <div className="p-6 text-white">Profile not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">

      {/* TOP LOGOS */}
      <div className="flex justify-between items-center opacity-80">
        <Image src="/logo-main.png" alt="Logo" width={120} height={40} />
        <Image src="/logo-icon.png" alt="Icon" width={40} height={40} />
      </div>

      {/* HEADER */}
      <div className="flex items-center gap-6 bg-[#1a1a1a] p-6 rounded-xl shadow-lg">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-700">
          <Image
            src={profile.avatar_url || "/default-avatar.png"}
            alt="Avatar"
            width={80}
            height={80}
            className="object-cover"
          />
        </div>

        {/* Identity Block */}
        <div className="flex flex-col">
          <TierBadge tier={profile.tier} />

          <h1 className="text-2xl font-semibold mt-1">{profile.display_name}</h1>
          <p className="text-gray-400">@{profile.username}</p>

          {profile.location && (
            <p className="text-gray-500 text-sm mt-1">{profile.location}</p>
          )}
        </div>
      </div>

      {/* ACTIVITY FEED */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Activity</h2>

        <div className="bg-[#1a1a1a] p-4 rounded-xl space-y-3">
          <p className="text-gray-400 text-sm">No recent activity yet</p>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Collections</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Placeholder card */}
          <div className="bg-[#1a1a1a] p-4 rounded-xl flex flex-col items-center justify-center text-gray-400">
            <p>No collections yet</p>
          </div>
        </div>
      </section>
    </div>
  );
}
