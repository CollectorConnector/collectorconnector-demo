"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const debugStyles = `
    .cc-dropdown {
      background: #222 !important;
      border: 2px solid #666 !important;
      width: 260px !important;
      padding: 14px 0 !important;
      border-radius: 12px !important;
      box-shadow: 0 16px 40px rgba(0,0,0,0.8) !important;
      position: absolute !important;
      right: 0 !important;
      margin-top: 12px !important;
      z-index: 9999 !important;
    }
  `;

  // Load user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  // Realtime messages
  useEffect(() => {
    if (!userId) return;

    const checkInitialMessages = async () => {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", userId)
        .eq("is_read", false);

      if (count && count > 0) setHasNewMessage(true);
    };

    checkInitialMessages();

    const channel = supabase
      .channel("global-message-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          setHasNewMessage(true);
          if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <style>{debugStyles}</style>

      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "#000",
          borderBottom: "1px solid #1f1f1f",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        {/* LEFT: LOGO */}
        <div
          onClick={() => router.push(userId ? `/profile/${userId}` : "/")}
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <img
            src="/CC-main-logo.png"
            alt="Collector Connector"
            width={110}
            height={40}
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* RIGHT SIDE */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px", color: "white" }}>

          {/* SEARCH */}
          <button
            onClick={() => router.push("/search")}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              opacity: 0.8,
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 01-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* MESSAGES */}
          {userId && (
            <button
              onClick={() => {
                setHasNewMessage(false);
                router.push("/messages");
              }}
              style={{
                position: "relative",
                background: "none",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                opacity: 0.8,
              }}
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>

              {hasNewMessage && (
                <span
                  style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-4px",
                    width: "10px",
                    height: "10px",
                    background: "#ef4444",
                    borderRadius: "50%",
                    border: "2px solid #000",
                  }}
                />
              )}
            </button>
          )}

          {/* DROPDOWN */}
          {userId && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "#1f1f1f",
                  border: "1px solid #333",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 18 }}>☰</span>
              </button>

              {menuOpen && (
                <div className="cc-dropdown">
                  <MenuItem label="Profile" onClick={() => router.push(`/profile/${userId}`)} />

                  {/* Marketplace temporarily disabled */}
                  {/* <MenuItem label="Marketplace" onClick={() => router.push("/marketplace")} /> */}
                  {/* <MenuItem label="My Listings" onClick={() => router.push("/my-listings")} /> */}
                  {/* <MenuItem label="My Purchases" onClick={() => router.push("/my-purchases")} /> */}

                  <MenuItem label="Upgrade" onClick={() => router.push("/upgrade")} highlight />
                  <MenuItem label="Settings" onClick={() => router.push("/settings")} />
                  <MenuItem label="Logout" onClick={handleSignOut} danger />
                </div>
              )}
            </div>
          )}

          {/* LOGIN */}
          {!userId && (
            <button
              onClick={() => router
