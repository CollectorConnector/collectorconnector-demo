"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);
  const [loading, setLoading] = useState(false);

  function evaluateStrength(pw: string) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    setStrength(score);
  }

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

    if (data.user && !data.session) {
      alert("Check your email to confirm your account.");
      return;
    }

    if (data.session && data.user) {
      router.replace("/onboarding");
      return;
    }

    alert("Signup complete. Please check your email.");
  }

  return (
    <div className="auth-container">
      <h1 className="auth-title">Create your account</h1>
      <p className="auth-subtitle">Start your CollectorConnector journey</p>

      {/* SOCIAL SIGNUP */}
      <div className="auth-social">
        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: `${window.location.origin}/auth/callback` },
            })
          }
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

        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              evaluateStrength(e.target.value);
            }}
            className="auth-input"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "#aaa",
              fontSize: 14,
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* PASSWORD STRENGTH BAR */}
        <div style={{ height: 6, borderRadius: 4, background: "#333" }}>
          <div
            style={{
              height: "100%",
              width: `${(strength / 5) * 100}%`,
              borderRadius: 4,
              transition: "0.3s",
              background:
                strength <= 2
                  ? "#f87171"
                  : strength === 3
                  ? "#fbbf24"
                  : "#4ade80",
            }}
          />
        </div>

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
