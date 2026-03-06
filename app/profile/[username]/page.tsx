"use client";

import Link from "next/link";

type Tier = "FOUNDER" | "GOLD" | "SILVER" | "BRONZE" | "STANDARD";

interface ProfileData {
  username: string;
  displayName: string;
  bio?: string;
  tier: Tier;
  memberNumber: number;
  totalAtJoin: number;
  profilePhoto: string;
  categories: string[];
  social: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    discord?: string;
  };
  marketplaces: {
    ebay?: string;
    whatnot?: string;
    stockx?: string;
    goat?: string;
    tcgplayer?: string;
    bricklink?: string;
    stamps?: string;
    discogs?: string;
    chrono24?: string;
  };
  collectionPreview: { id: string; title: string; image: string }[];
}

// TEMP: replace with real data fetching
const mockProfile: ProfileData = {
  username: "stacy",
  displayName: "Stacy Pearce",
  bio: "Collector of watches, Pokémon, coins, and pub history. Building CollectorConnector.",
  tier: "FOUNDER",
  memberNumber: 1,
  totalAtJoin: 1,
  profilePhoto: "/default-profile.png",
  categories: ["Watches", "Pokémon", "Coins", "Pub History"],
  social: {
    instagram: "https://instagram.com/ace_cards_and_c",
  },
  marketplaces: {
    ebay: "https://www.ebay.co.uk/usr/Pear-stac",
  },
  collectionPreview: [
    { id: "1", title: "Vintage Watch", image: "/items/watch-1.png" },
    { id: "2", title: "Charizard", image: "/items/card-1.png" },
    { id: "3", title: "Old Coin", image: "/items/coin-1.png" },
    { id: "4", title: "Pub Sign", image: "/items/pub-1.png" },
  ],
};

function getTierLabel(tier: Tier) {
  switch (tier) {
    case "FOUNDER":
      return "Founder";
    case "GOLD":
      return "Gold";
    case "SILVER":
      return "Silver";
    case "BRONZE":
      return "Bronze";
    default:
      return "Collector";
  }
}

function getTierEmoji(tier: Tier) {
  switch (tier) {
    case "FOUNDER":
      return "💎";
    case "GOLD":
      return "🟡";
    case "SILVER":
      return "⚪";
    case "BRONZE":
      return "🟤";
    default:
      return "⚫";
  }
}

export default function PublicProfilePage() {
  const profile = mockProfile;
  const tierLabel = getTierLabel(profile.tier);
  const tierEmoji = getTierEmoji(profile.tier);
  const memberText = `${profile.memberNumber} of ${profile.totalAtJoin}`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #1a1a1a 0%, #0a0a0a 70%)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* GLOBAL HEADER */}
      <header
        style={{
          width: "100%",
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #1f2933",
          background: "rgba(10,10,10,0.9)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img
              src="/CC-SML-Logo.png"
              alt="CC"
              style={{ width: 28, height: 28 }}
            />
            <span style={{ fontWeight: 700, fontSize: 18 }}>
              CollectorConnector
            </span>
          </div>
          <nav
            style={{
              display: "flex",
              gap: 14,
              fontSize: 14,
              color: "#9CA3AF",
            }}
          >
            <Link href="/" style={{ textDecoration: "none", color: "#9CA3AF" }}>
              Home
            </Link>
            <Link
              href="/explore"
              style={{ textDecoration: "none", color: "#9CA3AF" }}
            >
              Explore
            </Link>
            <Link
              href="/upload"
              style={{ textDecoration: "none", color: "#9CA3AF" }}
            >
              Upload
            </Link>
            <Link
              href="/account"
              style={{ textDecoration: "none", color: "#9CA3AF" }}
            >
              Account
            </Link>
          </nav>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            fontSize: 13,
            alignItems: "center",
          }}
        >
          <a href="https://www.ebay.com" target="_blank" rel="noreferrer" style={{ color: "#9CA3AF" }}>eBay</a>
          <a href="https://www.whatnot.com" target="_blank" rel="noreferrer" style={{ color: "#9CA3AF" }}>Whatnot</a>
          <a href="https://www.instagram.com" target="_blank" rel="noreferrer" style={{ color: "#9CA3AF" }}>Instagram</a>
          <a href="https://www.youtube.com" target="_blank" rel="noreferrer" style={{ color: "#9CA3AF" }}>YouTube</a>
          <a href="https://discord.com" target="_blank" rel="noreferrer" style={{ color: "#9CA3AF" }}>Discord</a>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "40px 16px 60px",
        }}
      >
        <div style={{ maxWidth: 800, width: "100%", textAlign: "center" }}>
          {/* MAIN LOGO */}
          <img
            src="/CC-main-logo.png"
            alt="CollectorConnector"
            style={{
              width: 140,
              display: "block",
              margin: "0 auto 16px",
            }}
          />

          {/* PROFILE SQUIRCLE + SMALL TIER EMBLEM */}
          <div style={{ marginBottom: 16, position: "relative" }}>
            <div
              style={{
                width: 170,
                height: 170,
                margin: "0 auto",
                borderRadius: "28%",
                overflow: "hidden",
                border: "2px solid #fff",
                boxShadow: "0 10px 26px rgba(0,0,0,0.6)",
                position: "relative",
              }}
            >
              <img
                src={profile.profilePhoto}
                alt={profile.displayName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              {/* Small emblem */}
              <div
                style={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                  padding: "4px 8px",
                  borderRadius: 999,
                  background:
                    profile.tier === "FOUNDER"
                      ? "linear-gradient(135deg, #fef3c7, #facc15, #f97316)"
                      : "rgba(0,0,0,0.8)",
                  color: profile.tier === "FOUNDER" ? "#111827" : "#E5E7EB",
                  fontSize: 11,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  border: "1px solid rgba(255,255,255,0.4)",
                }}
              >
                <span>{tierEmoji}</span>
                <span>{tierLabel}</span>
              </div>
            </div>
          </div>

          {/* NAME + USERNAME */}
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              margin: "4px 0 2px",
            }}
          >
            {profile.displayName}
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#9CA3AF",
              margin: "0 0 8px",
            }}
          >
            @{profile.username}
          </p>

          {/* FULL TIER BADGE UNDER USERNAME */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 999,
              border: "1px solid #fff",
              fontSize: 12,
              marginBottom: 12,
              background:
                profile.tier === "FOUNDER"
                  ? "linear-gradient(135deg, #fef3c7, #facc15, #f97316)"
                  : "rgba(17,24,39,0.9)",
              color: profile.tier === "FOUNDER" ? "#111827" : "#E5E7EB",
            }}
          >
            <span>{tierEmoji}</span>
            <span>{tierLabel}</span>
            <span style={{ opacity: 0.8 }}>· {memberText}</span>
          </div>

          {/* BIO */}
          {profile.bio && (
            <p
              style={{
                maxWidth: 520,
                margin: "0 auto 16px",
                fontSize: 14,
                color: "#D1D5DB",
              }}
            >
              {profile.bio}
            </p>
          )}

          {/* CATEGORIES (NICHE FAMILIES) */}
          {profile.categories.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#6B7280",
                  marginBottom: 8,
                }}
              >
                Collector Categories
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  justifyContent: "center",
                }}
              >
                {profile.categories.map((cat) => (
                  <span
                    key={cat}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #fff",
                      fontSize: 12,
                      color: "#fff",
                    }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SOCIAL + MARKETPLACES */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
              textAlign: "left",
              marginBottom: 32,
            }}
          >
            {/* Social */}
            <div>
              <p
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#6B7280",
                  marginBottom: 8,
                }}
              >
                Social Links
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  fontSize: 12,
                }}
              >
                {profile.social.instagram && (
                  <a
                    href={profile.social.instagram}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #fff",
                      color: "#fff",
                      textDecoration: "none",
                    }}
                  >
                    Instagram
                  </a>
                )}
                {profile.social.twitter && (
                  <a
                    href={profile.social.twitter}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #fff",
                      color: "#fff",
                      textDecoration: "none",
                    }}
                  >
                    Twitter / X
                  </a>
                )}
                {profile.social.youtube && (
                  <a
                    href={profile.social.youtube}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #fff",
                      color: "#fff",
                      textDecoration: "none",
                    }}
                  >
                    YouTube
                  </a>
                )}
                {profile.social.discord && (
                  <a
                    href={profile.social.discord}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #fff",
                      color: "#fff",
                      textDecoration: "none",
                    }}
                  >
                    Discord
                  </a>
                )}
              </div>
            </div>

            {/* Marketplaces */}
            <div>
              <p
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#6B7280",
                  marginBottom: 8,
                }}
              >
                Marketplaces
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  fontSize: 12,
                }}
              >
                {profile.marketplaces.ebay && (
                  <a
                    href={profile.marketplaces.ebay}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #fff",
                      color: "#fff",
                      textDecoration: "none",
                    }}
                  >
                    eBay
                  </a>
                )}
                {profile.marketplaces.whatnot && (
                  <a
                    href={profile.marketplaces.whatnot}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #fff",
                      color: "#fff",
                      textDecoration: "none",
                    }}
                  >
                    Whatnot
                  </a>
                )}
                {profile.marketplaces.stockx && (
                  <a
                    href={profile.marketplaces.stockx}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #fff",
                      color: "#fff",
                      textDecoration: "none",
                    }}
                  >
                    StockX
                  </a>
                )}
                {profile.marketplaces.goat && (
                  <a
                    href={profile.marketplaces.goat}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #fff",
                      color: "#fff",
                      textDecoration: "none",
                    }}
                  >
                    GOAT
                  </a>
                )}
                {profile.marketplaces.tcgplayer && (
                  <a
                    href={profile.marketplaces.tcgplayer}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #fff",
                      color: "#fff",
                      textDecoration: "none",
                    }}
                  >
                    TCGPlayer
                  </a>
                )}
                {profile.marketplaces.bricklink && (
                  <a
                    href={profile.marketplaces.bricklink}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #fff",
                      color: "#fff",
                      textDecoration: "none",
                    }}
                  >
                    BrickLink
                  </a>
                )}
                {profile.marketplaces.stamps && (
                  <a
                    href={profile.marketplaces.stamps}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #fff",
                      color: "#fff",
                      textDecoration: "none",
                    }}
                  >
                    stamps.com
                  </a>
                )}
                {profile.marketplaces.discogs && (
                  <a
                    href={profile.marketplaces.discogs}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #fff",
                      color: "#fff",
                      textDecoration: "none",
                    }}
                  >
                    Discogs
                  </a>
                )}
                {profile.marketplaces.chrono24 && (
                  <a
                    href={profile.marketplaces.chrono24}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #fff",
                      color: "#fff",
                      textDecoration: "none",
                    }}
                  >
                    Chrono24
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* COLLECTION PREVIEW */}
          <section style={{ textAlign: "left", marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Collection Preview
              </p>
              <span
                style={{
                  fontSize: 12,
                  color: "#9CA3AF",
                }}
              >
                {profile.collectionPreview.length} items
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 14,
              }}
            >
              {profile.collectionPreview.map((item) => (
                <div
                  key={item.id}
                  style={{
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      borderRadius: "24%",
                      overflow: "hidden",
                      border: "1px solid #1f2937",
                      boxShadow: "0 10px 24px rgba(0,0,0,0.6)",
                      marginBottom: 6,
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#E5E7EB",
                      margin: 0,
                    }}
                  >
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* VIEW FULL COLLECTION BUTTON */}
          <div style={{ marginTop: 8 }}>
            <Link
              href={`/profile/${profile.username}/collection`}
              style={{
                padding: "12px 20px",
                background: "#000",
                color: "#fff",
                borderRadius: 10,
                border: "1px solid #333",
                fontWeight: 600,
                textDecoration: "none",
                fontSize: 14,
              }}
            >
              View Full Collection
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
