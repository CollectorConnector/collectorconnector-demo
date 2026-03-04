
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Profile = {
  id: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  ebay: string | null;
  whatnot: string | null;
  discord: string | null;
  tier: string | null;
};

export default function EditProfilePage() {
  const router = useRouter();

  // session & load state
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // form state
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [youtube, setYoutube] = useState("");
  const [ebay, setEbay] = useState("");
  const [whatnot, setWhatnot] = useState("");
  const [discord, setDiscord] = useState("");

  const [tier, setTier] = useState("bronze");

  // Load session and existing profile
  useEffect(() => {
    async function run() {
      const { data: { session } } = await supabase.auth.getSession();

      // Not logged in → go to login
      if (!session) {
        router.push("/auth/login");
        return;
      }

      setSession(session);

      // Load their profile (if any)
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (p) {
        setUsername(p.username || "");
        setBio(p.bio || "");
        setAvatarUrl(p.avatar_url || "");
        setInstagram(p.instagram || "");
        setTwitter(p.twitter || "");
        setYoutube(p.youtube || "");
        setEbay(p.ebay || "");
        setWhatnot(p.whatnot || "");
        setDiscord(p.discord || "");
        setTier(p.tier || "bronze");
      }

      setLoading(false);
    }

    run();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    setMessage(null);
    setSaving(true);

    // Prepare upsert payload
    const payload: Partial<Profile> & { id: string } = {
      id: session.user.id,
      username: username || null,
      bio: bio || null,
      avatar_url: avatarUrl || null,
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
      setMessage({ type: "ok", text: "Profile saved successfully." });
    }
  }

  if (loading) {
    return (
      <div style={{ color: "#fff", padding: "40px" }}>
        <h1>Loading profile…</h1>
      </div>
    );
    }

  return (
    <div
      style={{
        maxWidth: "720px",
        margin: "60px auto",
        padding: "24px",
        background: "#111",
        border: "1px solid #1F2937",
        borderRadius: "12px",
        color: "#fff",
      }}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "18px" }}>Edit Profile</h1>

      {/* Messages */}
      {message && (
        <div
          style={{
            background:
              message.type === "ok" ? "rgba(74,222,128,0.15)" : "rgba(255,0,0,0.2)",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "15px",
            color: message.type === "ok" ? "#86efac" : "#ff6b6b",
            border:
              message.type === "ok"
                ? "1px solid rgba(74,222,128,0.35)"
                : "1px solid rgba(255,0,0,0.35)",
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: "grid", gap: "14px" }}>
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
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #1F2937",
              outline: "none",
            }}
            required
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
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #1F2937",
              outline: "none",
            }}
          />
        </div>

        {/* Avatar URL */}
        <div style={{ display: "grid", gap: 6 }}>
          <label htmlFor="avatar" style={{ color: "#D1D5DB" }}>
            Avatar URL
          </label>
          <input
            id="avatar"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://…/avatar.png"
            style={{
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #1F2937",
              outline: "none",
            }}
          />
        </div>

        {/* Tier */}
        <div style={{ display: "grid", gap: 6 }}>
          <label htmlFor="tier" style={{ color: "#D1D5DB" }}>
            Tier
          </label>
          <select
            id="tier"
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #1F2937",
              outline: "none",
              background: "#000",
              color: "#fff",
            }}
          >
            <option value="bronze">Bronze 🟤</option>
            <option value="silver">Silver ⚪</option>
            <option value="gold">Gold 🟡</option>
            <option value="platinum">Platinum 🟦</option>
          </select>
        </div>

        {/* Socials */}
        <div style={{ display: "grid", gap: 10, marginTop: 6 }}>
          <h3 style={{ margin: "8px 0 0 0", color: "#9CA3AF", fontSize: 14, letterSpacing: 1 }}>
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
              style={{ padding: "10px", borderRadius: 8, border: "1px solid #1F2937", outline: "none" }}
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
              style={{ padding: "10px", borderRadius: 8, border: "1px solid #1F2937", outline: "none" }}
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
              style={{ padding: "10px", borderRadius: 8, border: "1px solid #1F2937", outline: "none" }}
            />
          </div>
        </div>

        {/* Marketplaces */}
        <div style={{ display: "grid", gap: 10, marginTop: 6 }}>
          <h3 style={{ margin: "8px 0 0 0", color: "#9CA3AF", fontSize: 14, letterSpacing: 1 }}>
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
              style={{ padding: "10px", borderRadius: 8, border: "1px solid #1F2937", outline: "none" }}
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
              style={{ padding: "10px", borderRadius: 8, border: "1px solid #1F2937", outline: "none" }}
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
              style={{ padding: "10px", borderRadius: 8, border: "1px solid #1F2937", outline: "none" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
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
            }}
          >
            {saving ? "Saving…" : "Save Profile"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/account")}
            style={{
              padding: "12px 16px",
              background: "#1F2937",
              color: "#fff",
              border: "1px solid #374151",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Back to Account
          </button>
        </div>
      </form>
    </div>
  );
}
