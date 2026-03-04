
import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "CollectorConnector",
  description: "Create your collector profile",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#000", color: "#fff" }}>

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
          /
            CollectorConnector
          </a>

          {/* RIGHT SIDE - NAV LINKS */}
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            /Home</a>
            /collectorsCollectors</a>
            /create-profileCreate Profile</a>
            /auth/login
              Login
            </a>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
