"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailSignup() {
    if (!email.trim() || !password.trim()) {
      alert("Please enter an email and password.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    // If email confirmation is ON → no session yet
    if (data.user && !data.session) {
      alert("Check your email to confirm your account.");
      return;
    }

    // If email confirmation is OFF → user + session exist
    if (data.session && data.user) {
      const userId = data.user.id;

      // Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      // No profile → onboarding
      if (!profile) {
        router.replace("/onboarding");
        return;
      }

      // Profile exists → go to profile
      router.replace(`/profile/${userId}`);
      return;
    }

    // Fallback
    alert("Signup complete. Please check your email.");
  }

  async function handleOAuthSignup() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="auth-container">
      <h1 className="auth-title">Create your account</h1>
      <p className="auth-subtitle">Start your CollectorConnector journey</p>

      {/* SOCIAL SIGNUP */}
      <div className="auth-social">
        <button
          onClick={handleOAuthSignup}
          disabled={loading}
          className="auth-social-btn"
        >
          {loading ? <span className="spinner" /> : "Sign up with Google"}
        </button>
      </div>

      <div className="auth-divider" />

      {/* EMAIL SIGNUP */}
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

        <button
          onClick={handleEmailSignup}
          disabled={loading}
          className="auth-submit"
        >
          {loading && <span className="spinner" />}
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </div>

      <p className="auth-footer">
        Already have an account{" "}
        <Link href="/auth/login" className="auth-link">
          Log in
        </Link>
      </p>
    </div>
  );
}
