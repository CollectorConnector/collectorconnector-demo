"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function finish() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/auth/login");
        return;
      }

      router.replace(`/profile/${data.user.id}`);
    }

    finish();
  }, [router]);

  return (
    <div className="auth-callback">
      <div className="spinner-large" />
    </div>
  );
}
