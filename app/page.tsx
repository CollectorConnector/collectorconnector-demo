"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #1a1a1a 0%, #0a0a0a 70%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* NAVBAR — your original clean version */}
      <nav
        style={{
          width: "100%",
          padding: "18px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#fff",
          opacity: 0.9,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src="/CC-SML-Logo.png"
            alt="CC"
            style={{ width: 32, height: 32 }}
          />
          <span style={{ fontWeight: 700, fontSize: 18 }}>CollectorConnector</span>
        </div>

        <div style={{ display: "flex", gap: 20, fontSize: 15 }}>
          <Link href="/" style={{ color: "#9CA3AF", textDecoration: "none" }}>
            Home
          </Link>
          <Link href="/upload" style={{ color: "#9CA3AF", textDecoration: "none" }}>
            Upload
          </Link>
          <Link href="/auth/login" style={{ color: "#4ADE80", textDecoration: "none" }}>
            Log in
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          textAlign: "center",
          color: "#fff",
          position: "relative",
        }}
      >
        {/* ANIMATED GLOW */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "420px",
            height: "420px",
            background: "radial-gradient(circle, rgba(74,222,128,0.18), transparent 70%)",
            filter: "blur(60px)",
            animation: "pulseGlow 12s ease-in-out infinite",
            zIndex: 0,
          }}
        />

        <style>{`
          @keyframes pulseGlow {
            0% { opacity: 0.4; transform: translateX(-50%) scale(1); }
            50% { opacity: 0.7; transform: translateX(-50%) scale(1.15); }
            100% { opacity: 0.4; transform: translateX(-50%) scale(1); }
          }
        `}</style>

        <div style={{ position: "relative", zIndex: 2, maxWidth: "720px" }}>
          {/* MAIN LOGO */}
          <img
            src="/CC-main-logo.png"
            alt="CollectorConnector"
            style={{
              width: "200px",
              display: "block",
              margin: "0 auto 24px",
            }}
          />

          {/* MICRO TAGLINE */}
          <p
            style={{
              color: "#4ADE80",
              fontSize: "14px",
              letterSpacing: "2px",
              marginBottom: "12px",
            }}
          >
            BUILT FOR COLLECTORS
          </p>

          {/* MAIN TAGLINE */}
          <h1
            style={{
              fontSize: "36px",
              fontWeight: 800,
              marginBottom: "12px",
              letterSpacing: "-0.5px",
            }}
          >
            WHERE COLLECTORS MEET
          </h1>

          {/* SUBTAGLINE */}
          <p
            style={{
              fontSize: "18px",
              color: "#9CA3AF",
              marginBottom: "40px",
              lineHeight: 1.5,
            }}
          >
            Create your identity. Showcase your collections.  
            Connect with collectors around the world.
          </p>

          {/* CTA BUTTONS */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              maxWidth: "320px",
              margin: "0 auto",
            }}
          >
            <Link
              href="/auth/signup"
              style={{
                padding: "14px",
                background: "#4ADE80",
                color: "#000",
                borderRadius: "10px",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "16px",
              }}
            >
              Create your profile
            </Link>

            <Link
              href="/explore"
              style={{
                padding: "14px",
                border: "1px solid #4ADE80",
                color: "#4ADE80",
                borderRadius: "10px",
                fontWeight: 600,
                textDecoration: "none",
                fontSize: "16px",
              }}
            >
              Explore collectors
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
