import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "CollectorConnector",
  description: "Where collectors meet",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#0a0a0a",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* GLOBAL HEADER GOES HERE */}
        <header
          style={{
            width: "100%",
            padding: "14px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(10,10,10,0.92)",
            backdropFilter: "blur(10px)",
            position: "sticky",
            top: 0,
            zIndex: 50,
            whiteSpace: "nowrap",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 18px rgba(255,255,255,0.08)",
          }}
        >
          {/* LEFT SIDE */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
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
                gap: 16,
                fontSize: 14,
                color: "#9CA3AF",
              }}
            >
              <Link href="/" style={{ color: "#9CA3AF", textDecoration: "none" }}>
                Home
              </Link>
              <Link href="/explore" style={{ color: "#9CA3AF", textDecoration: "none" }}>
                Explore
              </Link>
              <Link href="/upload" style={{ color: "#9CA3AF", textDecoration: "none" }}>
                Upload
              </Link>
              <Link href="/account" style={{ color: "#9CA3AF", textDecoration: "none" }}>
                Account
              </Link>
            </nav>
          </div>

          {/* RIGHT SIDE */}
          <div
            style={{
              display: "flex",
              gap: 14,
              fontSize: 13,
              alignItems: "center",
              whiteSpace: "nowrap",
            }}
          >
            <a href="https://www.ebay.com" target="_blank" rel="noreferrer" style={{ color: "#9CA3AF" }}>
              eBay
            </a>
            <a href="https://www.whatnot.com" target="_blank" rel="noreferrer" style={{ color: "#9CA3AF" }}>
              Whatnot
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer" style={{ color: "#9CA3AF" }}>
              Instagram
            </a>
            <a href="https://www.youtube.com" target="_blank" rel="noreferrer" style={{ color: "#9CA3AF" }}>
              YouTube
            </a>
            <a href="https://discord.com" target="_blank" rel="noreferrer" style={{ color: "#9CA3AF" }}>
              Discord
            </a>
          </div>
        </header>

        {/* PAGE CONTENT */}
        {children}
      </body>
    </html>
  );
}
