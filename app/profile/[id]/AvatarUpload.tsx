"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AvatarUpload({ userId, currentAvatar }) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);

  async function uploadAvatar(e) {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage (avatars bucket)
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      // Save to profile table
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Refresh page
      window.location.reload();
    } catch (error) {
      console.error("Avatar upload error:", error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <img
        src={currentAvatar || "/default-avatar.png"}
        alt="Avatar"
        className="w-24 h-24 rounded-full object-cover border border-white/20"
      />

      <label className="text-sm text-white/70">
        {uploading ? "Uploading…" : "Change Avatar"}
        <input
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          className="hidden"
          disabled={uploading}
        />
      </label>
    </div>
  );
}

