
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
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          textDecoration: "none",
          color: textPrimary,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/CC-SML-Logo.png"
          alt="CollectorConnector"
          width={42}
          height={42}
          style={{ display: "block" }}
        />
        <span style={{ fontWeight: 800 }}>CollectorConnector</span>
      </Link>

      <div style={{ marginLeft: "auto", display: "flex", gap: 14 }}>
        <Link href="/" style={{ color: textPrimary, textDecoration: "none" }}>
          Home
        </Link>
        <Link href="/upload" style={{ color: textPrimary, textDecoration: "none" }}>
          Upload
        </Link>
      </div>
    </nav>
  );
}
