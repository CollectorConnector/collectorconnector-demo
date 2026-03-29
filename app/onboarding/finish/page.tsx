"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Finish() {
  const router = useRouter();
  const [saving, setSaving] = useState(true);

  useEffect(() => {
    async function save() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/auth/login");
        return;
      }

      const userId = data.user.id;

      const displayName = localStorage.getItem("onboarding_displayName");
      const username = localStorage.getItem("onboarding_username");
      const avatar = localStorage.getItem("onboarding_avatar");
      const bio = localStorage.getItem("onboarding_bio") || "";
      const interests = localStorage.getItem("onboarding_interests") || "";

      const { error } = await supabase.from("profiles").insert({
        id: userId,
        display_name: displayName,
        username,
        avatar_url: avatar,
        bio,
        interests,
        created_at: new Date().toISOString(),
      });

      if (error) {
        alert(error.message);
        return;
      }

      // Clear onboarding data
      localStorage.removeItem("onboarding_displayName");
      localStorage.removeItem("onboarding_username");
      localStorage.removeItem("onboarding_avatar");
      localStorage.removeItem("onboarding_bio");
      localStorage.removeItem("onboarding_interests");

      router.replace(`/profile/${userId}`);
    }

    save();
  }, [router]);

  return (
    <div className="auth-callback">
      <div className="spinner-large" />
    </div>
  );
}

