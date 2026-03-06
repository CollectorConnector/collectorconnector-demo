"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import TierBadge from "@/components/TierBadge";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UserProfile({ params }: { params: { username: string } }) {
  const { username } = params;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // -----------------------------
  // FETCH PROFILE
  // -----------------------------
  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (!error) setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [username]);

  // -----------------------------
  // AVATAR UPLOAD HANDLER
  // -----------------------------
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    const ext = file.name.split(".").pop();
    const filePath = `${profile.id}/${Date.now()}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // Update DB
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", profile.id);

    if (updateError) {
      console.error("DB update error:", updateError);
      return;
    }

    // Update UI
    setProfile((prev: any) => ({ ...prev, avatar_url: publicUrl }));
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!profile) return <div style={{ padding: 20 }}>User not found</div>;

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleAvatarUpload}
      />

      {/* Avatar */}
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          overflow: "hidden",
          border: "2px solid #333",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          background: "#111",
          marginBottom: 20,
        }}
      >
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="Avatar"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ color: "#666", fontSize: 12 }}>+ Add Photo</span>
        )}
      </div>

      {/* Display Name */}
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>{profile.display_name}</h1>

      {/* Tier Badge */}
      <TierBadge
        tier={profile.tier?.toUpperCase()}
        size="md"
        showCount={profile.tier?.toLowerCase() === "founder"}
        count={profile.tier?.toLowerCase() === "founder" ? 1 : undefined}
      />

      {/* Username */}
      <div style={{ marginTop: 10, color: "#9CA3AF" }}>@{profile.username}</div>
    </div>
  );
}
