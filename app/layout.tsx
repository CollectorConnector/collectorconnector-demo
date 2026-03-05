
// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

// --- brand palette ---
const BORDER = "#1f1f1f";
const TEXT_PRIMARY = "#E5E7EB";
const TEXT_SECONDARY = "#9CA3AF";

// --- inline NAV (uses /public/CC-SML-Logo.png) ---
function Nav() {
  return (
    <nav
      style={{
        height: 64,
        borderBottom: `1px solid ${BORDER}`,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/CC-SML-Logo.png"
          alt="CollectorConnector logo"
          width={42}
          height={42}
          style={{ display: "block" }}
        />
        <span style={{ fontWeight: 800, color: TEXT_PRIMARY }}>CollectorConnector</span>
      </Link>

      <div style={{ marginLeft: "auto", display: "flex", gap: 14 }}>
        <Link href="/" style={{ color: TEXT_PRIMARY, textDecoration: "none", fontWeight: 600 }}>
          Home
        </Link>
        <Link href="/upload" style={{ color: TEXT_PRIMARY, textDecoration: "none", fontWeight: 600 }}>
          Upload
        </Link>
      </div>
    </nav>
  );
}

// --- inline FOOTER ---
function Footer() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${BORDER}`,
        padding: "18px 16px",
        color: TEXT_SECONDARY,
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
        <img
          src="/CC-SML-Logo.png"
          alt="CollectorConnector logo"
          width={22}
          height={22}
          style={{ display: "block", opacity: 0.9 }}
        />
        <span style={{ fontSize: 13 }}>© {new Date().getFullYear()} CollectorConnector</span>

        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <Link href="/terms" style={{ color: TEXT_SECONDARY, textDecoration: "none", fontSize: 13 }}>
            Terms
          </Link>
          <Link href="/privacy" style={{ color: TEXT_SECONDARY, textDecoration: "none", fontSize: 13 }}>
            Privacy
          </Link>
          <Link href="/cookies" style={{ color: TEXT_SECONDARY, textDecoration: "none", fontSize: 13 }}>
            Cookies
          </Link>
          <Link href="/guidelines" style={{ color: TEXT_SECONDARY, textDecoration: "none", fontSize: 13 }}>
            Guidelines
          </Link>
        </div>
      </div>
    </footer>
  );
}

export const metadata: Metadata = {
  title: "CollectorConnector",
  description: "Collectors unite.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "black", color: TEXT_PRIMARY }}>
        <Nav />
        <main style={{ minHeight: "calc(100vh - 64px - 68px)" }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
