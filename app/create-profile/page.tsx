"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Profile = {
  id: string;
  username: string | null;
  display_url?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  instagram_url?: string | null;
  twitter_url?: string | null;
  youtube_url?: string | null;
  ebay_url?: string | null;
  whatnot_url?: string | null;
  discord_url?: string | null;
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
  const [displayUrl, setDisplayUrl] = useState(""); 
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [youtube, setYoutube] = useState("");
  const [ebay, setEbay] = useState("");
  const [whatnot, setWhatnot] = useState("");
  const [discord, setDiscord] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // FIX: If no session, redirect to /signup (not /auth/signup which was 404ing)
      if (!session) {
        router.push("/signup"); 
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

    const payload = {
      id: session.user.id,
      username: username || null,
      display_url: displayUrl || null,
      bio: bio || null,
      instagram_url: instagram || null,
      twitter_url: twitter || null,
      youtube_url: youtube || null,
      ebay_url: ebay || null,
      whatnot_url: whatnot || null,
      discord_url: discord || null,
    };

    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });

    setSaving(false);

    if (error) {
      setMessage({ type: "err", text: error.message });
    } else {
      setMessage({ type: "ok", text: "Profile created successfully." });
      // Redirect to the user's profile vault
      router.push(`/profile/${session.user.id}`);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "900" }}>
        LOADING PROFILE SETUP...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "720px", padding: "32px", background: "#111", border: "1px solid #1F2937", borderRadius: "14px", color: "#fff", boxShadow: "0 0 40px rgba(255,255,255,0.15)" }}>
        
        {/* Main Logo */}
        <img src="/CC-main-logo.png" alt="Collector Connector" style={{ width: "160px", display: "block", margin: "0 auto 28px" }} />

        <h1 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "6px", textAlign: "center", textTransform: "uppercase", letterSpacing: "-1px" }}>Create your profile</h1>
        <p style={{ textAlign: "center", color: "#9CA3AF", marginBottom: "24px", fontWeight: "bold" }}>Join the collector community</p>

        {message && (
          <div style={{ background: message.type === "ok" ? "rgba(74,222,128,0.15)" : "rgba(255,0,0,0.2)", padding: "12px", borderRadius: "8px", marginBottom: "18px", color: message.type === "ok" ? "#86efac" : "#ff6b6b", border: "1px solid rgba(255,255,255,0.1)", fontSize: "14px", textAlign: "center", fontWeight: "bold" }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }}>
          {/* USERNAME */}
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ color: "#D1D5DB", fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>USERNAME (REQUIRED)</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="stacypearce123" style={{ padding: 14, borderRadius: 8, border: "1px solid #27272a", background: "#0d0d0d", color: "#fff", fontWeight: "bold" }} required />
          </div>

          {/* DISPLAY NAME */}
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ color: "#D1D5DB", fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>DISPLAY NAME</label>
            <input value={displayUrl} onChange={(e) => setDisplayUrl(e.target.value)} placeholder="Stacy Pearce" style={{ padding: 14, borderRadius: 8, border: "1px solid #27272a", background: "#0d0d0d", color: "#fff", fontWeight: "bold" }} />
          </div>

          {/* BIO */}
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ color: "#D1D5DB", fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>BIO</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="What do you collect?" style={{ padding: 14, borderRadius: 8, border: "1px solid #27272a", background: "#0d0d0d", color: "#fff", resize: 'none', fontWeight: "bold" }} />
          </div>

          <h3 style={{ marginTop: 10, color: "#9CA3AF", fontSize: 10, fontWeight: "900", letterSpacing: 2, borderBottom: '1px solid #27272a', paddingBottom: '8px', textTransform: 'uppercase' }}>Socials & Marketplaces</h3>

          <div style={{ display: "grid", gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input placeholder="Instagram URL" value={instagram} onChange={(e) => setInstagram(e.target.value)} style={{ padding: 12, borderRadius: 8, border: "1px solid #27272a", background: "#0d0d0d", color: "#fff", fontSize: '13px' }} />
            <input placeholder="Twitter URL" value={twitter} onChange={(e) => setTwitter(e.target.value)} style={{ padding: 12, borderRadius: 8, border: "1px solid #27272a", background: "#0d0d0d", color: "#fff", fontSize: '13px' }} />
            <input placeholder="YouTube URL" value={youtube} onChange={(e) => setYoutube(e.target.value)} style={{ padding: 12, borderRadius: 8, border: "1px solid #27272a", background: "#0d0d0d", color: "#fff", fontSize: '13px' }} />
            <input placeholder="eBay URL" value={ebay} onChange={(e) => setEbay(e.target.value)} style={{ padding: 12, borderRadius: 8, border: "1px solid #27272a", background: "#0d0d0d", color: "#fff", fontSize: '13px' }} />
            <input placeholder="Whatnot URL" value={whatnot} onChange={(e) => setWhatnot(e.target.value)} style={{ padding: 12, borderRadius: 8, border: "1px solid #27272a", background: "#0d0d0d", color: "#fff", fontSize: '13px' }} />
            <input placeholder="Discord URL" value={discord} onChange={(e) => setDiscord(e.target.value)} style={{ padding: 12, borderRadius: 8, border: "1px solid #27272a", background: "#0d0d0d", color: "#fff", fontSize: '13px' }} />
          </div>

          <button type="submit" disabled={saving} style={{ padding: "18px", background: "#fff", color: "#000", border: "none", borderRadius: 12, fontWeight: 900, cursor: "pointer", opacity: saving ? 0.7 : 1, marginTop: 10, textTransform: "uppercase", letterSpacing: "1px" }}>
            {saving ? "SAVING..." : "FINISH PROFILE"}
          </button>
        </form>
      </div>
    </div>
  );
}
