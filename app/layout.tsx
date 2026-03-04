
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
      <body style={{ background: "#000", color: "#fff", margin: 0 }}>
        
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
          {/* LEFT SIDE - LOGO */}
          /
            /CC-SML-Logo.png
          </a>

          {/* RIGHT SIDE - NAV LINKS */}
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            
            /
              Home
            </a>

            /collectors
              Collectors
            </a>

            /create-profile
              Create Profile
            </a>

            {/* This adjusts depending on session */}
            <NavSessionLink />
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <main style={{ padding: "24px" }}>
          {children}
        </main>

      </body>
    </html>
  );
}
