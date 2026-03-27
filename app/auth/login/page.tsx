"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin() {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    // Better redirect — let the callback handle the rest
    router.push("/auth/callback");
  }

  async function handleOAuth(provider: "google" | "facebook") {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    }
    // No need to do anything else — Supabase will redirect to /auth/callback
  }

  return (
    <div style={{ textAlign: "center", color: "#fff", maxWidth: 400, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        Welcome back
      </h1>

      <p style={{ color: "#A1A1A1", marginBottom: 32 }}>
        Log in to continue your journey
      </p>

      {/* SOCIAL BUTTONS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        <button
          onClick={() => handleOAuth("google")}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 10,
            background: "#111",
            border: "1px solid #fff",
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          {loading ? "Connecting..." : "Log in with Google"}
        </button>

        {/* Uncomment when you're ready for Facebook */}
        {/* 
        <button
          onClick={() => handleOAuth("facebook")}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 10,
            background: "#111",
            border: "1px solid #fff",
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          Log in with Facebook
        </button>
        */}
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
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 10,
            background: loading ? "#ccc" : "#fff",
            color: "#000",
            fontWeight: 700,
            fontSize: 16,
            marginTop: 4,
          }}
        >
          {loading ? "Logging in..." : "Log In"}
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
