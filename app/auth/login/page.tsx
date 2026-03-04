
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // GOOGLE LOGIN
  async function handleGoogleLogin() {
    setErrorMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setErrorMessage(error.message);
  }

  // APPLE LOGIN
  async function handleAppleLogin() {
    setErrorMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setErrorMessage(error.message);
  }

  // FACEBOOK LOGIN
  async function handleFacebookLogin() {
    setErrorMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setErrorMessage(error.message);
  }

  // EMAIL + PASSWORD LOGIN
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setSubmitting(false);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    // If login succeeds, let the callback page decide where to go (edit-profile vs account)
    router.push("/auth/callback");
  }

  return (
    <div
      style={{
        maxWidth: "420px",
        margin: "60px auto",
        padding: "24px",
        background: "#111",
        border: "1px solid #1F2937",
        borderRadius: "12px",
        color: "#fff",
      }}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>Login</h1>

      {/* Errors */}
      {errorMessage && (
        <div
          style={{
            background: "rgba(255,0,0,0.2)",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "15px",
            color: "#ff6b6b",
            border: "1px solid rgba(255,0,0,0.35)",
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Social buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        <button
          onClick={handleGoogleLogin}
          style={{
            width: "100%",
            padding: "10px",
            background: "#fff",
            color: "#000",
            fontWeight: 600,
            borderRadius: 8,
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 20 }}>🟦</span>
          Continue with Google
        </button>

        <button
          onClick={handleAppleLogin}
          style={{
            width: "100%",
            padding: "10px",
            background: "#000",
            color: "#fff",
            fontWeight: 600,
            borderRadius: 8,
            border: "1px solid #333",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 20 }}></span>
          Continue with Apple
        </button>

        <button
          onClick={handleFacebookLogin}
          style={{
            width: "100%",
            padding: "10px",
            background: "#1877F2",
            color: "#fff",
            fontWeight: 600,
            borderRadius: 8,
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 20 }}>f</span>
          Continue with Facebook
        </button>
      </div>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "10px 0 18px" }}>
        <div style={{ height: 1, background: "#1F2937", flex: 1 }} />
        <div style={{ color: "#9CA3AF", fontSize: 12 }}>or</div>
        <div style={{ height: 1, background: "#1F2937", flex: 1 }} />
      </div>

      {/* Email login form */}
      <form onSubmit={handleEmailLogin} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="email" style={{ color: "#D1D5DB" }}>
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
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #1F2937",
              outline: "none",
            }}
            required
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="password" style={{ color: "#D1D5DB" }}>
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
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #1F2937",
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
            background: "#4ADE80",
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

      {/* Link to Sign up */}
      <div style={{ marginTop: 14, color: "#9CA3AF", fontSize: 14 }}>
        New to CollectorConnector?{" "}
        <a href="/auth/signup" style={{ color: "#4ADE80", textDecoration: "none", fontWeight: 600 }}>
          Create an account
        </a>
      </div>
    </div>
  );
}
