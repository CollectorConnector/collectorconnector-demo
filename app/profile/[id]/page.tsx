"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";
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

type Collection = {
  id: string;
  title: string;
};

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
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

        const { data: profileData, error: pErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (pErr) throw pErr;

        const { data: collData } = await supabase
          .from("collections")
          .select("id, title") // ← fixed: using your actual column "title"
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        setProfile(profileData);
        setCollections(collData || []);
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
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />

      <main className="px-5 sm:px-8 pt-6 pb-20 max-w-6xl mx-auto">
        {/* Profile header */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-4">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden border-4 border-zinc-800 shadow-2xl mx-auto">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-4xl text-zinc-600">
                  {displayName.charAt(0)}
                </div>
              )}
            </div>

            {/* Diagonal "Avatar (Profile Pic)" text */}
            <div className="absolute -top-2 -right-6 rotate-12 bg-zinc-900 border border-zinc-700 text-xs px-3 py-1 rounded-md text-zinc-400">
              Avatar (Profile Pic)
            </div>

            {/* CC badge */}
            <div className="absolute bottom-2 right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold border-2 border-zinc-700">
              CC
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-2">{displayName}</h1>

          <p className="text-zinc-400 text-lg mb-1">
            Collector Connector 1 • {profile.location || "Swindon, UK"}
          </p>

          <p className="text-zinc-400 max-w-3xl mx-auto">
            {profile.bio || "Collector Connector CEO, Collects Cards, Comics, Sneakers, Beanie Babies & Coca-Cola"}
          </p>

          {!isOwnProfile && (
            <button className="mt-6 px-10 py-3 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition">
              Follow
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <div className="bg-zinc-950 border border-zinc-800 rounded-full px-8 py-4 text-center min-w-[140px]">
            <div className="text-3xl font-bold">{profile.items_count || 0}</div>
            <div className="text-zinc-500 text-sm">Items</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-full px-8 py-4 text-center min-w-[140px]">
            <div className="text-3xl font-bold">{collections.length}</div>
            <div className="text-zinc-500 text-sm">Collections</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-full px-8 py-4 text-center min-w-[140px]">
            <div className="text-3xl font-bold">90.8</div>
            <div className="text-zinc-500 text-sm">Rarity</div>
          </div>
        </div>

        {/* Collections pills – now dynamic from your Supabase table */}
        <h2 className="text-2xl font-bold mb-4 text-center">Collections</h2>
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {collections.length > 0 ? (
            collections.map((col) => (
              <div
                key={col.id}
                className="px-6 py-3 bg-zinc-950 border border-zinc-800 rounded-full text-sm font-medium hover:bg-zinc-900 transition"
              >
                {col.title}
              </div>
            ))
          ) : (
            <p className="text-zinc-500">No collections yet</p>
          )}

          {isOwnProfile && (
            <Link
              href="/create-collection"
              className="px-6 py-3 bg-white/10 border border-white/20 rounded-full text-sm font-medium hover:bg-white/15 transition flex items-center gap-2"
            >
              + Create Collection
            </Link>
          )}
        </div>

        {/* Collections Gallery */}
        <h2 className="text-2xl font-bold mb-6 text-center">Collections Gallery</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Niche Families</h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li>1,500 - Sports Cards</li>
              <li>1,321 - TCG Cards</li>
              <li>1,525 - Comics</li>
              <li>1,778 - Sneakers</li>
              <li>1,776 - Beanie Babies</li>
              <li>1,323 - Beanie Babies</li>
            </ul>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 flex items-center justify-center">
            <div className="text-7xl font-black text-zinc-700">CC</div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">News + Upcoming Events</h3>
            <p className="text-zinc-400 text-sm">
              New feature launch coming soon...<br />
              Community meetup – London – April 2026
            </p>
          </div>
        </div>

        {/* Live Feed */}
        <h2 className="text-2xl font-bold mt-16 mb-6 text-center">Live Feed</h2>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 max-w-3xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-2xl text-zinc-500">
              RC
            </div>
            <div>
              <p className="font-medium text-lg">Richard House</p>
              <p className="text-zinc-500 text-sm">New upload</p>
              <div className="mt-3 p-4 bg-black rounded-lg border border-zinc-800">
                (RH) - New Rare Card: Shohei Ohtani Rookie
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Full-width header – matches your mock
function Header() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="w-full px-5 sm:px-8 h-14 flex items-center justify-between">
          {/* Left – logo + tagline */}
          <div className="flex items-center gap-4">
            <img src="/CC-main-logo.png" alt="Collector Connector" className="h-7 w-auto object-contain" />
            <div className="hidden sm:block text-sm text-gray-400">
              where collectors meet
            </div>
          </div>

          {/* Center – search bar */}
          <div className="hidden md:flex flex-1 justify-center max-w-xl">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-full px-5 py-2 text-sm text-zinc-400">
              Search collections, users...
            </div>
          </div>

          {/* Right – social icons */}
          <div className="flex items-center gap-5 text-zinc-400">
            <a href="#" aria-label="Instagram">insta</a>
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="Discord">Disord</a>
            <a href="#" aria-label="X">X</a>
            <a href="#" aria-label="Whatnot">whatnot</a>
          </div>
        </div>
      </header>

      <div className="h-14" />
    </>
  );
}
