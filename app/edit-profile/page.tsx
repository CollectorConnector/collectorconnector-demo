"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import TierBadge from "@/components/TierBadge";

// ⭐ Resize avatar before upload
const resizeAvatar = (file: File, maxWidth: number = 300): Promise<File> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        0.85
      );
    };
  });
};

export default function EditProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [tier, setTier] = useState<
    "" | "DIAMOND" | "FOUNDER" | "GOLD" | "SILVER" | "BRONZE"
  >("");

  // Load existing profile
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile) {
        setName(profile.display_name || "");
        setUsername(profile.username || "");
        setBio(profile.bio || "");
        setLocation(profile.location || "");
        setAvatarUrl(profile.avatar_url || "");
        setTier((profile.tier || "").toUpperCase());
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  // ⭐ Upload avatar with resizing
  async function uploadAvatar(userId: string) {
    if (!avatarFile) return avatarUrl;

    const resized = await resizeAvatar(avatarFile, 300);

    const fileExt = resized.name.split(".").pop();
    const filePath = `${userId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, resized, { upsert: true });

    if (uploadError) {
      console.error(uploadError);
      return avatarUrl;
    }

    const { data: publicUrl } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    return publicUrl.publicUrl;
  }

  // Save profile
  async function saveProfile() {
    setSaving(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    const userId = session.user.id;

    const finalAvatarUrl = await uploadAvatar(userId);

    const updates = {
      id: userId,
      display_name: name,
      username,
      bio,
      location,
      avatar_url: finalAvatarUrl,
      tier: tier.toLowerCase(),
      updated_at: new Date(),
    };

    const { error } = await supabase.from("profiles").upsert(updates);

    setSaving(false);

    if (!error) {
      router.push(`/profile/${userId}`);
    } else {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <div className="text-center text-white py-20">Loading…</div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10 space-y-10 text-white">

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
        <div className="relative w-28 h-28 rounded-3xl overflow-hidden shadow-md border border-gray-700">
          <img
            src={avatarUrl || "/default-avatar.png"}
            className="w-full h-full object-cover object-center"
          />
        </div>

        <label className="text-sm font-medium text-blue-400 cursor-pointer">
          Change Photo
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setAvatarFile(file);
              const url = URL.createObjectURL(file);
              setAvatarUrl(url);
            }}
          />
        </label>
      </div>

      {/* Tier Preview */}
      <div className="flex justify-center">
        {tier !== "" && <TierBadge tier={tier} size="md" />}
      </div>

      {/* Tier Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Tier</label>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value as any)}
          className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700"
        >
          <option value="">Select tier</option>
          <option value="DIAMOND">Diamond</option>
          <option value="FOUNDER">Founder</option>
          <option value="GOLD">Gold</option>
          <option value="SILVER">Silver</option>
          <option value="BRONZE">Bronze</option>
        </select>
      </div>

      {/* Form */}
      <div className="space-y-6">

        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700"
          />
        </div>

      </div>

      {/* Save Button */}
      <button
        onClick={saveProfile}
        disabled={saving}
        className="w-full py-3 rounded-full bg-white text-black font-medium shadow-md hover:opacity-90 transition disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}
