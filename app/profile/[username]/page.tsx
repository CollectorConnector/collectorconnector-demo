// app/profile/[username]/page.tsx
"use client";

import Link from "next/link";
import TierBadge from "../../../components/TierBadge";

const textPrimary = "#E5E7EB";
const textSecondary = "#9CA3AF";
const borderColor = "#1f1f1f";
const accent = "#4ADE80";

export default function ProfilePage({ params }: { params: { username: string } }) {
  const username = params.username;

  // TEMP MOCK DATA (replace with real fetch later)
  const profile = {
    username,
    displayName: "Stacy Pearce",
    bio: "Collector of watches, Pokémon, coins, and pins. Founder of CollectorConnector.",
    tier: "FOUNDER",
    avatar: "/default-profile.png",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "black",
        color: textPrimary,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* PROFILE HEADER (div instead of header to avoid duplicate nav) */}
      <div
        style={{
          padding: "32px 16px",
          borderBottom: `1px solid ${borderColor}`,
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
              border: `1px solid ${borderColor}`,
            }}
          >
            <img
              src={profile.avatar}
              alt={profile.displayName}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* PROFILE INFO */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>
                {profile.displayName}
              </h1>
              <TierBadge tier={profile.tier} size="md" showCount />
            </div>

            <div style={{ color: textSecondary }}>@{profile.username}</div>

            {profile.bio && (
              <p style={{ maxWidth: 740, marginTop: 8 }}>{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main style={{ padding: "24px 16px", flex: 1 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <h2
            style={{
              margin: "8px 0 16px",
              fontSize: 18,
              fontWeight: 800,
              color: textPrimary,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                background: accent,
                borderRadius: "50%",
                boxShadow: "0 0 10px #4ADE80",
              }}
            />
            Collections
          </h2>

          <div
            style={{
              border: `1px dashed ${borderColor}`,
              color: textSecondary,
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
