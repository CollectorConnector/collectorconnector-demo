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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <ProfileHeader />
        <div className="flex items-center justify-center h-[80vh] text-xl">
          Loading...
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-white">
        <ProfileHeader />
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <h1 className="text-3xl mb-4">Error</h1>
          <p className="text-white/70">{error || "Profile not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ProfileHeader />

      <main className="px-5 sm:px-8 pt-6 pb-20 max-w-3xl mx-auto">

        <div className="text-center mb-7">
          <img
            src={profile.avatar_url || "/default-avatar.png"}
            alt="Avatar"
            className="w-16 h-16 rounded-full mx-auto mb-4 object-cover border border-white/20"
          />

          <h1 className="text-3xl font-bold">{displayName}</h1>

          <p className="text-gray-400 text-base mt-2">
            {profile.bio || "Collector of watches, Pokémon cards, coins & pub history"}
          </p>

          <p className="text-gray-500 text-sm mt-1">
            {profile.location || "Swindon, UK"}
          </p>
        </div>

        <div className="flex justify-between bg-zinc-950 border border-zinc-800 rounded-xl p-5 mb-10">
          <div className="text-center">
            <p className="text-2xl font-bold">{profile.items_count || "2.1k"}</p>
            <p className="text-gray-500 text-sm">Items</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold">{profile.collections_count || "4"}</p>
            <p className="text-gray-500 text-sm">Categories</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold">90.8</p>
            <p className="text-gray-500 text-sm">Rarity</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Collections</h2>

        <div className="flex flex-wrap gap-3 mb-10">
          {["Cards", "Watches", "Coins", "Memorabilia"].map((c) => (
            <div
              key={c}
              className="px-5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm font-medium"
            >
              {c}
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-4">Activity</h2>

        <div className="grid grid-cols-3 gap-3 mb-10">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
            <img
              src="/charizard.png"
              alt="Featured Card"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-white text-black text-xs font-bold px-2 py-0.5 rounded-md">
              Featured
            </div>
          </div>

          <div className="aspect-square rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
            <img src="/watch.png" alt="Watch" className="w-full h-full object-cover" />
          </div>

          <div className="aspect-square rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
            <img src="/coin.png" alt="Coin" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="mb-20">
          <p className="text-gray-500 text-sm mb-1">2 hours ago</p>
          <p className="text-base">
            Just added this one to the collection. What do you think?
          </p>
        </div>

      </main>

      <Footer />
    </div>
  );
}

function ProfileHeader() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10">
        <div className="w-full px-5 sm:px-8 h-14 flex items-center justify-between whitespace-nowrap">

          {/* LEFT: LOGO */}
          <div className="flex items-center mr-4 flex-none">
            <img
              src="/CC-main-logo.png"
              alt="Collector Connector"
              style={{ width: "32px", height: "32px", objectFit: "contain" }}
            />
          </div>

          {/* CENTRE: SOCIAL ICONS */}
          <div className="flex items-center gap-4 flex-none">

            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <svg width="14" height="14" style={{ width: "14px", height: "14px", flexShrink: 0 }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm6.5-.75a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z"/>
              </svg>
            </a>

            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <svg width="14" height="14" style={{ width: "14px", height: "14px", flexShrink: 0 }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12a10 10 0 10-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.3l-.4 3h-1.9v7A10 10 0 0022 12z"/>
              </svg>
            </a>

            <a href="https://ebay.com" target="_blank" rel="noopener noreferrer">
              <svg width="14" height="14" style={{ width: "14px", height: "14px", flexShrink: 0 }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M10.6 13.4a1 1 0 001.4 1.4l5-5a1 1 0 00-1.4-1.4l-5 5z"/>
                <path d="M8 12a4 4 0 016.8-2.8 1 1 0 101.4-1.4A6 6 0 006 12a6 6 0 0010.2 4.2 1 1 0 10-1.4-1.4A4 4 0 018 12z"/>
              </svg>
            </a>

            <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
              <svg width="14" height="14" style={{ width: "14px", height: "14px", flexShrink: 0 }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4a19.8 19.8 0 00-4.9-1.5l-.2.4A14.6 14.6 0 0116.7 5a18.3 18.3 0 00-9.4 0 14.6 14.6 0 011.8-2.1l-.2-.4A19.8 19.8 0 004 4c-1.3 2-2 4.3-2 6.7 0 6.7 4.3 12.3 10 13.3 5.7-1 10-6.6 10-13.3 0-2.4-.7-4.7-2-6.7zM8.5 14.7c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm7 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z"/>
              </svg>
            </a>

            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <svg width="14" height="14" style={{ width: "14px", height: "14px", flexShrink: 0 }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2l-5.4 6.3L6 2H2l7.3 8.1L2 22h4l5.7-7.1L18 22h4l-7.6-8.6L22 2h-4z"/>
              </svg>
            </a>

            <a href="https://whatnot.com" target="_blank" rel="noopener noreferrer">
              <svg width="14" height="14" style={{ width: "14px", height: "14px", flexShrink: 0 }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M10.6 13.4a1 1 0 001.4 1.4l5-5a1 1 0 00-1.4-1.4l-5 5z"/>
                <path d="M8 12a4 4 0 016.8-2.8 1 1 0 101.4-1.4A6 6 0 006 12a6 6 0 0010.2 4.2 1 1 0 10-1.4-1.4A4 4 0 018 12z"/>
              </svg>
            </a>

          </div>

          {/* RIGHT: SEARCH */}
          <form
            onSubmit={handleSearch}
            className="flex items-center ml-4 flex-none"
            style={{ width: "150px" }}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-zinc-900 border border-zinc-700 text-sm text-white px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </form>

        </div>
      </header>

      <div className="h-14" />
    </>
  );
}
