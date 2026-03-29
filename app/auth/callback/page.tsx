"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const [message, setMessage] = useState("Processing login…");

  useEffect(() => {
    async function handleAuth() {
      try {
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
        let { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        // 3. If no profile → create a clean one
        if (!profile) {
          setMessage("Setting up your profile…");

          await supabase.from("profiles").insert({
            id: userId,
            username: null,
            display_url: null,
            avatar_url: null,
            tier: null,
            location: null,
            bio: null,
            instagram: null,
            youtube: null,
            ebay: null,
            whatnot: null,
            discord: null,
            website: null,
            items_count: 0,
            collections_count: 0,
            rarity_score: 0,
          });

          // Re-fetch
          const { data: newProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          profile = newProfile;
        }

        // 4. Redirect to THEIR profile
        setMessage("Taking you to your profile…");
        router.push(`/profile/${userId}`);
      } catch (err) {
        console.error("Auth callback error:", err);
        router.push("/auth/login");
      }
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
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>{message}</h1>
      <p style={{ opacity: 0.7 }}>This will only take a moment.</p>
    </div>
  );
}
