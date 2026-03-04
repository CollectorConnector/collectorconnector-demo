
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  // --- Social sign-up / login (uses same OAuth flow as Login) ---

  async function handleGoogle() {
    setErrorMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setErrorMessage(error.message);
  }

  async function handleApple() {
    setErrorMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setErrorMessage(error.message);
  }

  async function handleFacebook() {
    setErrorMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setErrorMessage(error.message);
  }

  // --- Email + Password sign-up ---

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setInfoMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter an email and a password.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // If email confirmations are enabled in Supabase,
        // this is where users come back after confirming:
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    // If confirmations are ON: no session yet → ask user to check email.
    if (data && !data.session) {
      setInfoMessage("Check your email to confirm your account, then you’ll be redirected back here.");
      return;
    }

    // If confirmations are OFF: session exists → proceed to callback flow
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
      }}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>Create Account</h1>

      {/* Messages */}
      {errorMessage && (
        <div
          style={{
            background: "rgba(255,0,0,0.2)",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "15px",
            color: "#ff6b6b",
          }}
        >
          {errorMessage}
        </div>
      )}

      {infoMessage && (
        <div
          style={{
            background: "rgba(74,222,128,0.15)",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "15px",
            color: "#86efac",
            border: "1px solid rgba(74,222,128,0.35)",
          }}
        >
          {infoMessage}
        </div>
      )}

      {/* Social providers (Pinterest-style: icon + text) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {/* Google */}
        <button
          onClick={handleGoogle}
          style={{
            width: "100%",
            padding: "10px",
            background: "#fff",
            color: "#000",
            fontWeight: 600,
            borderRadius: "8px",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: "20px" }}>🟦</span>
          Continue with Google
        </button>

        {/* Apple */}
        <button
          onClick={handleApple}
          style={{
            width: "100%",
            padding: "10px",
            background: "#000",
            color: "#fff",
            fontWeight: 600,
            borderRadius: "8px",
            border: "1px solid #333",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: "20px" }}></span>
          Continue with Apple
        </button>

        {/* Facebook */}
        <button
          onClick={handleFacebook}
          style={{
            width: "100%",
            padding: "10px",
            background: "#1877F2",
            color: "#fff",
            fontWeight: 600,
            borderRadius: "8px",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: "20px" }}>f</span>
          Continue with Facebook
        </button>
      </div>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "10px 0 18px" }}>
        <div style={{ height: 1, background: "#1F2937", flex: 1 }} />
        <div style={{ color: "#9CA3AF", fontSize: 12 }}>or</div>
        <div style={{ height: 1, background: "#1F2937", flex: 1 }} />
      </div>

      {/* Email sign-up form */}
      <form onSubmit={handleEmailSignup} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="email" style={{ color: "#D1D5DB" }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #1F2937",
              outline: "none",
            }}
            placeholder="you@example.com"
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
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #1F2937",
              outline: "none",
            }}
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          style={{
            marginTop: "4px",
            width: "100%",
            padding: "12px",
            background: "#4ADE80",
            color: "#000",
            fontWeight: 700,
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Create Account
        </button>
      </form>

      {/* Link to Login */}
      <div style={{ marginTop: 14, color: "#9CA3AF", fontSize: 14 }}>
        Already have an account?{" "}
        <a href="/auth/login" style={{ color: "#4ADE80", textDecoration: "none", fontWeight: 600 }}>
          Log in
        </a>
      </div>
    </div>
  );
}

