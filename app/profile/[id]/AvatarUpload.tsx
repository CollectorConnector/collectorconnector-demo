"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type AvatarUploadProps = {
  userId: string;
  currentAvatar?: string | null;
};

export default function AvatarUpload({ userId, currentAvatar }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);

      const ext = file.name.split(".").pop();
      const filePath = `${userId}/avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      window.location.reload();
    } catch (err) {
      console.error("Avatar upload error:", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="overflow-hidden rounded-[28%] border border-white/15 ring-1 ring-white/10 shadow-[0_0_40px_rgba(255,255,255,0.12)]">
        <img
          src={currentAvatar || "/diamond2.png"}
          alt="Avatar"
          className="h-28 w-28 sm:h-32 sm:w-32 object-cover"
        />
      </div>

      <label className="text-[11px] text-white/70 cursor-pointer">
        {uploading ? "Uploading…" : "Change avatar"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
          disabled={uploading}
        />
      </label>
    </div>
  );
}
