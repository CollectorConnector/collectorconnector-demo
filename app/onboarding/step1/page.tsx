"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Step1() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [available, setAvailable] = useState<boolean | null>(null);

  const [typingTimer, setTypingTimer] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/auth/login");
        return;
      }

      setUserId(data.user.id);
      setLoading(false);
    }
    load();
  }, [router]);

  // Username availability check
  useEffect(() => {
    if (!username.trim()) {
      setAvailable(null);
      return;
    }

    if (typingTimer) clearTimeout(typingTimer);

    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username.toLowerCase())
        .maybeSingle();

      setAvailable(!data);
    }, 400);

    setTypingTimer(timer);
  }, [username]);

  async function next() {
    if (!displayName.trim() || !username.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    if (!available) {
      alert("Username is not available.");
      return;
    }

    localStorage.setItem("onboarding_displayName", displayName);
    localStorage.setItem("onboarding_username", username.toLowerCase());

    router.push("/onboarding/step2");
  }

  if (loading) {
    return (
      <div className="auth-callback">
        <div className="spinner-large" />
      </div>
    );
  }

  return (
    <>
      <h1 className="auth-title">Your identity</h1>
      <p className="auth-subtitle">Choose how you’ll appear in CollectorConnector</p>

      <div className="auth-form">
        <input
          className="auth-input"
          placeholder="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

        <input
          className="auth-input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {available === true && (
          <p style={{ color: "#4ade80", fontSize: 14 }}>Username available</p>
        )}
        {available === false && (
          <p style={{ color: "#f87171", fontSize: 14 }}>Username already taken</p>
        )}

        <button className="auth-submit" onClick={next}>
          Continue
        </button>
      </div>
    </>
  );
}

