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

        {/* LEFT GROUP: Logo + Social Icons */}
        <div className="flex items-center gap-6">

          {/* Logo */}
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

          {/* Social Icons */}
          <div className="flex items-center gap-4 text-zinc-300">

            {/* Instagram */}
            <Link href="https://instagram.com" target="_blank" aria-label="Instagram">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="14" height="14" rx="4" />
                <circle cx="9" cy="9" r="3" />
                <circle cx="13" cy="5" r="1" fill="currentColor" />
              </svg>
            </Link>

            {/* Facebook */}
            <Link href="https://facebook.com" target="_blank" aria-label="Facebook">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 6h2V3h-2c-2 0-3 1-3 3v2H5v3h2v6h3v-6h2.2l.3-3H10V6z" />
              </svg>
            </Link>

            {/* Discord */}
            <Link href="https://discord.com" target="_blank" aria-label="Discord">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 5c2-1 4-1 6 0l1 2c1 0 2 1 2 2v3c0 1-1 2-2 2-2 1-4 1-6 0-1 0-2-1-2-2V9c0-1 1-2 2-2l1-2z" />
                <circle cx="7.5" cy="10" r="1" fill="currentColor" />
                <circle cx="10.5" cy="10" r="1" fill="currentColor" />
              </svg>
            </Link>

            {/* X */}
            <Link href="https://x.com" target="_blank" aria-label="X">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 3l12 12M15 3L3 15" />
              </svg>
            </Link>

            {/* eBay */}
            <Link href="https://ebay.com" target="_blank" aria-label="eBay">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M3 10c0-3 2-5 5-5 2 0 3 .8 4 2l-1.5.8c-.5-.8-1.2-1.3-2.5-1.3-2 0-3.5 1.6-3.5 3.5s1.5 3.5 3.5 3.5c1.3 0 2-.5 2.5-1.3l1.5.8c-1 1.2-2 2-4 2-3 0-5-2-5-5z" />
                <path d="M12 7h2v6h-2z" />
                <path d="M14 10c0-2 1.5-3 3-3s3 1 3 3v3h-2v-3c0-.8-.5-1.5-1.5-1.5S15 9.2 15 10v3h-2v-3z" />
              </svg>
            </Link>

          </div>
        </div>

        {/* RIGHT: Avatar */}
        <div className="flex items-center">
          {avatarUrl ? (
            <div className="h-7 w-7 rounded-[10px] overflow-hidden border border-white/20">
              <img
                src={avatarUrl}
                alt="User"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-7 w-7 rounded-[10px] bg-zinc-700 border border-white/20" />
          )}
        </div>

      </div>
    </header>
  );
}
