// app/profile/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import AvatarUpload from "./AvatarUpload";

/* -------------------------------------------------------
   Types
------------------------------------------------------- */
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

/* -------------------------------------------------------
   Page
------------------------------------------------------- */
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

        // Ownership
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id === userId) setIsOwnProfile(true);

        // Profile
        const { data: pData, error: pErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        if (pErr) throw pErr;

        // Collections (for pills)
        const { data: cData } = await supabase
          .from("collections")
          .select("id, title")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        setProfile(pData as Profile);
        setCollections((cData as Collection[]) || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId, router]);

  const displayName = useMemo(
    () => profile?.display_name || profile?.username || "Collector",
    [profile]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <HeaderBar />
        <main className="max-w-6xl mx-auto px-6 pt-10">
          <div className="text-center text-zinc-400">Loading…</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-white">
        <HeaderBar />
        <main className="max-w-6xl mx-auto px-6 pt-10">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile not found</h1>
            <p className="text-zinc-500 mt-2">{error || "This profile could not be loaded."}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const location = profile.location || "Swindon, UK";
  const bio =
    profile.bio ||
    "Collector Connector CEO, Collects Cards, Comics, Sneakers, Beanie Babies & Coca-Cola";

  // Top 4 collections for pills (fallbacks if none)
  const pillTitles =
    (collections.length ? collections.slice(0, 4).map((c) => c.title) : [])
      || ["Sports Cards", "TCG Cards", "Comic Books", "Sneakers"];

  return (
    <div className="min-h-screen bg-black text-white">
      <HeaderBar />

      <main className="max-w-6xl mx-auto px-6 pb-24">
        {/* Avatar + Name block */}
        <section className="pt-14 text-center">
          <div className="relative inline-block">
            {/* Avatar frame */}
            <div className="w-40 h-40 rounded-lg border border-white/30 mx-auto overflow-hidden bg-zinc-900">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-5xl text-zinc-600">
                  {displayName.charAt(0)}
                </div>
              )}
            </div>

            {/* Diagonal label */}
            <div className="absolute -top-3 -left-6 -rotate-12 select-none">
              <div className="border border-white/30 text-[11px] text-zinc-300 px-3 py-1 bg-black rounded">
                Avatar (Profile Pic)
              </div>
            </div>

            {/* CC badge */}
            <div className="absolute -right-3 bottom-2 h-8 w-8 rounded-full border border-white/40 bg-black flex items-center justify-center text-xs">
              CC
            </div>
          </div>

          {/* Identity */}
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">{displayName}</h1>
          <div className="mt-1 text-sm text-zinc-400">Collector Connector 1</div>
          <div className="mt-1 text-sm text-zinc-400">{location}</div>
          <div className="mt-3 text-sm text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Bio: {bio}
          </div>

          {/* Follow */}
          {!isOwnProfile && (
            <button
              type="button"
              className="mt-6 inline-flex items-center justify-center border border-white/40 rounded-md px-4 py-2 text-sm hover:bg-white/5"
            >
              Follow
            </button>
          )}

          {/* Divider */}
          <div className="mt-8 h-px w-64 mx-auto bg-white/30" />
        </section>

        {/* Pills row */}
        <section className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {(pillTitles.length ? pillTitles : ["Sports Cards", "TCG Cards", "Comic Books", "Sneakers"]).map(
            (t, i) => (
              <span
                key={`${t}-${i}`}
                className="inline-flex items-center border border-white/40 rounded-md px-4 py-2 text-sm"
              >
                {t}
              </span>
            )
          )}
        </section>

        {/* Collections Gallery */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-center mb-5">Collections Gallery</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Niche families */}
            <div className="border border-white/30 rounded-lg p-5">
              <h3 className="font-medium mb-3">Niche Families</h3>
              <ul className="text-sm text-zinc-300 space-y-1">
                <li>1,500 – Sports Cards</li>
                <li>1,321 – TCG Cards</li>
                <li>1,525 – Comics</li>
                <li>1,778 – Sneakers</li>
                <li>1,323 – Beanie Babies</li>
              </ul>
            </div>

            {/* CC tile */}
            <div className="border border-white/30 rounded-lg p-5 flex items-center justify-center">
              <div className="text-6xl tracking-tight">CC</div>
            </div>

            {/* News */}
            <div className="border border-white/30 rounded-lg p-5">
              <h3 className="font-medium mb-2">News + Upcoming Events</h3>
              <p className="text-sm text-zinc-300">
                New feature launch coming soon… <br />
                Community meetup – London – April 2026
              </p>
            </div>
          </div>
        </section>

        {/* Live Feed */}
        <section className="mt-12">
          <div className="border border-white/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Live Feed</h2>

            <div className="flex items-start gap-4">
              {/* initials circle */}
              <div className="h-12 w-12 rounded-full border border-white/30 flex items-center justify-center text-sm">
                RC
              </div>

              <div className="flex-1">
                <p className="font-medium">Richard House</p>
                <p className="text-xs text-zinc-500">New upload</p>

                <div className="mt-3 inline-block border border-white/40 rounded-md px-3 py-2 text-sm bg-black">
                  (RH) – New Rare Card <br />
                  Shohei Ohtani Rookie
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* -------------------------------------------------------
   HeaderBar — NO AVATAR, NO LOGO. Full-width desktop bar.
   Left: brand text, Center: search stub, Right: socials.
------------------------------------------------------- */
function HeaderBar() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/15">
        <div className="w-full h-12 flex items-center justify-between px-4">
          {/* Left: brand text */}
          <div className="leading-tight select-none">
            <div className="text-[13px] font-semibold tracking-wide">Collector Connector</div>
            <div className="text-[10px] text-zinc-500 -mt-0.5">where collectors meet</div>
          </div>

          {/* Center: search stub */}
          <div className="flex-1 max-w-md mx-4">
            <div className="w-full h-8 rounded-md border border-white/20 px-3 text-[13px] flex items-center text-zinc-400 select-none">
              search bar
            </div>
          </div>

          {/* Right: socials */}
          <nav className="flex items-center gap-3 text-[13px]">
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white">insta</a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white">Discord</a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white">X</a>
            <a href="https://www.whatnot.com" target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white">whatnot</a>
          </nav>
        </div>
      </header>
      {/* spacer to offset fixed header height */}
      <div className="h-12" />
    </>
  );
}
