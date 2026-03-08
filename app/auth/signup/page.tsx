"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: "32px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 380, width: "100%" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Create your account
        </h1>

        <p style={{ color: "#A1A1A1", marginBottom: 32 }}>
          Start your CollectorConnector journey
        </p>

        {/* SOCIAL BUTTONS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
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

          <button
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
            Sign up with Apple
          </button>

          <button
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
            Sign up with Facebook
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

          {/* SIGN UP BUTTON */}
          <button
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
            Sign Up
          </button>
        </div>

        {/* LOGIN LINK */}
        <p style={{ marginTop: 24, color: "#A1A1A1" }}>
          Already have an account{" "}
          <Link href="/auth/login" style={{ color: "#fff", fontWeight: 600 }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
