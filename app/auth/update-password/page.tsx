"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);

  async function handleUpdate() {
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setUpdated(true);

    // Give the user a moment to read the success message
    setTimeout(() => {
      router.push("/auth/login");
    }, 1500);
  }

  return (
    <div className="auth-container">
      <h1 className="auth-title">Set a new password</h1>

      {!updated ? (
        <>
          <p className="auth-subtitle">
            Enter your new password below
          </p>

          <input
            type="password"
            className="auth-input"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="auth-submit"
          >
            {loading && <span className="spinner" />}
            {loading ? "Updating..." : "Update password"}
          </button>
        </>
      ) : (
        <p className="auth-subtitle">
          Your password has been updated.
        </p>
      )}

      <button
        onClick={() => router.push("/auth/login")}
        className="auth-forgot"
      >
        Back to login
      </button>
    </div>
  );
}
