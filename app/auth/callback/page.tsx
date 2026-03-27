"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function handleAuth() {
      // 1. Wait for Supabase to restore the session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // No session → send back to login
      if (!session) {
        router.push("/auth/login");
        return;
      }

      // 2. Check if the user already has a profile
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      // If profile lookup fails → treat as new user
      if (error) {
        console.error("Profile lookup failed:", error);
        router.push("/edit-profile");
        return;
      }

      // 3. Redirect based on profile status
      if (!profile) {
        router.push("/edit-profile"); // first-time user
      } else {
        router.push(`/profile/${session.user.id}`); // returning user
      }

      setLoading(false);
    }

    handleAuth();
  }, [router]);

  return (
    <div
      style={{
        color: "#fff",
        padding: "40px",
        textAlign: "center",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Processing login…</h1>
      <p style={{ opacity: 0.7 }}>This will only take a moment.</p>
    </div>
  );
}
