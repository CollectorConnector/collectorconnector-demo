"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0a0a0a 0%, #111 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "720px",
          textAlign: "center",
          color: "#fff",
          padding: "32px",
        }}
      >
        {/* LOGO */}
        <img
          src="/CC-main-logo.png"
          alt="CollectorConnector"
          style={{
            width: "200px",
            display: "block",
            margin: "0 auto 32px",
          }}
        />

        {/* TAGLINE */}
        <h1
          style={{
            fontSize: "32px",
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

        {/* BUTTONS */}
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
  );
}
