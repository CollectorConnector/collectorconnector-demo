
// components/Nav.tsx
import Link from "next/link";

const borderColor = "#1f1f1f";
const textPrimary = "#E5E7EB";

export default function Nav() {
  return (
    <nav
      style={{
        height: 64,
        borderBottom: `1px solid ${borderColor}`,
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
        /CC-SML-Logo.png
        <span style={{ fontWeight: 800, color: textPrimary }}>CollectorConnector</span>
      </Link>

      <div style={{ marginLeft: "auto", display: "flex", gap: 14 }}>
        <Link href="/" style={{ color: textPrimary, textDecoration: "none", fontWeight: 600 }}>
          Home
        </Link>
        <Link href="/upload" style={{ color: textPrimary, textDecoration: "none", fontWeight: 600 }}>
          Upload
        </Link>
      </div>
    </nav>
  );
}
