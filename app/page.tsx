"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

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
            gap: "32px",
            maxWidth: "320px",
            margin: "0 auto",
          }}
        >
          {!loading && (
            <Link
              href={currentUserId ? `/profile/${currentUserId}` : "/auth/signup"}
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
              {currentUserId ? "Enter your Vault" : "Create your profile"}
            </Link>
          )}

          {/* SML-LOGO REPLACES EXPLORE BUTTON */}
          <img
            src="/CC-SML-Logo.png"
            alt="CC Icon"
            style={{
              width: "50px",
              height: "auto",
              opacity: 0.8,
            }}
          />
        </div>
      </div>
    </div>
  );
}
