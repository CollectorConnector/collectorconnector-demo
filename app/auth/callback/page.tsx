"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
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
        let { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        // 3. If no profile → create one (fallback)
        if (error || !profile) {
          setMessage("Setting up your profile...");
          console.log("No profile found — creating now");

          const { error: insertError } = await supabase.from("profiles").insert({
            id: userId,
            display_url: session.user.user_metadata?.full_name || "Stacy Pearce",
            username: session.user.user_metadata?.user_name || "CollectorConnector",
            tier: "Diamond",
            location: "Swindon, UK",
            bio: "Building the ultimate home for collectors worldwide...",
          });

          if (insertError) {
            console.error("Insert failed:", insertError);
          }

          // Re-fetch to be sure
          ({ data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single());
        }

        // 4. Now we have a profile — go to it
        if (profile) {
          setMessage("Taking you to your profile...");
          router.push(`/profile/${userId}`);
        } else {
          // Last resort fallback
          router.push(`/profile/${userId}`);
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        router.push("/auth/login");
      } finally {
        setLoading(false);
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
