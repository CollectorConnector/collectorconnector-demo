"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer"; // ← kept your existing Footer
import { supabase } from "@/lib/supabase";
import AvatarUpload from "./AvatarUpload";

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
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    if (!userId) {
      router.replace("/not-found");
      return;
    }

    async function loadData() {
      try {
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id === userId) setIsOwnProfile(true);

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err: any) {
        console.error(err);
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
        <Header />
        <div className="flex items-center justify-center h-[80vh] text-xl">
          Loading...
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <h1 className="text-3xl mb-4">Error</h1>
          <p className="text-white/70">{error || "Profile not found"}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="px-5 sm:px-8 pt-6 pb-20">
        {/* HEADER: NAME + BADGE */}
        <div className="text-center mb-7">
          <div className="flex justify-center items-center gap-2.5 mb-2">
            <h1 className="text-3xl font-bold m-0">{displayName}</h1>

            {/* Gold badge example */}
            <img
              src="/gold.png"
              alt="Gold Badge"
              className="h-7 w-7 object-contain"
            />
          </div>

          <p className="text-gray-400 text-base">
            {profile.bio || "Collector of watches, Pokémon cards, coins & pub history"}
          </p>

          <p className="text-gray-500 text-sm mt-1">
            {profile.location || "Swindon, UK"}
          </p>
        </div>

        {/* STATS */}
        <div className="flex justify-between bg-zinc-950 border border-zinc-800 rounded-xl p-5 mb-10">
          <div className="text-center">
            <p className="text-2xl font-bold m-0">{profile.items_count || "2.1k"}</p>
            <p className="text-gray-500 text-sm">Items</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold m-0">{profile.collections_count || "4"}</p>
            <p className="text-gray-500 text-sm">Categories</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold m-0">90.8</p>
            <p className="text-gray-500 text-sm">Rarity</p>
          </div>
        </div>

        {/* COLLECTIONS */}
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

        {/* ACTIVITY / GALLERY */}
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

        {/* POST EXAMPLE */}
        <div className="mb-20">
          <p className="text-gray-500 text-sm mb-1">2 hours ago</p>
          <p className="text-base">
            Just added this one to the collection. What do you think
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ───────────────────────────────────────────────
//  Full-width header (as requested)
// ───────────────────────────────────────────────
function Header() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="w-full px-5 sm:px-8 h-14 flex items-center justify-between">
          {/* Logo left */}
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/CC-main-logo.png"
              alt="CollectorConnector"
              className="h-7 w-auto object-contain"
            />
            <div className="hidden sm:block leading-tight">
              <div className="text-base font-semibold tracking-tight text-white">
                COLLECTORCONNECTOR
              </div>
              <div className="text-xs text-zinc-500">
                A home for collectors
              </div>
            </div>
          </Link>

          {/* Right: small avatar (12x12 as requested) */}
          <div className="h-3 w-3 rounded-full overflow-hidden bg-zinc-700 border border-white/20">
            {/* You can replace with real avatar from profile later */}
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-14" />
    </>
  );
}
