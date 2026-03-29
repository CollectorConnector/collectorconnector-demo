"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function finishLogin() {
      // Get the user AFTER OAuth redirect
      const { data, error } = await supabase.auth.getUser();

      // If something went wrong, send them back to login
      if (error || !data.user) {
        router.replace("/auth/login");
        return;
      }

      // Redirect to the correct profile
      router.replace(`/profile/${data.user.id}`);
    }

    finishLogin();
  }, [router]);

  return (
    <div className="auth-callback">
      <div className="spinner-large" />
    </div>
  );
}
