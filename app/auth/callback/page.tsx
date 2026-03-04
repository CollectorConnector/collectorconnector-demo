
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkProfile() {
      // 1. Wait for Supabase to restore the session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // No session → go to login
      if (!session) {
        router.push("/auth/login");
        return;
      }

      // 2. Check if the user already has a profile in Supabase
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      // 3. Redirect depending on profile status
      if (!profile) {
        router.push("/edit-profile"); // first time
      } else {
        router.push("/account"); // returning user
      }

      setLoading(false);
    }

    checkProfile();
  }, [router]);

  return (
    <div style={{ color: "#fff", padding: "40px", textAlign: "center" }}>
      <h1>Processing login…</h1>
      <p>This will only take a moment.</p>
    </div>
  );
}

