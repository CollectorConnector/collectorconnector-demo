"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // SOCIAL LOGIN HANDLERS
  async function handleOAuth(provider: "google" | "apple" | "facebook") {
    setErrorMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setErrorMessage(error.message);
  }

  // EMAIL LOGIN
  async function handleEmailLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/auth/callback");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "32px",
          background: "#0d0d0d",
          border: "1px solid #1a1a1a",
          borderRadius: "14px",
          color: "#fff",
          boxShadow: "0 0 40px rgba(0,0,0,0.4)",
        }}
      >
        {/* LOGO */}
        <img
          src="/CC-main-logo.png"
          alt="CollectorConnector"
          style={{
            width: "160px",
            display: "block",
            margin: "0 auto 28px",
          }}
        />

        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "6px",
            textAlign: "center",
          }}
        >
          Welcome back
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#9CA3AF",
            marginBottom: "24px",
          }}
        >
          Log in to continue your collection journey
        </p>

        {errorMessage && (
          <div
            style={{
              background: "rgba(255,0,0,0.15)",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "18px",
              color: "#ff6b6b",
              border: "1px solid rgba(255,0,0,0.3)",
              fontSize: "14px",
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* SOCIAL BUTTONS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => handleOAuth("google")}
            style={{
              width: "100%",
              padding: "12px",
              background: "#111",
              color: "#fff",
              fontWeight: 600,
              borderRadius: 8,
              border: "1px solid #333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 20 }}>🔍</span>
            Continue with Google
          </button>

          <button
            onClick={() => handleOAuth("apple")}
            style={{
              width: "100%",
              padding: "12px",
              background: "#000",
              color: "#fff",
              fontWeight: 600,
              borderRadius: 8,
              border: "1px solid #333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 20 }}></span>
            Continue with Apple
          </button>

          <button
            onClick={() => handleOAuth("facebook")}
            style={{
              width: "100%",
              padding: "12px",
              background: "#111",
              color: "#fff",
              fontWeight: 600,
              borderRadius: 8,
              border: "1px solid #333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 20 }}>f</span>
            Continue with Facebook
          </button>
        </div>

        {/* DIVIDER */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "10px 0 18px" }}>
          <div style={{ height: 1, background: "#1F2937", flex: 1 }} />
          <div style={{ color: "#9CA3AF", fontSize: 12 }}>or</div>
          <div style={{ height: 1, background: "#1F2937", flex: 1 }} />
        </div>

        {/* EMAIL LOGIN FORM */}
        <form
          onSubmit={handleEmailLogin}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="email" style={{ color: "#D1D5DB", fontSize: 14 }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 8,
                border: "1px solid #1F2937",
                background: "#0d0d0d",
                color: "#fff",
                outline: "none",
              }}
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="password" style={{ color: "#D1D5DB", fontSize: 14 }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 8,
                border: "1px solid #1F2937",
                background: "#0d0d0d",
                color: "#fff",
                outline: "none",
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 4,
              width: "100%",
              padding: "12px",
              background: "#fff",
              color: "#000",
              fontWeight: 700,
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Logging in…" : "Log In"}
          </button>
        </form>

        <div style={{ marginTop: 18, color: "#9CA3AF", fontSize: 14, textAlign: "center" }}>
          New to CollectorConnector{" "}
          <a href="/auth/signup" style={{ color: "#fff", textDecoration: "none", fontWeight: 600 }}>
            Create an account
          </a>
        </div>
      </div>
    </div>
  );
}
