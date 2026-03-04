
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Profile = {
  id: string;
  username: string | null;
  tier: string | null;
};

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Not logged in → redirect
      if (!session) {
        router.push("/auth/login");
        return;
      }

      setSession(session);

      // Fetch profile
      const { data: p } = await supabase
        .from("profiles")
        .select("id, username, tier")
        .eq("id", session.user.id)
        .maybeSingle();

      setProfile(p || null);
      setLoading(false);
    }

    loadUser();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div style={{ color: "#fff", padding: "40px" }}>
        <h1>Loading your account…</h1>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "60px auto",
        padding: "24px",
        background: "#111",
        border: "1px solid #1F2937",
        borderRadius: "12px",
        color: "#fff",
      }}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "12px" }}>
        My Account
      </h1>

      {/* EMAIL */}
      <p style={{ marginBottom: "8px", color: "#D1D5DB" }}>
        <strong>Email:</strong> {session?.user?.email}
      </p>

      {/* USERNAME */}
      <p style={{ marginBottom: "8px", color: "#D1D5DB" }}>
        <strong>Username:</strong>{" "}
        {profile?.username || (
          <span style={{ color: "#4ADE80" }}>Not set yet</span>
        )}
      </p>

      {/* TIER */}
      <p style={{ marginBottom: "20px", color: "#D1D5DB" }}>
        <strong>Tier:</strong> {profile?.tier || "—"}
      </p>

      {/* ACTION BUTTONS */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginTop: "20px",
        }}
      >
        {/* EDIT PROFILE */}
        <button
          onClick={() => router.push("/edit-profile")}
          style={{
            padding: "12px",
            background: "#4ADE80",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Edit Profile
        </button>

        {/* VIEW PUBLIC PROFILE */}
        <button
          onClick={() =>
            router.push(`/profile/${profile?.username || ""}`)
          }
          style={{
            padding: "12px",
            background: "#1F2937",
            border: "1px solid #4ADE80",
            color: "#4ADE80",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
          }}
          disabled={!profile?.username}
        >
          View Public Profile
        </button>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          style={{
            padding: "12px",
            background: "#7F1D1D",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
