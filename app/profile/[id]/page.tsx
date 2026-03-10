"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

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
    <div className="max-w-3xl mx-auto p-6 space-y-10">

      {/* MAIN LOGO */}
      <div className="flex justify-center opacity-90 mb-4">
        <Image src="/logo-main.png" alt="Logo" width={150} height={50} />
      </div>

      {/* HEADER */}
      <div className="flex flex-col items-center text-center bg-[#1a1a1a] p-8 rounded-2xl shadow-xl">

        {/* Avatar */}
        <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-700 shadow-md mb-4">
          <Image
            src={profile.avatar_url || "/default-avatar.png"}
            alt="Avatar"
            width={96}
            height={96}
            className="object-cover"
          />
        </div>

        {/* Name */}
        <h1 className="text-2xl font-semibold">{profile.display_name}</h1>
        <p className="text-gray-400">@{profile.username}</p>

        {/* Location */}
        {profile.location && (
          <p className="text-gray-500 text-sm mt-1">{profile.location}</p>
        )}

        {/* Tier Badge */}
        {profile.tier && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-gray-200 to-white text-black text-sm font-medium shadow-sm border border-gray-300">
            <span>💎</span>
            <span>{profile.tier} Tier</span>
          </div>
        )}
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
          <div className="bg-[#1a1a1a] p-4 rounded-xl flex flex-col items-center justify-center text-gray-400 h-32">
            <p>No collections yet</p>
          </div>
        </div>
      </section>
    </div>
  );
}
