
// app/u/[username]/page.tsx
import Image from "next/image";
import Link from "next/link";

// --- Mock Data (replace with Supabase later) ---
const MOCK_PROFILE = {
  username: "stacy",
  name: "Stacy Pearce",
  bio: "Collector of watches, Pokémon, coins, and pub history. Building CollectorConnector.",
  avatarUrl:
    "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?q=80&w=600&auto=format&fit=crop",
  tier: "Emerald",
  socials: {
    instagram: "https://instagram.com/collectorconnector",
    ebay: "https://www.ebay.co.uk/usr/collectorconnector",
    whatnot: "https://www.whatnot.com/user/collectorconnector",
    website: "https://collectorconnector.co",
  },
  collections: [
    {
      id: "1",
      title: "Pokémon Cards",
      itemCount: 128,
      cover:
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476e?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: "2",
      title: "Watches",
      itemCount: 9,
      cover:
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: "3",
      title: "Coins",
      itemCount: 42,
      cover:
        "https://images.unsplash.com/photo-1616337198773-1bcbcb4794ec?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: "4",
      title: "Pint Glasses",
      itemCount: 23,
      cover:
        "https://images.unsplash.com/photo-1543515915-7f6a5d0a6ecb?q=80&w=1200&auto=format&fit=crop",
    },
  ],
};

// --- Helpers ---
const TIER_COLORS: Record<string, { bg: string; glow: string; text: string }> =
  {
    Emerald: { bg: "#083f2e", glow: "0 0 28px #4ADE80AA", text: "#4ADE80" },
    Gold: { bg: "#3f3a08", glow: "0 0 28px #facc15AA", text: "#facc15" },
    Platinum: { bg: "#2b2f35", glow: "0 0 28px #93c5fdAA", text: "#93c5fd" },
  };

function TierBadge({ tier }: { tier: string }) {
  const colors = TIER_COLORS[tier] ?? TIER_COLORS.Emerald;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        borderRadius: 999,
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.text}55`,
        boxShadow: colors.glow,
        fontSize: 13,
        letterSpacing: 0.3,
        fontWeight: 600,
      }}
      title={`${tier} Tier`}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: colors.text,
          boxShadow: `0 0 8px ${colors.text}`,
        }}
      />
      {tier} Tier
    </span>
  );
}

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;

  // In the future: fetch by username from Supabase here.
  // For now: use mock, but adapt the displayed handle to the URL.
  const profile = { ...MOCK_PROFILE, username };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{
          height: 64,
          borderBottom: "1px solid #1f1f1f",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          position: "sticky",
          top: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(6px)",
          zIndex: 30,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
            <Image
              src="/CC-SML-Logo.png"
              alt="CollectorConnector"
              width={42}
              height={42}
              priority
              style={{ objectFit: "contain" }}
            />
          </Link>
          <Link
            href="/"
            style={{
              color: "#4ADE80",
              fontWeight: 700,
              letterSpacing: 0.4,
              textDecoration: "none",
            }}
          >
            CollectorConnector
          </Link>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <Link
            href="/upload"
            style={{
              color: "black",
              background: "#4ADE80",
              padding: "8px 12px",
              borderRadius: 8,
              fontWeight: 700,
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
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid #262626",
            }}
          >
            <Image
              src={profile.avatarUrl}
              alt={profile.name}
              width={100}
              height={100}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>
                {profile.name}
              </h1>
              <TierBadge tier={profile.tier} />
            </div>
            <div style={{ color: "#9CA3AF" }}>@{profile.username}</div>
            <p style={{ marginTop: 8, color: "#E5E7EB", maxWidth: 740 }}>
              {profile.bio}
            </p>

            {/* SOCIALS */}
            <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
              {profile.socials.instagram && (
                <SocialLink href={profile.socials.instagram} label="Instagram" />
              )}
              {profile.socials.ebay && (
                <SocialLink href={profile.socials.ebay} label="eBay" />
              )}
              {profile.socials.whatnot && (
                <SocialLink href={profile.socials.whatnot} label="Whatnot" />
              )}
              {profile.socials.website && (
                <SocialLink href={profile.socials.website} label="Website" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* COLLECTIONS */}
      <main style={{ padding: "24px 16px", flex: 1 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <SectionTitle>Collections</SectionTitle>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {profile.collections.map((c) => (
              <Link
                key={c.id}
                href={`/u/${profile.username}/collection/${c.id}`}
                style={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                  border: "1px solid #1f1f1f",
                  borderRadius: 14,
                  overflow: "hidden",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))",
                }}
              >
                <div style={{ position: "relative", height: 160 }}>
                  {/* Using next/image for perf */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.cover}
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
                    <div style={{ fontSize: 13, color: "#9CA3AF" }}>
                      {c.itemCount} items
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid #1f1f1f",
          padding: "18px 16px",
          color: "#9CA3AF",
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
          <Image
            src="/CC-SML-Logo.png"
            alt="CC"
            width={24}
            height={24}
            style={{ objectFit: "contain" }}
          />
          <span style={{ fontSize: 13 }}>
            © {new Date().getFullYear()} CollectorConnector
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
            <FooterLink href="/terms" label="Terms" />
            <FooterLink href="/privacy" label="Privacy" />
            <FooterLink href="/cookies" label="Cookies" />
            <FooterLink href="/guidelines" label="Guidelines" />
          </div>
        </div>
      </footer>
    </div>
  );
}

// ---- Small presentational bits ----
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        margin: "8px 0 16px",
        fontSize: 18,
        fontWeight: 800,
        letterSpacing: 0.3,
        color: "#E5E7EB",
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
          boxShadow: "0 0 10px #4ADE80",
          borderRadius: 999,
        }}
      />
      {children}
    </h2>
  );
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        border: "1px solid #1f1f1f",
        color: "#4ADE80",
        padding: "8px 12px",
        borderRadius: 8,
        fontWeight: 700,
      }}
    >
      {label}
    </a>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{ color: "#9CA3AF", textDecoration: "none", fontSize: 13 }}
    >
      {label}
    </Link>
  );
}
``
