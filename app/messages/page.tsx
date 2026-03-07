"use client";

import Link from "next/link";
import TierBadge from "@/components/TierBadge";

export default function ConversationsList() {
  // Temporary mock data
  const conversations = [
    {
      id: "1",
      name: "Richard House",
      username: "richard",
      avatar: "/default-avatar.png",
      tier: "FOUNDER",
      lastMessage: "It’s looking amazing already.",
      time: "2h",
    },
    {
      id: "2",
      name: "Sarah Collins",
      username: "sarahc",
      avatar: "/default-avatar.png",
      tier: "GOLD",
      lastMessage: "Did you see the new card drop?",
      time: "5h",
    },
  ];

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

      <h1 className="text-2xl font-semibold mb-4">Messages</h1>

      <div className="space-y-3">
        {conversations.map((c) => (
          <Link
            key={c.id}
            href={`/messages/${c.id}`}
            className="flex items-center gap-4 p-3 rounded-2xl border border-gray-200 hover:bg-gray-50 transition"
          >
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm">
              <img
                src={c.avatar}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Text */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{c.name}</span>
                <TierBadge tier={c.tier} size="xs" />
              </div>

              <span className="text-sm text-gray-500">@{c.username}</span>

              <p className="text-sm text-gray-700 mt-1 truncate">
                {c.lastMessage}
              </p>
            </div>

            {/* Time */}
            <span className="text-xs text-gray-400">{c.time}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
