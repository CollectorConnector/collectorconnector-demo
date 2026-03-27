"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleEmailLogin() {
    await supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  return (
    <div style={{ textAlign: "center", color: "#fff" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        Welcome back
      </h1>

      <p style={{ color: "#A1A1A1", marginBottom: 32 }}>
        Log in to continue your journey
      </p>

      {/* SOCIAL BUTTONS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: `${window.location.origin}/auth/callback` },
            })
          }
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 10,
            background: "#111",
            border: "1px solid #fff",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          Log in with Google
        </button>

        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: "facebook",
              options: { redirectTo: `${window.location.origin}/auth/callback` },
            })
          }
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 10,
            background: "#111",
            border: "1px solid #fff",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          Log in with Facebook
        </button>
      </div>

      {/* DIVIDER */}
      <div
        style={{
          margin: "28px 0",
          height: 1,
          background: "rgba(255,255,255,0.1)",
        }}
      />

      {/* EMAIL FORM */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 10,
            background: "#111",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            fontSize: 15,
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 10,
            background: "#111",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            fontSize: 15,
          }}
        />

        <button
          onClick={handleEmailLogin}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 10,
            background: "#fff",
            color: "#000",
            fontWeight: 700,
            fontSize: 16,
            marginTop: 4,
          }}
        >
          Log In
        </button>
      </div>

      <p style={{ marginTop: 24, color: "#A1A1A1" }}>
        Don’t have an account{" "}
        <Link href="/auth/signup" style={{ color: "#fff", fontWeight: 600 }}>
          Sign up
        </Link>
      </p>
    </div>
  );
}
