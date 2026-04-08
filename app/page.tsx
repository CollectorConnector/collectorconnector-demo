"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #0d0d0d 0%, #000000 70%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "20px",
        paddingTop: "80px",
        textAlign: "center",
        color: "#fff",
      }}
    >
      {/* MAIN CONTENT WRAPPER */}
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        
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
            color: "#ffffff",
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

        {/* CTA SECTION */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "32px", // Increased gap to give the logo breathing room
            maxWidth: "320px",
            margin: "0 auto",
          }}
        >
          <Link
            href="/auth/signup"
            style={{
              width: "100%",
              padding: "14px",
              background: "#ffffff",
              color: "#000",
              borderRadius: "10px",
              fontWeight: 700,
              textDecoration: "none",
              fontSize: "16px",
            }}
          >
            Create your profile
          </Link>

          {/* SML-LOGO REPLACES EXPLORE BUTTON */}
          <img
            src="/sml-logo.png"
            alt="CC Icon"
            style={{
              width: "50px", // Adjust size as needed
              height: "auto",
              opacity: 0.8,
            }}
          />
        </div>
      </div>
    </div>
  );
}
