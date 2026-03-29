"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [available, setAvailable] = useState<boolean | null>(null);

  // Debounce timer
  const [typingTimer, setTypingTimer] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/auth/login");
        return;
      }

      setUserId(data.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile) {
        router.replace(`/profile/${data.user.id}`);
        return;
      }

      setLoading(false);
    }

    loadUser();
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

  async function handleCreateProfile() {
    if (!userId) return;

    if (!available) {
      alert("Username is not available.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("profiles").insert({
      id: userId,
      display_name: displayName,
      username: username.toLowerCase(),
      avatar_url: null,
      bio: "",
      created_at: new Date().toISOString(),
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.replace(`/profile/${userId}`);
  }

  if (loading) {
    return (
      <div className="auth-callback">
        <div className="spinner-large" />
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h1 className="auth-title">Create your profile</h1>
      <p className="auth-subtitle">Just a couple of details to get started</p>

      <div className="auth-form">
        <input
          type="text"
          className="auth-input"
          placeholder="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

        <input
          type="text"
          className="auth-input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {available === true && (
          <p style={{ color: "#4ade80", fontSize: 14 }}>Username available</p>
        )}
        {available === false && (
          <p style={{ color: "#f87171", fontSize: 14 }}>
            Username already taken
          </p>
        )}

        <button
          onClick={handleCreateProfile}
          disabled={saving}
          className="auth-submit"
        >
          {saving && <span className="spinner" />}
          {saving ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
