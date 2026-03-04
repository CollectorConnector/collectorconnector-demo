
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // GOOGLE LOGIN
  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setErrorMessage(error.message);
  }

  // APPLE LOGIN
  async function handleAppleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setErrorMessage(error.message);
  }

  // FACEBOOK LOGIN (logic added next step)
  async function handleFacebookLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setErrorMessage(error.message);
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
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>Login</h1>

      {/* ERROR MESSAGE */}
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

      {/* SOCIAL LOGIN BUTTONS */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "24px",
        }}
      >
        {/* Google */}
        <button
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
          onClick={handleGoogleLogin}
        >
          <span style={{ fontSize: "20px" }}>🟦</span>
          Continue with Google
        </button>

        {/* Apple */}
        <button
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
          onClick={handleAppleLogin}
        >
          <span style={{ fontSize: "20px" }}></span>
          Continue with Apple
        </button>

        {/* Facebook */}
        <button
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
          onClick={handleFacebookLogin}
        >
          <span style={{ fontSize: "20px" }}>f</span>
          Continue with Facebook
        </button>
      </div>
    </div>
  );
}
