// components/AvatarUploader.tsx
"use client";

import React, { useState } from "react";
import { uploadAvatarAndUpdateProfile } from "@/lib/uploadAvatar";
import { supabase } from "@/lib/supabase";

type Props = {
  userId?: string;
  bucket?: string;
  editable?: boolean;
  onSaved?: (url: string) => void;
};

export default function AvatarUploader({
  userId: userIdProp,
  bucket = "avatars",
  editable = true,
  onSaved,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function getCurrentUserId() {
    if (userIdProp) return userIdProp;
    try {
      const { data } = await supabase.auth.getUser();
      return data?.user?.id ?? null;
    } catch {
      return null;
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("No authenticated user found");

      const { displayUrl } = await uploadAvatarAndUpdateProfile(file, userId, { bucket });
      if (!displayUrl) throw new Error("No display URL returned");

      setPreviewUrl(displayUrl);
      onSaved?.(displayUrl);
    } catch (err: any) {
      setError(err?.message || "Upload failed");
    } finally {
      setLoading(false);
      (e.target as HTMLInputElement).value = "";
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="avatar preview"
          className="w-24 h-24 object-cover border shadow overflow-hidden"
          style={{ borderRadius: "35% / 30%" }} // ⭐ SQUIRCLE
          onError={(ev) => {
            ev.currentTarget.src = "/default-avatar.png";
            ev.currentTarget.onerror = null;
          }}
        />
      ) : (
        <div
          className="w-24 h-24 bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden"
          style={{ borderRadius: "35% / 30%" }} // ⭐ SQUIRCLE
        >
          No photo
        </div>
      )}

      {editable && (
        <>
          <label className="px-4 py-2 rounded bg-blue-600 text-white cursor-pointer">
            {loading ? "Uploading…" : "Change avatar"}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />
          </label>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </>
      )}
    </div>
  );
}
