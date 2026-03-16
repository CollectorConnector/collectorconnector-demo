"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";

type Profile = {
  id: string;
  avatar_url?: string | null;
  display_name?: string | null;
  username?: string | null;
  location?: string | null;
  bio?: string | null;
  items_count?: number | null;
  collections_count?: number | null;
};

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      router.replace("/not-found");
      return;
    }

    async function loadData() {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId, router]);

  const displayName = useMemo(
    () => profile?.display_name || profile?.username || "Unnamed Collector",
    [profile]
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <ProfileHeader />

      <main className="px-5 sm:px-8 pt-6 pb-20 max-w-3xl mx-auto">
        {/* Your profile content stays the same */}
      </main>

      <Footer />
    </div>
  );
}

function ProfileHeader() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10">
        <div
          className="
            w-full px-4 sm:px-8 h-14
            grid
            grid-cols-[auto,1fr]
            items-center
            gap-2
          "
        >

          {/* LEFT: LOGO */}
          <div className="flex items-center">
            <img
              src="/CC-main-logo.png"
              alt="Collector Connector"
              style={{ width: "40px", height: "40px", objectFit: "contain" }}
            />
          </div>

          {/* CENTRE: ICONS */}
          <div className="flex items-center justify-center gap-4">

            <a href="https://instagram.com" target="_blank">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm6.5-.75a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z"/>
              </svg>
            </a>

            <a href="https://facebook.com" target="_blank">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12a10 10 0 10-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.3l-.4 3h-1.9v7A10 10 0 0022 12z"/>
              </svg>
            </a>

            <a href="https://ebay.com" target="_blank">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M10.6 13.4a1 1 0 001.4 1.4l5-5a1 1 0 00-1.4-1.4l-5 5z"/>
                <path d="M8 12a4 4 0 016.8-2.8 1 1 0 101.4-1.4A6 6 0 006 12a6 6 0 0010.2 4.2 1 1 0 10-1.4-1.4A4 4 0 018 12z"/>
              </svg>
            </a>

            <a href="https://discord.com" target="_blank">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4a19.8 19.8 0 00-4.9-1.5l-.2.4A14.6 14.6 0 0116.7 5a18.3 18.3 0 00-9.4 0 14.6 14.6 0 011.8-2.1l-.2-.4A19.8 19.8 0 004 4c-1.3 2-2 4.3-2 6.7 0 6.7 4.3 12.3 10 13.3 5.7-1 10-6.6 10-13.3 0-2.4-.7-4.7-2-6.7zM8.5 14.7c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm7 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z"/>
              </svg>
            </a>

            <a href="https://twitter.com" target="_blank">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2l-5.4 6.3L6 2H2l7.3 8.1L2 22h4l5.7-7.1L18 22h4l-7.6-8.6L22 2h-4z"/>
              </svg>
            </a>

            <a href="https://whatnot.com" target="_blank">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M10.6 13.4a1 1 0 001.4 1.4l5-5a1 1 0 00-1.4-1.4l-5 5z"/>
                <path d="M8 12a4 4 0 016.8-2.8 1 1 0 101.4-1.4A6 6 0 006 12a6 6 0 0010.2 4.2 1 1 0 10-1.4-1.4A4 4 0 018 12z"/>
              </svg>
            </a>

          </div>

        </div>
      </header>

      <div className="h-14" />
    </>
  );
}
