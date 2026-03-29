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

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log("SIGNUP RESULT:", { data, error });

      if (error) {
        alert(error.message);
        return;
      }

      // If email confirmation is ON:
      // Supabase returns a user but NO session.
      if (data.user && !data.session) {
        alert("Check your email to confirm your account.");
        return;
      }

      // If email confirmation is OFF:
      // Supabase returns both user + session.
      if (data.session && data.user) {
        router.push("/profile/" + data.user.id);
        return;
      }

      // Fallback (should never happen)
      alert("Signup complete. Please check your email.");
    } catch (err: any) {
      alert(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ textAlign: "center", color: "#fff" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        Create your account
      </h1>

      <p style={{ color: "#A1A1A1", marginBottom: 32 }}>
        Start your CollectorConnector journey
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
          Sign up with Google
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
          onClick={handleEmailSignup}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 10,
            background: "#fff",
            color: "#000",
            fontWeight: 700,
            fontSize: 16,
            marginTop: 4,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </div>

      <p style={{ marginTop: 24, color: "#A1A1A1" }}>
        Already have an account{" "}
        <Link href="/auth/login" style={{ color: "#fff", fontWeight: 600 }}>
          Log in
        </Link>
      </p>
    </div>
  );
}
