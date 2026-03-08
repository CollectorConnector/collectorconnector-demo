"use client";

import { useState } from "react";
import TierBadge from "@/components/TierBadge";

export default function EditProfilePage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [niche, setNiche] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Allow empty OR valid tier values
  const [tier, setTier] = useState<
    "" | "FOUNDER" | "GOLD" | "SILVER" | "BRONZE" | "DIAMOND"
  >("");

  return (
    <div className="max-w-xl mx-auto px-6 py-10 space-y-10">

      {/* CC Logo Header */}
      <div className="flex justify-center mb-4 opacity-80">
        <img
          src="/cc-logo-black.png"
          alt="CollectorConnector"
          className="h-10"
        />
      </div>

      {/* Avatar Upload */}
      <div className="flex flex-col items-center space-y-3">
        <div className="relative w-28 h-28 rounded-3xl overflow-hidden shadow-md border border-gray-200">
          <img
            src={avatarUrl || "/default-avatar.png"}
            className="w-full h-full object-cover"
          />
        </div>

        <label className="text-sm font-medium text-blue-600 cursor-pointer">
          Change Photo
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              setAvatarUrl(url);
            }}
          />
        </label>
      </div>

      {/* Tier Preview */}
      <div className="flex justify-center">
        <TierBadge tier={tier} size="md" />
      </div>

      {/* Form */}
      <div className="space-y-6">

        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Collector Niche</label>
          <input
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black transition"
          />
        </div>

      </div>

      {/* Save Button */}
      <button
        className="w-full py-3 rounded-full bg-black text-white font-medium shadow-md hover:opacity-90 transition"
      >
        Save Changes
      </button>
    </div>
  );
}
