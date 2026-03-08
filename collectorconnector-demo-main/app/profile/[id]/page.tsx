"use client";

import TierBadge from "@/components/TierBadge";

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;

  // TEMP MOCK DATA — replace with Supabase later
  const user = {
    id,
    name: "Stacy Pearce",
    username: "stacy_collects",
    avatar: "/default-avatar.png",
    bio: "Founder of CollectorConnector. Collector of Pokémon, vintage cards, and rare finds.",
    niche: "Pokémon & Vintage Cards",
    tier: "FOUNDER" as "FOUNDER" | "GOLD" | "SILVER" | "BRONZE" | "DIAMOND",
    collections: [
      { id: 1, title: "Pokémon Grails", count: 12 },
      { id: 2, title: "Vintage Cards", count: 8 },
      { id: 3, title: "Rare Finds", count: 5 },
    ],
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 text-white space-y-10">

      {/* Header */}
      <div className="flex items-center gap-4">
        <img
          src={user.avatar}
          className="w-24 h-24 rounded-3xl object-cover border border-gray-700"
        />

        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <span className="text-gray-400">@{user.username}</span>

          <div className="mt-2">
            <TierBadge tier={user.tier} size="md" />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Bio</h2>
        <p className="text-gray-300">{user.bio}</p>
      </div>

      {/* Niche */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Collector Niche</h2>
        <p className="text-gray-300">{user.niche}</p>
      </div>

      {/* Collections */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Collections</h2>

        <div className="space-y-3">
          {user.collections.map((col) => (
            <div
              key={col.id}
              className="p-4 rounded-2xl bg-gray-900 border border-gray-800"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{col.title}</span>
                <span className="text-gray-400">{col.count} items</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
