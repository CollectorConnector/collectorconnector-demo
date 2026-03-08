import "./globals.css";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "CollectorConnector",
  description: "Where collectors meet",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#000",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* NAVBAR */}
        <header
          style={{
            width: "100%",
            padding: "14px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#000",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          {/* LEFT SIDE */}
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center" }}>
              <img
                src="/CC-MAIN-Logo.png"
                alt="CollectorConnector"
                style={{ height: 32, objectFit: "contain" }}
              />
            </Link>

            <nav
              style={{
                display: "flex",
                gap: 20,
                fontSize: 15,
                color: "#A1A1A1",
                fontWeight: 500,
              }}
            >
              <Link href="/" style={{ color: "#A1A1A1", textDecoration: "none" }}>
                Home
              </Link>
              <Link href="/explore" style={{ color: "#A1A1A1", textDecoration: "none" }}>
                Explore
              </Link>
              <Link href="/upload" style={{ color: "#A1A1A1", textDecoration: "none" }}>
                Upload
              </Link>
              <Link href="/profile/1" style={{ color: "#A1A1A1", textDecoration: "none" }}>
                Account
              </Link>
            </nav>
          </div>

          {/* RIGHT SIDE */}
          <div
            style={{
              display: "flex",
              gap: 16,
              fontSize: 14,
              alignItems: "center",
              color: "#A1A1A1",
            }}
          >
            <a href="https://urldefense.com/v3/__https://www.ebay.com__;!!PueBjVrnR72GDHWe!Tj61KxMSsmqsbnR1tLCk7bK9InOPUe0P-xh4krnitO32W00gsHv6dPgNm6MAA11ugiF8K8YUG2KBqD5BhKJYT05TsuBAKVnpQgY$" target="_blank" rel="noreferrer" style={{ color: "#A1A1A1" }}>
              eBay
            </a>
            <a href="https://urldefense.com/v3/__https://www.whatnot.com__;!!PueBjVrnR72GDHWe!Tj61KxMSsmqsbnR1tLCk7bK9InOPUe0P-xh4krnitO32W00gsHv6dPgNm6MAA11ugiF8K8YUG2KBqD5BhKJYT05TsuBAEj4eYMQ$" target="_blank" rel="noreferrer" style={{ color: "#A1A1A1" }}>
              Whatnot
            </a>
            <a href="https://urldefense.com/v3/__https://www.instagram.com__;!!PueBjVrnR72GDHWe!Tj61KxMSsmqsbnR1tLCk7bK9InOPUe0P-xh4krnitO32W00gsHv6dPgNm6MAA11ugiF8K8YUG2KBqD5BhKJYT05TsuBAx3HU3wU$" target="_blank" rel="noreferrer" style={{ color: "#A1A1A1" }}>
              Instagram
            </a>
            <a href="https://urldefense.com/v3/__https://www.youtube.com__;!!PueBjVrnR72GDHWe!Tj61KxMSsmqsbnR1tLCk7bK9InOPUe0P-xh4krnitO32W00gsHv6dPgNm6MAA11ugiF8K8YUG2KBqD5BhKJYT05TsuBASddeiQ4$" target="_blank" rel="noreferrer" style={{ color: "#A1A1A1" }}>
              YouTube
            </a>
            <a href="https://urldefense.com/v3/__https://discord.com__;!!PueBjVrnR72GDHWe!Tj61KxMSsmqsbnR1tLCk7bK9InOPUe0P-xh4krnitO32W00gsHv6dPgNm6MAA11ugiF8K8YUG2KBqD5BhKJYT05TsuBAEI_dAsI$
