"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Double check session and user to bypass any browser lag
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
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
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        
        <img
          src="/CC-main-logo.png"
          alt="CollectorConnector"
          style={{
            width: "200px",
            display: "block",
            margin: "0 auto 24px",
          }}
        />

        <p style={{ color: "#ffffff", fontSize: "14px", letterSpacing: "2px", marginBottom: "12px" }}>
          BUILT FOR COLLECTORS
        </p>

        <h1 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "12px", letterSpacing: "-0.5px" }}>
          WHERE COLLECTORS MEET
        </h1>

        <p style={{ fontSize: "18px", color: "#9CA3AF", marginBottom: "40px", lineHeight: 1.5 }}>
          Create your identity. Showcase your collections.  
          Connect with collectors around the world.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            maxWidth: "320px",
            margin: "0 auto",
          }}
        >
          {!loading ? (
            <>
              <Link
                href={currentUserId ? `/profile/${currentUserId}` : "/auth/signup"}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "#ffffff",
                  color: "#000",
                  borderRadius: "12px",
                  fontWeight: 800,
                  textDecoration: "none",
                  fontSize: "16px",
                  boxShadow: "0 4px 20px rgba(255,255,255,0.1)"
                }}
              >
                {currentUserId ? "ENTER YOUR VAULT" : "CREATE YOUR PROFILE"}
              </Link>

              {!currentUserId && (
                <Link 
                  href="/auth/login" 
                  style={{ color: "#818cf8", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}
                >
                  Already have a profile? Sign In
                </Link>
              )}
            </>
          ) : (
            <div style={{ height: "50px" }} /> // Spacer to prevent layout shift while loading
          )}

          <img
            src="/CC-SML-Logo.png"
            alt="CC Icon"
            style={{
              width: "50px",
              height: "auto",
              opacity: 0.6,
              marginTop: "20px"
            }}
          />
        </div>
      </div>
    </div>
  );
}
