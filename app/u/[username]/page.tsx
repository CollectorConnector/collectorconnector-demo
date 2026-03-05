
// app/u/[username]/page.tsx

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import TierBadge from "@/components/TierBadge";

// Colour tokens (neutral by default)
const textPrimary = "#E5E7EB";   // main text
const textSecondary = "#9CA3AF"; // subtle grey
const borderColor = "#1f1f1f";
const accent = "#4ADE80";        // green only for highlights

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---- Reusable small section title ----
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

// ---- Reusable social link ----
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

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;

  // Profile query
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, username, display_name, bio, avatar_url, instagram, ebay, whatnot, website, tier"
    )
    .eq("username", username)
    .maybeSingle();

  if (!profile) {
    return (
      <div style={{ background: "black", color: textPrimary, padding: 40, minHeight: "100vh" }}>
        <h1 style={{ color: accent }}>Profile not found</h1>
        <p>No user found for @{username}</p>
        /Go Home</Link>
      </div>
    );
  }

  // Collections query
  const { data: collections } = await supabase
    .from("collections")
    .select("id, title, niche, cover_url, item_count, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

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
        /
          {/* eslint-disable-next-line @next/next/no-img-element */}
          /CC-SML-Logo.png
          <span style={{ fontWeight: 800, color: textPrimary }}>
            CollectorConnector
          </span>
        </Link>

        <div style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
          /upload
            <span style={{ color: textPrimary }}>Upload</span>
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
              height: 100,
              overflow: "hidden",
              borderRadius: 16,
              border: `1px solid ${borderColor}`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatar_url || "/default-avatar.png"}
              alt={profile.display_name || profile.username}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* PROFILE INFO */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: textPrimary }}>
                {profile.display_name || profile.username}
              </h1>
              <TierBadge tier={profile.tier || "Gold"} size="md" showCount />
            </div>

            <div style={{ color: textSecondary }}>@{profile.username}</div>

            {profile.bio && (
              <p style={{ maxWidth: 740, color: textPrimary, marginTop: 8 }}>
                {profile.bio}
              </p>
            )}

            {/* SOCIALS */}
            {(profile.instagram || profile.ebay || profile.whatnot || profile.website) && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
                {profile.instagram && (
                  <div>
                    <div style={{ color: textSecondary, fontSize: 12, marginBottom: 6 }}>
                      SOCIAL LINKS
                    </div>
                    <SocialLink href={profile.instagram} label="Instagram" icon="📸" />
                  </div>
                )}

                {(profile.ebay || profile.whatnot || profile.website) && (
                  <div>
                    <div style={{ color: textSecondary, fontSize: 12, marginBottom: 6 }}>
                      MARKETPLACES / WEB
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {profile.ebay && (
                        <SocialLink href={profile.ebay} label="eBay" icon="🛒" />
                      )}
                      {profile.whatnot && (
                        <SocialLink href={profile.whatnot} label="Whatnot" icon="🎙️" />
                      )}
                      {profile.website && (
                        <SocialLink href={profile.website} label="Website" icon="🔗" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* COLLECTIONS */}
      <main style={{ padding: "24px 16px", flex: 1 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <SectionTitle>Collections</SectionTitle>

          {!collections || collections.length === 0 ? (
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
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 16,
              }}
            >
              {collections.map((c: any) => (
                <Link
                  key={c.id}
                  href={`/u/${profile.username}/collection/${c.id}`}
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: textPrimary,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 14,
                    overflow: "hidden",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))",
                  }}
                >
                  <div style={{ position: "relative", height: 160 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.cover_url || "/collection-placeholder.jpg"}
                      alt={c.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />

                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)",
                      }}
                    />

                    <div
                      style={{
                        position: "absolute",
                        left: 12,
                        bottom: 10,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <div style={{ fontWeight: 800 }}>{c.title}</div>
                      <div style={{ fontSize: 13, color: textSecondary }}>
                        {(c.item_count ?? 0)} items{c.niche ? ` · ${c.niche}` : ""}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          padding: "18px 16px",
          borderTop: `1px solid ${borderColor}`,
          color: textSecondary,
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          /CC-SML-Logo.png
          <span style={{ fontSize: 13 }}>
            © {new Date().getFullYear()} CollectorConnector
          </span>

          <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
            /terms
              <span style={{ color: textSecondary }}>Terms</span>
            </Link>

            /privacy
              <span style={{ color: textSecondary }}>Privacy</span>
            </Link>

            /cookies
              <span style={{ color: textSecondary }}>Cookies</span>
            </Link>

            /guidelines
              <span style={{ color: textSecondary }}>Guidelines</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
