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
  const [isEditing, setIsEditing] = useState(false);

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

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", profile.id);

    if (updateError) {
      console.error("DB update error:", updateError);
      return;
    }

    setProfile((prev: any) => ({ ...prev, avatar_url: publicUrl }));
  };

  // -----------------------------
  // SAVE PROFILE CHANGES
  // -----------------------------
  const handleSaveProfile = async (updates: any) => {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", profile.id);

    if (!error) {
      setProfile((prev: any) => ({ ...prev, ...updates }));
      setIsEditing(false);
    }
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

      {/* Edit Profile Button */}
      <button
        onClick={() => setIsEditing(true)}
        style={{
          marginTop: 20,
          padding: "8px 14px",
          borderRadius: 8,
          background: "#222",
          color: "#fff",
          border: "1px solid #333",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        Edit Profile
      </button>

      {/* Modal */}
      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />
    </div>
  );
}

// ------------------------------------------------------
// EDIT PROFILE MODAL COMPONENT
// ------------------------------------------------------
function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onSave: (updates: any) => void;
}) {
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [username, setUsername] = useState(profile.username || "");
  const [bio, setBio] = useState(profile.bio || "");

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#111",
          padding: 24,
          borderRadius: 12,
          width: "90%",
          maxWidth: 400,
          border: "1px solid #333",
        }}
      >
        <h2 style={{ marginBottom: 16, fontSize: 20, fontWeight: 700 }}>
          Edit Profile
        </h2>

        <label style={{ fontSize: 12, opacity: 0.7 }}>Display Name</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginTop: 4,
            marginBottom: 16,
            borderRadius: 8,
            border: "1px solid #333",
            background: "#000",
            color: "#fff",
          }}
        />

        <label style={{ fontSize: 12, opacity: 0.7 }}>Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginTop: 4,
            marginBottom: 16,
            borderRadius: 8,
            border: "1px solid #333",
            background: "#000",
            color: "#fff",
          }}
        />

        <label style={{ fontSize: 12, opacity: 0.7 }}>Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          style={{
            width: "100%",
            padding: 10,
            marginTop: 4,
            marginBottom: 20,
            borderRadius: 8,
            border: "1px solid #333",
            background: "#000",
            color: "#fff",
            resize: "none",
          }}
        />

        <button
          onClick={() =>
            onSave({
              display_name: displayName,
              username,
              bio,
            })
          }
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            background: "#4ADE80",
            color: "#000",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            marginBottom: 10,
          }}
        >
          Save Changes
        </button>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            background: "#222",
            color: "#fff",
            fontWeight: 600,
            border: "1px solid #333",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
