"use client";

import Link from "next/link";

type Tier = "FOUNDER" | "GOLD" | "SILVER" | "BRONZE" | "STANDARD";

interface AccountData {
  email: string;
  username: string;
  tier: Tier;
  memberNumber: number; // e.g. 1, 2, 237
  totalAtJoin: number;  // e.g. 1, 500, 1234
  // personal links (optional)
  instagram?: string;
  twitter?: string;
  youtube?: string;
  ebay?: string;
  whatnot?: string;
  discord?: string;
  stockx?: string;
  goat?: string;
  lego?: string;
  bricklink?: string;
  stamps?: string;
  discogs?: string;
  chrono24?: string;
  tcgplayer?: string;
}

// TEMP: replace this with real data from your backend
const mockAccount: AccountData = {
  email: "pearce.stacy8@googlemail.com",
  username: "stacy",
  tier: "FOUNDER",
  memberNumber: 1,
  totalAtJoin: 1,
  instagram: "https://instagram.com/yourhandle",
  ebay: "https://www.ebay.co.uk/usr/yourstore",
  whatnot: "https://www.whatnot.com/user/yourhandle",
  discord: "https://discord.gg/yourserver",
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

export default function AccountPage() {
  const account = mockAccount;

  const tierLabel = getTierLabel(account.tier);
  const tierEmoji = getTierEmoji(account.tier);
  const memberText = `${account.memberNumber} of ${account.totalAtJoin}`;

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
      {/* GLOBAL HEADER / COMMAND CENTRE */}
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
        {/* Left: Logo + Nav */}
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
              style={{ textDecoration: "none", color: "#4ADE80" }}
            >
              Account
            </Link>
          </nav>
        </div>

        {/* Right: Universal Collector Tools */}
        <div
          style={{
            display: "flex",
            gap: 10,
            fontSize: 13,
            alignItems: "center",
          }}
        >
          <a
            href="https://www.ebay.com"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#9CA3AF", textDecoration: "none" }}
          >
            eBay
          </a>
          <a
            href="https://www.whatnot.com"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#9CA3AF", textDecoration: "none" }}
          >
            Whatnot
          </a>
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#9CA3AF", textDecoration: "none" }}
          >
            Instagram
          </a>
          <a
            href="https://www.youtube.com"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#9CA3AF", textDecoration: "none" }}
          >
            YouTube
          </a>
          <a
            href="https://discord.com"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#9CA3AF", textDecoration: "none" }}
          >
            Discord
          </a>
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
        <div style={{ maxWidth: 640, width: "100%", textAlign: "center" }}>
          {/* MAIN LOGO */}
          <img
            src="/CC-main-logo.png"
            alt="CollectorConnector"
            style={{
              width: 160,
              display: "block",
              margin: "0 auto 16px",
            }}
          />

          <p
            style={{
              color: "#4ADE80",
              fontSize: 13,
              letterSpacing: "2px",
              marginBottom: 24,
              textTransform: "uppercase",
            }}
          >
            Your Collector Identity
          </p>

          {/* ACCOUNT CARD */}
          <section
            style={{
              background: "#111827",
              borderRadius: 16,
              border: "1px solid #1f2937",
              padding: 24,
              textAlign: "left",
              boxShadow: "0 18px 45px rgba(0,0,0,0.6)",
              margin: "0 auto 24px",
            }}
          >
            {/* Card header with small logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img
                  src="/CC-SML-Logo.png"
                  alt="CC"
                  style={{ width: 22, height: 22 }}
                />
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  Account Details
                </h2>
              </div>
              {/* Tier badge */}
              <div
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: "1px solid #4ADE80",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background:
                    account.tier === "FOUNDER"
                      ? "linear-gradient(135deg, #fef3c7, #facc15, #f97316)"
                      : "rgba(17,24,39,0.9)",
                  color: account.tier === "FOUNDER" ? "#111827" : "#E5E7EB",
                }}
              >
                <span>{tierEmoji}</span>
                <span>{tierLabel}</span>
                <span style={{ opacity: 0.8 }}>· {memberText}</span>
              </div>
            </div>

            {/* Fields */}
            <div style={{ display: "grid", rowGap: 10 }}>
              <div>
                <p
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "#6B7280",
                    marginBottom: 2,
                  }}
                >
                  Email
                </p>
                <p style={{ margin: 0, fontSize: 14 }}>{account.email}</p>
              </div>

              <div>
                <p
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "#6B7280",
                    marginBottom: 2,
                  }}
                >
                  Username
                </p>
                <p style={{ margin: 0, fontSize: 14 }}>@{account.username}</p>
              </div>
            </div>

            {/* Connected Profiles */}
            <div style={{ marginTop: 20 }}>
              <p
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#6B7280",
                  marginBottom: 8,
                }}
              >
                Connected Profiles
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  fontSize: 12,
                }}
              >
                {account.instagram && (
                  <a
                    href={account.instagram}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #4ADE80",
                      color: "#E5E7EB",
                      textDecoration: "none",
                    }}
                  >
                    Instagram
                  </a>
                )}
                {account.twitter && (
                  <a
                    href={account.twitter}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #4ADE80",
                      color: "#E5E7EB",
                      textDecoration: "none",
                    }}
                  >
                    Twitter / X
                  </a>
                )}
                {account.youtube && (
                  <a
                    href={account.youtube}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #4ADE80",
                      color: "#E5E7EB",
                      textDecoration: "none",
                    }}
                  >
                    YouTube
                  </a>
                )}
                {account.ebay && (
                  <a
                    href={account.ebay}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #4ADE80",
                      color: "#E5E7EB",
                      textDecoration: "none",
                    }}
                  >
                    eBay Store
                  </a>
                )}
                {account.whatnot && (
                  <a
                    href={account.whatnot}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #4ADE80",
                      color: "#E5E7EB",
                      textDecoration: "none",
                    }}
                  >
                    Whatnot
                  </a>
                )}
                {account.discord && (
                  <a
                    href={account.discord}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #4ADE80",
                      color: "#E5E7EB",
                      textDecoration: "none",
                    }}
                  >
                    Discord
                  </a>
                )}
                {/* Add more platforms here as needed (StockX, GOAT, Lego, etc.) */}
              </div>
            </div>
          </section>

          {/* ACTION BUTTONS */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              maxWidth: 320,
              margin: "0 auto",
            }}
          >
            <Link
              href="/account/edit"
              style={{
                padding: "12px",
                background: "#4ADE80",
                color: "#000",
                borderRadius: 10,
                fontWeight: 700,
                textDecoration: "none",
                fontSize: 15,
              }}
            >
              Edit Profile
            </Link>

            <Link
              href="/profile/stacy" // replace with dynamic route
              style={{
                padding: "12px",
                border: "1px solid #4ADE80",
                color: "#4ADE80",
                borderRadius: 10,
                fontWeight: 600,
                textDecoration: "none",
                fontSize: 15,
              }}
            >
              View Public Profile
            </Link>

            <button
              type="button"
              style={{
                padding: "12px",
                borderRadius: 10,
                border: "1px solid #DC2626",
                background: "transparent",
                color: "#FCA5A5",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
              onClick={() => {
                // hook this up to your real logout logic
                console.log("Log out clicked");
              }}
            >
              Log Out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
