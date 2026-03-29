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

      // Pull onboarding data
      const displayName = localStorage.getItem("onboarding_displayName");
      const username = localStorage.getItem("onboarding_username");
      const avatar = localStorage.getItem("onboarding_avatar");
      const bio = localStorage.getItem("onboarding_bio") || "";
      const interests = localStorage.getItem("onboarding_interests") || "";

      // SPECIAL USER IDS
      const STACY_ID = "8b594b57-fc82-477a-a709-45aec99a228f"; // You (Diamond)
      const RICHARD_ID = "RICHARD_USER_ID"; // Replace once he signs up
      const MUM_ID = "e0759f79-d113-4af6-a575-cee076037092"; // Mum (Founder)

      // 1. Count how many *normal* users already exist
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .not("id", "in", `('${STACY_ID}', '${RICHARD_ID}', '${MUM_ID}')`);

      // 2. Determine tier
      let assignedTier = "Standard";

      if (userId === STACY_ID) {
        assignedTier = "Diamond";
      } else if (userId === RICHARD_ID || userId === MUM_ID) {
        assignedTier = "Founder";
      } else if (count < 25) {
        assignedTier = "Gold";
      } else if (count < 50) {
        assignedTier = "Silver";
      } else if (count < 75) {
        assignedTier = "Bronze";
      } else {
        assignedTier = "Standard";
      }

      // 3. Insert profile with assigned tier
      const { error } = await supabase.from("profiles").insert({
        id: userId,
        display_name: displayName,
        username,
        avatar_url: avatar,
        bio,
        interests,
        tier: assignedTier,
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
