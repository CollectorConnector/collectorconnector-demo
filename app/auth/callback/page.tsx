"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function handleAuth() {
      // 1. Get the session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth/login");
        return;
      }

      const userId = session.user.id;

      // 2. Check if profile exists
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      // If lookup fails, treat as no profile
      if (error) {
        console.error("Profile lookup failed:", error);
      }

      // 3. If no profile exists → create one and send to onboarding
      if (!profile) {
        await supabase.from("profiles").insert({
          id: userId,
          username: null,
          avatar_url: null,
          bio: null,
        });

        router.push("/edit-profile");
        return;
      }

      // 4. If profile exists → send to their profile page
      router.push(`/profile/${userId}`);
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
