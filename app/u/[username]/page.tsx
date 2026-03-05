// app/u/[username]/page.tsx

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import TierBadge from "../../../components/TierBadge";

// Neutral palette
const textPrimary = "#E5E7EB";
const textSecondary = "#9CA3AF";
const borderColor = "#1f1f1f";
const accent = "#4ADE80";

// Tiny bits
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </h2>
  );
}

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        border: `1px solid ${borderColor}`,
        color: textPrimary,
        padding: "8px 12px",
        borderRadius: 8,
        fontWeight: 700,
        textDecoration: "none",
        transition: "color 120ms ease, border-color 120ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = accent;
        e.currentTarget.style.borderColor = "#264e3a";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = textPrimary;
        e.currentTarget.style.borderColor = borderColor;
      }}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </a>
  );
}

// Safe Supabase client (string fallback prevents TS build errors)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabase = createClient(url, anon);

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;

  // Wrap Supabase calls to avoid server crashes
  async function safeFetch<T>(fn: () => Promise<T>): Promise<{ data?: any; error?: any }> {
    try {
      // @ts-ignore supabase returns { data, error }
      const res = await fn();
      // @ts-ignore
      return { data: res.data, error: res.error };
    } catch (e) {
      console.error("Server fetch crash:", e);
      return { error: e };
    }
  }

  // ---- PROFILE ----
  const { data: profile, error: profileErr } = await safeFetch(() =>
    supabase
      .from("profiles")
      .select(
        "id, username, display_name, bio, avatar_url, instagram, ebay, whatnot, website, tier"
      )
      .eq("username", username)
      .maybeSingle()
  );

  if (profileErr) console.error("Profile fetch error:", profileErr);

  if (!profile) {
    return (
      <div
        style={{
          background: "black",
          color: textPrimary,
          padding: 40,
          minHeight: "100vh",
        }}
      >
        <nav
          style={{
            height: 64,
            borderBottom: `1px solid ${borderColor}`,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            margin: "-40px -40px 24px -40px",
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/CC-SML-Logo.png"
              alt="CollectorConnector"
              width={42}
              height={42}
              style={{ display: "block" }}
            />
            <span style={{ fontWeight: 800, color: textPrimary }}>CollectorConnector</span>
          </Link>
        </nav>

        <h1 style={{ color: accent, marginTop: 12 }}>Profile not found</h1>
        <p>No user found for @{username}.</p>

        <Link
          href="/"
          style={{
            display: "inline-block",
            marginTop: 16,
            color: textPrimary,
            border: `1px solid ${borderColor}`,
            padding: "8px 12px",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          Go Home
        </Link>
      </div>
    );
  }

  // ---- COLLECTIONS ----
  const { data: collections, error: collErr } = await safeFetch(() =>
    supabase
      .from("collections")
      .select("id, title, niche, cover_url, item_count, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
  );

  if (collErr) console.error("Collections fetch error:", collErr);

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
      {/* NAVBAR */}
      <nav
        style={{
          height: 64,
          borderBottom: `1px solid ${borderColor}`,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(6px)",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/CC-SML-Logo.png"
            alt="CollectorConnector"
            width={42}
            height={42}
            style={{ display: "block" }}
          />
          <span style={{ fontWeight: 800, color: textPrimary }}>CollectorConnector</span>
        </Link>

        <div style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
          <Link
            href="/upload"
            style={{
              color: textPrimary,
              border: `1px solid ${borderColor}`,
              padding: "8px 12px",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            Upload
          </Link>
        </div>
      </nav>

      {/* HEADER */}
      <header
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
