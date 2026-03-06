"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // GOOGLE SIGNUP
  async function handleGoogleSignup() {
    setErrorMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setErrorMessage(error.message);
  }

  // APPLE SIGNUP
  async function handleAppleSignup() {
    setErrorMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setErrorMessage(error.message);
  }

  // FACEBOOK SIGNUP
  async function handleFacebookSignup() {
    setErrorMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setErrorMessage(error.message);
  }

  // EMAIL SIGNUP
  async function handleEmailSignup(e) {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
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
        background: "#0a0a0a",
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
          background: "#111",
          border: "1px solid #1F2937",
          borderRadius: "14px",
          color: "#fff",
          boxShadow: "0 0 40px rgba(0,0,0,0.4)",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "6px",
            textAlign: "center",
          }}
        >
          Create your account
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#9CA3AF",
            marginBottom: "24px",
          }}
        >
          Join the world of
