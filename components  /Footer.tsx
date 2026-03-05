
// components/Footer.tsx
import Link from "next/link";

const borderColor = "#1f1f1f";
const textSecondary = "#9CA3AF";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${borderColor}`,
        padding: "18px 16px",
        color: textSecondary,
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
        <img src="/CC-SML-Logo.png" alt="CollectorConnector" width={18} height={18} />
        <span style={{ fontSize: 13 }}>© {new Date().getFullYear()} CollectorConnector</span>

        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <Link href="/terms" style={{ color: textSecondary, textDecoration: "none" }}>Terms</Link>
          <Link href="/privacy" style={{ color: textSecondary, textDecoration: "none" }}>Privacy</Link>
          <Link href="/cookies" style={{ color: textSecondary, textDecoration: "none" }}>Cookies</Link>
          <Link href="/guidelines" style={{ color: textSecondary, textDecoration: "none" }}>Guidelines</Link>
        </div>
      </div>
    </footer>
  );
}
