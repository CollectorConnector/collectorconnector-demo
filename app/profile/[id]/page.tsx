"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import AvatarUpload from "./AvatarUpload";

/* TYPES */
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

/* PAGE */
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

        const { data: pData, error: pErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (pErr) throw pErr;

        const { data: cData } = await supabase
          .from("collections")
          .select("id,title")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        setProfile(pData as Profile);
        setCollections((cData as Collection[]) || []);
      } catch (e: any) {
        setError(e.message || "Failed to load profile");
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
        <main className="max-w-6xl mx-auto px-6 pt-20">
          <div className="text-center text-zinc-400">Loading…</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-white">
        <main className="max-w-6xl mx-auto px-6 pt-20">
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

  const pillTitles =
    collections.length > 0
      ? collections.slice(0, 4).map((c) => c.title)
      : ["Sports Cards", "TCG Cards", "Comic Books", "Sneakers"];

  return (
    <div className="min-h-screen bg-black text-white pb-24 font-sans">

      {/* NO HEADER AT ALL */}

      <main className="max-w-6xl mx-auto px-6">

        {/* AVATAR BLOCK */}
        <section className="pt-10 text-center">
          <div className="relative inline-block">
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

            <div className="absolute -top-3 -left-6 -rotate-12 select-none">
              <div className="border border-white/30 text-[11px] text-zinc-300 px-3 py-1 bg-black rounded">
                Avatar (Profile Pic)
              </div>
            </div>

            <div className="absolute -right-3 bottom-2 h-8 w-8 rounded-full border border-white/40 bg-black flex items-center justify-center text-xs">
              CC
            </div>
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight">{displayName}</h1>

          <p className="text-zinc-400 text-sm mt-2">
            Collector Connector 1 • {location}
          </p>

          <p className="text-zinc-400 text-sm mt-2 max-w-2xl mx-auto leading-relaxed">
            {bio}
          </p>

          {!isOwnProfile && (
            <button className="mt-6 px-10 py-3 border border-white/40 rounded-md text-sm hover:bg-white/5">
              Follow
            </button>
          )}

          <div className="mt-8 h-px w-64 mx-auto bg-white/30" />
        </section>

        {/* PILLS */}
        <section className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {pillTitles.map((t, i) => (
            <div
              key={i}
              className="px-6 py-2 border border-white/40 rounded-md text-sm"
            >
              {t}
            </div>
          ))}
        </section>

        {/* COLLECTIONS GALLERY */}
        <section className="mt-14">
          <h2 className="text-xl font-semibold text-center mb-6">
            Collections Gallery
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* LEFT */}
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

            {/* CENTER CC BOX */}
            <div className="border border-white/30 rounded-lg p-5 flex items-center justify-center">
              <div className="text-6xl tracking-tight">CC</div>
            </div>

            {/* RIGHT */}
            <div className="border border-white/30 rounded-lg p-5">
              <h3 className="font-medium mb-2">News + Upcoming Events</h3>
              <p className="text-sm text-zinc-300">
                New feature launch coming soon… <br />
                Community meetup – London – April 2026
              </p>
            </div>
          </div>
        </section>

        {/* LIVE FEED */}
        <section className="mt-16">
          <div className="border border-white/30 rounded-lg p-6 max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Live Feed</h2>

            <div className="flex items-start gap-4">
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
