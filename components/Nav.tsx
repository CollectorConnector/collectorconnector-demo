"use client";

import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function Nav() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadAvatar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();

      setAvatarUrl(data?.avatar_url || null);
    }

    loadAvatar();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-8">

        {/* LEFT: Main Logo */}
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <Image
            src="/CC-main-logo.png"
            alt="CollectorConnector"
            width={180}
            height={40}
            priority
            className="w-auto h-8 object-contain select-none"
          />
        </Link>

        {/* MIDDLE: Social Icons */}
        <div className="hidden sm:flex items-center gap-4 text-zinc-400">
          <Link href="https://instagram.com" target="_blank">IG</Link>
          <Link href="https://facebook.com" target="_blank">FB</Link>
          <Link href="https://discord.com" target="_blank">DS</Link>
          <Link href="https://x.com" target="_blank">X</Link>
        </div>

        {/* RIGHT: Avatar */}
        <div className="flex items-center">
          {avatarUrl ? (
            <div className="h-9 w-9 rounded-[12px] overflow-hidden border border-white/20">
              <img
                src={avatarUrl}
                alt="User"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-9 w-9 rounded-[12px] bg-zinc-700 border border-white/20" />
          )}
        </div>

      </div>
    </header>
  );
}
