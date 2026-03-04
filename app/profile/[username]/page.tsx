
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ---------------------------------------------
// Types
// ---------------------------------------------
type Profile = {
  id: string;
  username: string;
  display_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  youtube?: string | null;
  ebay?: string | null;
  whatnot?: string | null;
  discord?: string | null;
  tier?: string | null;
  created_at?: string | null;
};

// ---------------------------------------------
// Helpers
// ---------------------------------------------
function fmt(n: number | undefined | null) {
  if (n == null) return "";
  try {
    return n.toLocaleString("en-GB");
  } catch {
    return String(n);
  }
}

function capitalise(s?: string | null) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Build a clickable URL for known platforms if a user typed a handle.
function asUrl(kind: "instagram" | "twitter" | "youtube" | "ebay" | "whatnot" | "discord", value?: string | null) {
  if (!value) return null;
  const v = value.trim();

  // Already a URL?
  if (/^https?:\\/\\//i.test(v)) return v;

  const handle = v.replace(/^@+/, "");

  switch (kind) {
    case "instagram":
      return `https://instagram.com/${handle}`;
    case "twitter":
      return `https://twitter.com/${handle}`;
    case "youtube":
      // If they typed a channel/user id, just try /@handle
      return `https://youtube.com/@${handle}`;
    case "ebay":
      // If not a url, assume eBay username
      return `https://www.ebay.com/usr/${handle}`;
    case "whatnot":
      return `https://www.whatnot.com/user/${handle}`;
    case "discord":
      // Discord usernames/handles aren't reliably linkable; return null to render as text.
      return null;
  }
}

// ---------------------------------------------
// Small presentational components (inline for simplicity)
// ---------------------------------------------
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ marginTop: 32, marginBottom: 12, fontSize: 14, letterSpacing: 1, color: "#9CA3AF" }}>
      {children}
    </h2>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>{children}</div>;
}

function SocialRow({
  emoji,
  label,
  value,
  href,
}: {
  emoji: string;
  label: string;
  value?: string | null;
  href?: string | null;
}) {
  if (!value) return null;
  const text = value.trim();
  const content = (
    <>
      <span style={{ width: 22, display: "inline-block" }}>{emoji}</span>
      <span style={{ color: "#9CA3AF", minWidth: 92, display: "inline-block" }}>{label}</span>
      <span style={{ color: href ? "#4ADE80" : "#fff" }}>{text}</span>
    </>
  );
  return (
    <Row>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}
        >
          {content}
        </a>
      ) : (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>{content}</div>
      )}
    </Row>
  );
}

function TierSerialBadge({ tier, serial, total }: { tier?: string | null; serial?: number | null; total?: number | null }) {
  const niceTier = tier ? capitalise(tier) : "—";
  // Choose a dot color / icon by tier
  const dot =
    tier === "gold"
      ? "🟡"
      : tier === "platinum"
      ? "🟦"
      : tier === "silver"
      ? "⚪"
      : tier === "bronze"
      ? "🟤"
      : "⬛";

  const serialText =
    serial && total ? `${fmt(serial)} of ${fmt(total)}` : total ? `— of ${fmt(total)}` : "—";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        borderRadius: 10,
        border: "1px solid #1F2937",
        background: "linear-gradient(180deg, rgba(31,41,55,0.6), rgba(17,24,39,0.6))",
        boxShadow: "0 0 0 1px rgba(74,222,128,0.08), 0 10px 30px rgba(0,0,0,0.35)",
      }}
    >
      <span style={{ color: "#fff", fontWeight: 600 }}>
        {niceTier} {dot}
      </span>
      <span style={{ color: "#9CA3AF" }}>—</span>
      <span style={{ color: "#4ADE80", fontWeight: 600 }}>{serialText}</span>
    </div>
  );
}

// ---------------------------------------------
// Main page
// ---------------------------------------------
export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const username = useMemo(() => (Array.isArray(params?.username) ? params.username[0] : params?.username || ""), [params]);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [serialNumber, setSerialNumber] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!username) return;
      setLoading(true);
      setError(null);

      // 1) Get the profile by username
      const { data: p, error: e1 } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (e1) {
        setError(e1.message);
        setLoading(false);
        return;
      }
      if (!p) {
        setError("Profile not found.");
        setLoading(false);
        return;
      }

      setProfile(p);

      // 2) Get total number of profiles (for "… of TOTAL")
      const { count: total, error: e2 } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (!cancelled) {
        if (!e2) setTotalCount(total ?? null);
      }

      // 3) Compute serial number (row number by created_at)
      if (p?.created_at) {
        const { count: serial, error: e3 } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .lte("created_at", p.created_at);

        if (!cancelled) {
          if (!e3) setSerialNumber(serial ?? null);
        }
      } else {
        // created_at not available -> fall back to null (we'll render "— of TOTAL")
        setSerialNumber(null);
      }

      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [username]);

  // Render
  return (
    <div style={{ background: "#000", minHeight: "100vh", color: "#fff" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 20px" }}>
        {/* Header / Title */}
        <header style={{ marginBottom: 20 }}>
          <a href="/" style={{ color: "#4ADE80", textDecoration: "none", fontWeight: 600 }}>
            CollectorConnector
          </a>
        </header>

        {loading ? (
          <p style={{ color: "#9CA3AF" }}>Loading profile…</p>
        ) : error ? (
          <div
            style={{
              border: "1px solid #7F1D1D",
              background: "rgba(127,29,29,0.2)",
              color: "#FCA5A5",
              padding: 14,
              borderRadius: 8,
            }}
          >
            {error}
          </div>
        ) : profile ? (
          <>
            {/* Avatar + Name */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 12, // squared with rounded edges
                  overflow: "hidden",
                  background: "#111827",
                  border: "1px solid #1F2937",
                  boxShadow: "0 4px 18px rgba(0,0,0,0.35)",
                }}
              >
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt={`${profile.username} avatar`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "grid",
                      placeItems: "center",
                      color: "#9CA3AF",
                      fontSize: 12,
                    }}
                  >
                    No avatar
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
                  {profile.display_name || profile.username}
                </h1>
                <div style={{ color: "#9CA3AF" }}>@{profile.username}</div>

                <TierSerialBadge tier={profile.tier} serial={serialNumber} total={totalCount} />
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p style={{ color: "#D1D5DB", lineHeight: 1.5, marginTop: 12 }}>{profile.bio}</p>
            )}

            {/* Socials */}
            <SectionTitle>SOCIAL LINKS</SectionTitle>
            <div>
              <SocialRow
                emoji="📸"
                label="Instagram"
                value={profile.instagram || undefined}
                href={asUrl("instagram", profile.instagram)}
              />
              <SocialRow
                emoji="🐦"
                label="Twitter / X"
                value={profile.twitter || undefined}
                href={asUrl("twitter", profile.twitter)}
              />
              <SocialRow
                emoji="▶️"
                label="YouTube"
                value={profile.youtube || undefined}
                href={asUrl("youtube", profile.youtube)}
              />
            </div>

            {/* Marketplaces */}
            <SectionTitle>MARKETPLACES</SectionTitle>
            <div>
              <SocialRow
                emoji="🛒"
                label="eBay"
                value={profile.ebay || undefined}
                href={asUrl("ebay", profile.ebay)}
              />
              <SocialRow
                emoji="🔥"
                label="Whatnot"
                value={profile.whatnot || undefined}
                href={asUrl("whatnot", profile.whatnot)}
              />
              <SocialRow
                emoji="💬"
                label="Discord"
                value={profile.discord || undefined}
                href={asUrl("discord", profile.discord)}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
