"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    router.push("/");
    router.refresh();
  };

  return (
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
        style={{ cursor: "pointer", display: 'flex', alignItems: 'center' }}
      >
        <img
          src="/CC-main-logo.png"
          alt="Collector Connector"
          width={110}
          height={40}
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* RIGHT: UTILITY NAVIGATION */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px", 
          color: "white",
        }}
      >
        {/* SEARCH ICON */}
        <button
          onClick={() => router.push("/search")}
          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', opacity: 0.8 }}
          aria-label="Search"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 01-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* LOGIC GATES FOR LOGGED IN / OUT */}
        {userId ? (
          <>
            <button 
              onClick={() => router.push(`/profile/${userId}`)}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', letterSpacing: '1px' }}
            >
              MY PROFILE
            </button>
            
            <button 
              onClick={handleSignOut}
              style={{ background: 'none', border: 'none', color: '#666', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
            >
              LOGOUT
            </button>
          </>
        ) : (
          <button 
            onClick={() => router.push("/auth/login")}
            style={{ background: '#fff', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
          >
            LOGIN
          </button>
        )}
      </div>
    </header>
  );
}
