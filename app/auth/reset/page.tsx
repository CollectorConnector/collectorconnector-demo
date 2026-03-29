"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleReset() {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setSent(true);
  }

  return (
    <div className="auth-container">
      <h1 className="auth-title">Reset your password</h1>

      {!sent ? (
        <>
          <p className="auth-subtitle">
            Enter your email and we’ll send you a reset link
          </p>

          <input
            type="email"
            className="auth-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button onClick={handleReset} className="auth-submit">
            Send reset link
          </button>
        </>
      ) : (
        <p className="auth-subtitle">
          Check your inbox — we’ve sent you a reset link.
        </p>
      )}

      <button onClick={() => router.push("/auth/login")} className="auth-forgot">
        Back to login
      </button>
    </div>
  );
}
