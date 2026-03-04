
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NavSessionLink() {
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });

    // Keep it in sync
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

    // Small placeholder to avoid layout shift
  if (hasSession === null) {
    return <span style={{ color: "#9CA3AF" }}>…</span>;
  }

  return hasSession ? (
    <a
      href="/account"
      style={{ color: "#4ADE80", textDecoration: "none", fontWeight: 600 }}
    >
      Account
    </a>
  ) : (
    <a
      href="/auth/login"
      style={{ color: "#4ADE80", textDecoration: "none", fontWeight: 600 }}
    >
      Login
    </a>
  );
}
