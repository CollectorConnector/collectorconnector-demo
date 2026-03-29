"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin() {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        shouldCreateUser: false,
        expiresIn: remember ? 60 * 60 * 24 * 30 : 60 * 60, // 30 days vs 1 hour
      },
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push(`/profile/${data.user.id}`);
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
  }

  return (
    <div className="auth-container">
      <h1 className="auth-title">Welcome back</h1>
      <p className="auth-subtitle">Log in to continue your journey</p>

      {/* SOCIAL LOGIN */}
      <div className="auth-social">
        <button
          onClick={() => handleOAuth("google")}
          disabled={loading}
          className="auth-social-btn"
        >
          {loading ? (
            <span className="spinner" />
          ) : (
            "Log in with Google"
          )}
        </button>
      </div>

      <div className="auth-divider" />

      {/* EMAIL LOGIN */}
      <div className="auth-form">
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
        />

        <label className="auth-remember">
          <input
            type="checkbox"
            checked={remember}
            onChange={() => setRemember(!remember)}
          />
          <span>Remember me</span>
        </label>

        <button
          onClick={handleEmailLogin}
          disabled={loading}
          className="auth-submit"
        >
          {loading && <span className="spinner" />}
          {loading ? "Logging in..." : "Log In"}
        </button>

        <button
          onClick={() => router.push("/auth/reset")}
          className="auth-forgot"
        >
          Forgot your password
        </button>
      </div>

      <p className="auth-footer">
        Don’t have an account{" "}
        <Link href="/auth/signup" className="auth-link">
          Sign up
        </Link>
      </p>
    </div>
  );
}
