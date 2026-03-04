
import "./globals.css";
import { ReactNode } from "react";
import NavSessionLink from "@/components/NavSessionLink";

export const metadata = {
  title: "CollectorConnector",
  description: "Create your collector profile",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#000", color: "#fff" }}>
        {/* NAVIGATION BAR */}
        <nav
          style={{
            width: "100%",
            padding: "16px 24px",
            background: "#000",
            borderBottom: "1px solid #1F2937",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          {/* LEFT SIDE - APP NAME */}
          <a
            href="/"
            style={{
              color: "#fff",
              fontSize: "20px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            CollectorConnector
          </a>

          {/* RIGHT SIDE - NAV LINKS */}
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <a href="/" style={{ color: "#fff", textDecoration: "none" }}>
              Home
            </a>
            <a href="/collectors" style={{ color: "#fff", textDecoration: "none" }}>
              Collectors
            </a>
            <a href="/create-profile" style={{ color: "#fff", textDecoration: "none" }}>
              Create Profile
            </a>

            {/* This will show Login or Account depending on session */}
            <NavSessionLink />
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
