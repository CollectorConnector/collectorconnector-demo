"use client";

import Link from "next/link";

type Tier = "FOUNDER" | "GOLD" | "SILVER" | "BRONZE" | "STANDARD";

interface AccountData {
  email: string;
  username: string;
  tier: Tier;
  memberNumber: number;
  totalAtJoin: number;
  profilePhoto?: string;
  instagram?: string;
  ebay?: string;
  whatnot?: string;
}

const mockAccount: AccountData = {
  email: "marc.stacy8@googlemail.com",
  username: "stacy",
  tier: "FOUNDER",
  memberNumber: 1,
  totalAtJoin: 1,
  profilePhoto: "/default-profile.png",
  instagram: "https://instagram.com/ace_cards_and_c",
  ebay: "https://www.ebay.co.uk/usr/Pear-stac",
  whatnot: "https://www.whatnot.com/user/yourhandle",
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
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #1a1a1a 0%, #0a0a0a 70%)",
        color: "#fff",
        padding: "40px 20px 60px",
        maxWidth: 900,
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      {/* PAGE TITLE */}
      <h1
        style={{
          fontSize: 14,
          letterSpacing: "2px",
          textTransform: "uppercase",
          opacity: 0.7,
          marginBottom: 20,
        }}
      >
        Your Collector Identity
      </h1>

      {/* PROFILE PHOTO */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            width: 170,
            height: 170,
            margin: "0 auto",
            borderRadius: "28%",
            overflow: "hidden",
            border: "2px solid #fff",
            boxShadow: "0 10px 26px rgba(0,0,0,0.6)",
          }}
        >
          <img
            src={account.profilePhoto}
            alt="Profile"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        <button
          style={{
            marginTop: 12,
            padding: "10px 16px",
            background: "#000",
            color: "#fff",
            borderRadius: 10,
            border: "1px solid #333",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Change Photo
        </button>
      </div>

      {/* BADGE UNDER PHOTO */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          borderRadius: 999,
          border: "1px solid #fff",
          fontSize: 12,
          marginBottom: 20,
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

      {/* ACCOUNT DETAILS CARD */}
      <section
        style={{
          background: "#111827",
          borderRadius: 16,
          border: "1px solid #1f2937",
          padding: 24,
          textAlign: "left",
          boxShadow: "0 18px 45px rgba(0,0,0,0.6)",
          margin: "0 auto 24px",
          maxWidth: 600,
        }}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <img
            src="/CC-SML-Logo.png"
            alt="CC"
            style={{ width: 22, height: 22 }}
          />
          Account Details
        </h2>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
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

        {/* Username */}
        <div style={{ marginBottom: 14 }}>
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

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {account.instagram && (
              <a
                href={account.instagram}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: "1px solid #fff",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 12,
                }}
              >
                Instagram
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
                  border: "1px solid #fff",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 12,
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
                  border: "1px solid #fff",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 12,
                }}
              >
                Whatnot
              </a>
            )}
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
          href="/edit-profile"
          style={{
            padding: "12px",
            background: "#000",
            color: "#fff",
            borderRadius: 10,
            border: "1px solid #333",
            fontWeight: 700,
            textDecoration: "none",
            fontSize: 15,
          }}
        >
          Edit Profile
        </Link>

        <Link
          href={`/u/${account.username}`}
          style={{
            padding: "12px",
            border: "1px solid #fff",
            color: "#fff",
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
        >
          Log Out
        </button>
      </div>
    </main>
  );
}
