
// app/settings/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const textPrimary = "#E5E7EB";
const textSecondary = "#9CA3AF";
const borderColor = "#1f1f1f";
const accent = "#4ADE80";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
);

type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  instagram: string | null;
  ebay: string | null;
  whatnot: string | null;
  website: string | null;
  // tier intentionally omitted from the form (read-only server-side)
};

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Form fields
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [ebay, setEbay] = useState("");
  const [whatnot, setWhatnot] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      // 1) get current user
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        setError("You must be logged in to edit your profile.");
        setLoading(false);
        return;
      }

      // 2) fetch or create profile row
      //    profiles.id = auth.users.id in your schema
      const { data: existing, error: selErr } = await supabase
        .from("profiles")
        .select(
          "id, username, display_name, bio, avatar_url, instagram, ebay, whatnot, website"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (selErr) {
        setError(selErr.message);
        setLoading(false);
        return;
      }

      if (!existing) {
        // create a bare profile row (tier will be assigned by default via trigger)
        const { error: insErr } = await supabase.from("profiles").insert({
          id: user.id,
          username: user.email?.split("@")[0]?.slice(0, 24) ?? `user_${user.id.slice(0, 6)}`,
          display_name: user.user_metadata?.full_name ?? "",
          bio: "",
          avatar_url: user.user_metadata?.avatar_url ?? "",
          instagram: null,
          ebay: null,
          whatnot: null,
          website: null,
          // no tier provided — DB default applies
        });

        if (insErr) {
          setError(insErr.message);
          setLoading(false);
          return;
        }

        // refetch
        const { data: created, error: selErr2 } = await supabase
          .from("profiles")
          .select(
            "id, username, display_name, bio, avatar_url, instagram, ebay, whatnot, website"
          )
          .eq("id", user.id)
          .maybeSingle();

        if (selErr2) {
          setError(selErr2.message);
          setLoading(false);
          return;
        }

        hydrateForm(created as Profile);
      } else {
        hydrateForm(existing as Profile);
      }

      setLoading(false);
    })();
  }, []);

  function hydrateForm(p: Profile | null) {
    if (!p) return;
    setProfile(p);
    setUsername(p.username ?? "");
    setDisplayName(p.display_name ?? "");
    setBio(p.bio ?? "");
    setAvatarUrl(p.avatar_url ?? "");
    setInstagram(p.instagram ?? "");
    setEbay(p.ebay ?? "");
    setWhatnot(p.whatnot ?? "");
    setWebsite(p.website ?? "");
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setError(null);

    // IMPORTANT: we do NOT send 'tier' here, so users cannot change it
    const { error: upErr } = await supabase
      .from("profiles")
      .update({
        username: username || null,
        display_name: displayName || null,
        bio: bio || null,
        avatar_url: avatarUrl || null,
        instagram: instagram || null,
        ebay: ebay || null,
        whatnot: whatnot || null,
        website: website || null,
      })
      .eq("id", profile.id);

    if (upErr) {
      setError(upErr.message);
    } else {
      // small refetch
      const { data: p2 } = await supabase
        .from("profiles")
        .select(
          "id, username, display_name, bio, avatar_url, instagram, ebay, whatnot, website"
        )
        .eq("id", profile.id)
        .maybeSingle();
      hydrateForm((p2 as Profile) ?? profile);
    }

    setSaving(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "black",
        color: textPrimary,
        padding: "28px 16px",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Profile Settings</h1>
        <p style={{ color: textSecondary, marginTop: 6 }}>
          Update your public information. Your tier is assigned automatically.
        </p>

        {loading ? (
          <div style={{ marginTop: 24, color: textSecondary }}>Loading…</div>
        ) : error ? (
          <div
            style={{
              marginTop: 16,
              border: `1px solid ${borderColor}`,
              borderRadius: 10,
              padding: 12,
              color: "#fca5a5",
              background: "rgba(127,29,29,0.12)",
            }}
          >
            {error}
          </div>
        ) : (
          <form
            onSubmit={onSave}
            style={{
              marginTop: 20,
              display: "grid",
              gap: 16,
              border: `1px solid ${borderColor}`,
              borderRadius: 12,
              padding: 16,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))",
            }}
          >
            {/* Username */}
            <FormRow label="Username">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="stacy"
                style={inputStyle}
              />
            </FormRow>

            {/* Display name */}
            <FormRow label="Display name">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Stacy Pearce"
                style={inputStyle}
              />
            </FormRow>

            {/* Bio */}
            <FormRow label="Bio">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Collector of watches, Pokémon, coins, and pub history."
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </FormRow>

            {/* Avatar URL */}
            <FormRow label="Avatar URL">
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…"
                style={inputStyle}
              />
            </FormRow>

            {/* Socials */}
            <FormRow label="Instagram">
              <input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/…"
                style={inputStyle}
              />
            </FormRow>

            <FormRow label="eBay">
              <input
                value={ebay}
                onChange={(e) => setEbay(e.target.value)}
                placeholder="https://www.ebay.co.uk/usr/…"
                style={inputStyle}
              />
            </FormRow>

            <FormRow label="Whatnot">
              <input
                value={whatnot}
                onChange={(e) => setWhatnot(e.target.value)}
                placeholder="https://www.whatnot.com/user/…"
                style={inputStyle}
              />
            </FormRow>

            <FormRow label="Website">
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://…"
                style={inputStyle}
              />
            </FormRow>

            {/* No Tier field here on purpose */}

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: accent,
                  color: "black",
                  fontWeight: 800,
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 16px",
                  cursor: "pointer",
                }}
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ color: textSecondary, fontSize: 13, fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  background: "#0b0b0b",
  color: textPrimary,
  border: `1px solid ${borderColor}`,
  borderRadius: 8,
  padding: "10px 12px",
  outline: "none",
};
