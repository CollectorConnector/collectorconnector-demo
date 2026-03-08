"use client";

import Link from "next/link";
import TierBadge from "@/components/TierBadge";

export default function MessagesPage() {
  // Mock conversations (replace with Supabase later)
  const conversations = [
    {
      id: "1",
      name: "Alex",
      username: "alex123",
      avatar: "/default-avatar.png",
      tier: "GOLD" as "FOUNDER" | "GOLD" | "SILVER" | "BRONZE" | "DIAMOND",
      lastMessage: "Hey! What do you collect?",
    },
    {
      id: "2",
      name: "Jamie",
      username: "jamie_cards",
      avatar: "/default-avatar.png",
      tier: "SILVER" as "FOUNDER" | "GOLD" | "SILVER" | "BRONZE" | "DIAMOND",
      lastMessage: "Got any new pulls?",
    },
    {
      id: "3",
      name: "Taylor",
      username: "taylor_collects",
      avatar: "/default-avatar.png",
      tier: "BRONZE" as "FOUNDER" | "GOLD" | "SILVER" | "BRONZE" | "DIAMOND",
      lastMessage: "Let’s trade sometime!",
    },
  ];

  return (
    <div className="p-6 space-y-6 text-white">

      <h1 className="text-2xl font-bold mb-4">Messages</h1>

      <div className="space-y-4">
        {conversations.map((c) => (
          <Link
            key={c.id}
            href={`/messages/${c.id}`}
            className="flex items-center gap-4 p-4 rounded-2xl bg-gray-900 hover:bg-gray-800 transition"
          >
            {/* Avatar */}
            <img
              src={c.avatar}
              className="w-12 h-12 rounded-2xl object-cover"
            />

            {/* Name + Tier + Username */}
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{c.name}</span>

                {/* TierBadge is now ALWAYS valid */}
                <TierBadge tier={c.tier} size="xs" />
              </div>

              <span className="text-sm text-gray-500">@{c.username}</span>
            </div>

            {/* Last message preview */}
            <span className="text-sm text-gray-400 truncate max-w-[120px]">
              {c.lastMessage}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
