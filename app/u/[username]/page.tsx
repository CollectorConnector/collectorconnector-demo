"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import TierBadge from "../../../components/TierBadge";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UserProfile({ params }: { params: { username: string } }) {
  const { username } = params;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (!error) setProfile(data);
      setLoading(false);
    }

    loadProfile();
  }, [username]);

  if (loading) {
    return (
      <div style={{ padding: 40, color: "#9CA3AF" }}>
        Loading profile…
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: 40, color: "#9CA3AF" }}>
        User not found.
      </div>
    );
  }

  // Determine tier
  const tier = profile.tier?.toLowerCase();

  let badgeTier: "FOUNDER" | "GOLD" | "SILVER" | "BRONZE" | "EMERALD" = "EMERALD";

  if (tier === "founder") badgeTier = "FOUNDER";
  else if (tier === "gold") badgeTier = "GOLD";
  else if (tier === "silver") badgeTier = "SILVER";
  else if (tier === "bronze") badgeTier = "BRONZE";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "black",
        color: "#E5E7EB",
        paddingBottom: 80,
      }}
    >
      {/* PROFILE HEADER */}
      <div
        style={{
          padding: "32px 16px",
          borderBottom: "1px solid #1f1f1f",
          background:
            "radial-gradient(1200px 480px at 10% -10%, rgba(74,222,128,0.10), rgba(0,0,0,0))",
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "100px 1fr",
            gap: 16,
            alignItems: "center",
          }}
        >
          {/* AVATAR */}
          <div
            style={{
              width: 100,
              height: 100,
              overflow: "hidden",
              borderRadius: 16,
              border: "1px solid #1f1f1f",
              background: "#111",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              color: "#444",
            }}
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              "?"
            )}
          </div>

          {/* PROFILE INFO */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>
                {profile.display_name || username}
              </h1>

              {/* TIER BADGE */}
              <TierBadge tier={badgeTier} size="md" showCount={badgeTier === "FOUNDER"} count={badgeTier === "FOUNDER" ? 1 : undefined} />
            </div>

            <div style={{ color: "#9CA3AF" }}>@{username}</div>

            {profile.bio && (
              <p style={{ maxWidth: 740, marginTop: 8 }}>{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* COLLECTIONS */}
      <main style={{ padding: "24px 16px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <h2
            style={{
              margin: "8px 0 16px",
              fontSize: 18,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                background: "#4ADE80",
                borderRadius: "50%",
                boxShadow: "0 0 10px #4ADE80",
              }}
            />
            Collections
          </h2>

          <div
            style={{
              border: "1px dashed #1f1f1f",
              color: "#9CA3AF",
              padding: 20,
              borderRadius: 12,
            }}
          >
            No collections yet.
          </div>
        </div>
      </main>
    </div>
  );
}
