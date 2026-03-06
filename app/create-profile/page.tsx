"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Profile = {
  id: string;
  username: string | null;
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
};

export default function CreateProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [session, setSession] = useState<any>(null);

  // Form state
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [youtube, setYoutube] = useState("");
  const [ebay, setEbay] = useState("");
  const [whatnot, setWhatnot] = useState("");
  const [discord, setDiscord] = useState("");
  const [tier, setTier] = useState("bronze");

  // Load session
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/signup");
        return;
      }
      setSession(session);
      setLoading(false);
    })();
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!session) return;

    setSaving(true);
    setMessage(null);

    const payload: Partial<Profile> & { id: string } = {
      id: session.user.id,
      username: username || null,
      display_name: displayName || null,
      bio: bio || null,
      instagram: instagram || null,
      twitter: twitter || null,
      youtube: youtube || null,
      ebay: ebay || null,
      whatnot: whatnot || null,
      discord: discord || null,
      tier: tier || null,
    };

    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });

    setSaving(false);

    if (error) {
      setMessage({ type: "err", text: error.message });
    } else {
      setMessage({ type: "ok", text: "Profile created successfully." });
      router.push("/account");
    }
  }

  if (loading) {
    return (
      <div style={{ color: "#fff", padding: 40, textAlign: "center" }}>
        <h1>Loading…</h1>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "720px",
          padding: "32px",
          background: "#111",
          border: "1px solid #1F2937",
          borderRadius: "14px",
          color: "#fff",
          boxShadow: "0 0 40px rgba(0,0,0,0.4)",
        }}
      >
        {/* LOGO */}
        <img
          src="/CC-main-logo.png"
          alt="CollectorConnector"
          style={{
            width: "160px",
            display: "block",
            margin: "0 auto 28px",
          }}
        />

        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "6px",
            textAlign: "center",
          }}
        >
          Create your profile
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#9CA3AF",
            marginBottom: "24px",
          }}
        >
          Tell collectors who you are
        </p>

        {message && (
          <div
            style={{
              background: message.type === "ok" ? "rgba(74,222,128,0.15)" : "rgba(255,0,0,0.2)",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "18px",
              color: message.type === "ok" ? "#86efac" : "#ff6b6b",
              border:
                message.type === "ok"
                  ? "1px solid rgba(74,222,128,0.35)"
                  : "1px solid rgba(255,0,0,0.35)",
              fontSize: "14px",
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }}>
          {/* Username */}
          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="username" style={{ color: "#D1D5DB" }}>
              Username
            </label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="stacypearce123"
              style={{
                padding: 12,
                borderRadius: 8,
                border: "1px solid #1F2937",
                background: "#0d0d0d",
                color: "#fff",
                outline: "none",
              }}
              required
            />
          </div>

          {/* Display Name */}
          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="displayName" style={{ color: "#D1D5DB" }}>
              Display name
            </label>
            <input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Stacy Pearce"
              style={{
                padding: 12,
                borderRadius: 8,
                border: "1px solid #1F2937",
                background: "#0d0d0d",
                color: "#fff",
                outline: "none",
              }}
            />
          </div>

          {/* Bio */}
          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="bio" style={{ color: "#D1D5DB" }}>
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="What do you collect?"
              style={{
                padding: 12,
                borderRadius: 8,
                border: "1px solid #1F2937",
                background: "#0d0d0d",
                color: "#fff",
                outline: "none",
              }}
            />
          </div>

          {/* SOCIAL LINKS */}
          <h3 style={{ marginTop: 10, color: "#9CA3AF", fontSize: 14, letterSpacing: 1 }}>
            SOCIAL LINKS
          </h3>

          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="instagram" style={{ color: "#D1D5DB" }}>
              Instagram
            </label>
            <input
              id="instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@yourhandle or full URL"
              style={{
                padding: 12,
                borderRadius: 8,
                border: "1px solid #1F2937",
                background: "#0d0d0d",
                color: "#fff",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="twitter" style={{ color: "#D1D5DB" }}>
              Twitter / X
            </label>
            <input
              id="twitter"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="@yourhandle or full URL"
              style={{
                padding: 12,
                borderRadius: 8,
                border: "1px solid #1F2937",
                background: "#0d0d0d",
                color: "#fff",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="youtube" style={{ color: "#D1D5DB" }}>
              YouTube
            </label>
            <input
              id="youtube"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              placeholder="channel link or @handle"
              style={{
                padding: 12,
                borderRadius: 8,
                border: "1px solid #1F2937",
                background: "#0d0d0d",
                color: "#fff",
                outline: "none",
              }}
            />
          </div>

          {/* MARKETPLACES */}
          <h3 style={{ marginTop: 10, color: "#9CA3AF", fontSize: 14, letterSpacing: 1 }}>
            MARKETPLACES
          </h3>

          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="ebay" style={{ color: "#D1D5DB" }}>
              eBay
            </label>
            <input
              id="ebay"
              value={ebay}
              onChange={(e) => setEbay(e.target.value)}
              placeholder="eBay username or full URL"
              style={{
                padding: 12,
                borderRadius: 8,
                border: "1px solid #1F2937",
                background: "#0d0d0d",
                color: "#fff",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="whatnot" style={{ color: "#D1D5DB" }}>
              Whatnot
            </label>
            <input
              id="whatnot"
              value={whatnot}
              onChange={(e) => setWhatnot(e.target.value)}
              placeholder="Whatnot username or full URL"
              style={{
                padding: 12,
                borderRadius: 8,
                border: "1px solid #1F2937",
                background: "#0d0d0d",
                color: "#fff",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="discord" style={{ color: "#D1D5DB" }}>
              Discord
            </label>
            <input
              id="discord"
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
              placeholder="@handle or any relevant link"
              style={{
                padding: 12,
                borderRadius: 8,
                border: "1px solid #1F2937",
                background: "#0d0d0d",
                color: "#fff",
                outline: "none",
              }}
            />
          </div>

          {/* TIER */}
          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="tier" style={{ color: "#D1D5DB" }}>
              Tier
            </label>
            <select
              id="tier"
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              style={{
                padding: 12,
                borderRadius: 8,
                border: "1px solid #1F2937",
                background: "#000",
                color: "#fff",
                outline: "none",
              }}
            >
              <option value="bronze">Bronze 🟤</option>
              <option value="silver">Silver ⚪</option>
              <option value="gold">Gold 🟡</option>
              <option value="platinum">Platinum 🟦</option>
            </select>
          </div>

          {/* SAVE BUTTON */}
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "12px 16px",
              background: "#4ADE80",
              color: "#000",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              cursor: "pointer",
              opacity: saving ? 0.7 : 1,
              marginTop: 8,
            }}
          >
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
