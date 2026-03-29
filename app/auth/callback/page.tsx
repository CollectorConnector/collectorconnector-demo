"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function finishLogin() {
      // 1. Get the user after OAuth redirect
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/auth/login");
        return;
      }

      const userId = data.user.id;

      // 2. Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      // 3. If no profile → onboarding
      if (!profile) {
        router.replace("/onboarding");
        return;
      }

      // 4. Otherwise → their profile
      router.replace(`/profile/${userId}`);
    }

    finishLogin();
  }, [router]);

  return (
    <div className="auth-callback">
      <div className="spinner-large" />
    </div>
  );
}
