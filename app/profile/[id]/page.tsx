"use client";

import Link from "next/link";
import TierBadge from "@/components/TierBadge";

export default function ProfilePage({ params }) {
  const { id } = params;

  // TEMP MOCK DATA — replace with Supabase later
  const mockProfiles = {
    "1": {
      name: "Richard House",
      username: "richard",
      avatar: "/default-avatar.png",
      tier: "FOUNDER",
      bio: "Co-founder energy. Collector of rare things.",
    },
    "2": {
      name: "Sarah Collins",
      username: "sarahc",
      avatar: "/default-avatar.png",
      tier: "GOLD",
      bio: "Vintage collector & marketplace nerd.",
    },
  };

  const profile = mockProfiles[id] || {
    name: "Unknown User",
    username: "unknown",
    avatar: "/default-avatar.png",
    tier: "BRONZE",
    bio: "This user has no bio yet.",
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-8 space-y-6">

      {/* Avatar */}
      <div className="flex justify-center">
        <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-md">
          <img
            src={profile.avatar}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Name + Tier */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">{profile.name}</h1>
        <div className="flex justify-center">
          <TierBadge tier={profile.tier} size="md" />
        </div>
        <p className="text-gray-500">@{profile.username}</p>
      </div>

      {/* Bio */}
      <p className="text-center text-gray-700">{profile.bio}</p>

      {/* MESSAGE BUTTON */}
      <Link
        href={`/messages/${id}`}
        className="block w-full py-3 rounded-full bg-black text-white font-medium text-center"
      >
        Message
      </Link>

      {/* Placeholder for collections or other sections */}
      <div className="pt-6 border-t border-gray-200">
        <h2 className="text-lg font-semibold mb-3">Collections</h2>
        <p className="text-gray-500">No collections yet.</p>
      </div>

    </div>
  );
}
