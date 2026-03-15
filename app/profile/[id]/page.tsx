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
  name: string;
  // add more fields later (description, cover_image_url, etc.)
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

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;

        const { data: collectionData, error: collError } = await supabase
          .from("collections")
          .select("id, name")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (collError) throw collError;

        setProfile(profileData);
        setCollections(collectionData || []);
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
        {/* Profile header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-3">
            <h1 className="text-3xl md:text-4xl font-bold">{displayName}</h1>
            <img src="/gold.png" alt="Gold Badge" className="h-8 w-8 object-contain" />
          </div>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {profile.bio ||
              "Collector Connector CEO, Collects Cards, Comics, Sneakers, Beanie Babies & Coca-Cola"}
          </p>

          <p className="text-gray-500 text-sm mt-2">
            {profile.location || "Swindon, UK"}
          </p>
        </div>

        {/* Follow button (only show if NOT own profile) */}
        {!isOwnProfile && (
          <div className="flex justify-center mb-8">
            <button className="px-8 py-3 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition">
              Follow
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <div className="bg-zinc-950 border border-zinc-800 rounded-full px-6 py-3 text-center min-w-[120px]">
            <div className="text-2xl font-bold">{profile.items_count || 0}</div>
            <div className="text-gray-500 text-sm">Items</div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-full px-6 py-3 text-center min-w-[120px]">
            <div className="text-2xl font-bold">{profile.collections_count || collections.length}</div>
            <div className="text-gray-500 text-sm">Collections</div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-full px-6 py-3 text-center min-w-[120px]">
            <div className="text-2xl font-bold">90.8</div>
            <div className="text-gray-500 text-sm">Rarity</div>
          </div>
        </div>

        {/* Collections pills */}
        <h2 className="text-2xl font-bold mb-4 text-center sm:text-left">Collections</h2>
        <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-12">
          {collections.length > 0 ? (
            collections.map((col) => (
              <div
                key={col.id}
                className="px-5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm font-medium"
              >
                {col.name}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No collections yet.</p>
          )}

          {/* Create button – only for owner */}
          {isOwnProfile && (
            <Link
              href="/create-collection" // ← create this page next
              className="px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm font-medium hover:bg-white/20 transition flex items-center gap-2"
            >
              + New Collection
            </Link>
          )}
        </div>

        {/* Collections Gallery */}
        <h2 className="text-2xl font-bold mb-6 text-center sm:text-left">
          Collections Gallery
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Niche Families */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Niche Families</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>1,500 - Sports Cards</li>
              <li>1,321 - TCG Cards</li>
              <li>1,525 - Comics</li>
              <li>1,778 - Sneakers</li>
              <li>1,776 - Beanie Babies</li>
              <li>1,323 - Beanie Babies</li>
            </ul>
          </div>

          {/* CC Logo placeholder */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 flex items-center justify-center">
            <div className="text-6xl font-black text-zinc-700">CC</div>
          </div>

          {/* News / Events placeholder */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">News + Upcoming Events</h3>
            <p className="text-gray-400 text-sm">
              New feature launch coming soon...
              <br />
              Community meetup – London – April 2026
            </p>
          </div>
        </div>

        {/* Live Feed */}
        <h2 className="text-2xl font-bold mb-6 text-center sm:text-left">Live Feed</h2>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center text-xl font-bold text-zinc-400">
              RC
            </div>
            <div>
              <p className="font-medium">Richard House</p>
              <p className="text-gray-400 text-sm">New upload</p>
              <div className="mt-2 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
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

// Full-width header – no avatar as requested
function Header() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="w-full px-5 sm:px-8 h-14 flex items-center justify-between">
          {/* Left – logo + tagline */}
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
                where collectors meet
              </div>
            </div>
          </Link>

          {/* Center – search bar (placeholder) */}
          <div className="hidden md:flex flex-1 justify-center max-w-md">
            <div className="w-full max-w-xs bg-zinc-900 border border-zinc-700 rounded-full px-4 py-2 text-sm text-zinc-400">
              Search collections, users...
            </div>
          </div>

          {/* Right – social icons */}
          <div className="flex items-center gap-4 text-zinc-400">
            <a href="#" target="_blank" aria-label="Instagram">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                {/* Instagram SVG path */}
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.326 3.608 1.301.975.975 1.24 2.242 1.301 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.069 4.85c-.062 1.366-.326 2.633-1.301 3.608-.975.975-2.242 1.24-3.608 1.301-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.069c-1.366-.062-2.633-.326-3.608-1.301-.975-.975-1.24-2.242-1.301-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.069-4.85c.062-1.366.326-2.633 1.301-3.608C5.367 2.489 6.634 2.225 8 2.163 8.416 2.175 8.796 2.163 12 2.163z" />
              </svg>
            </a>
            <a href="#" target="_blank" aria-label="Facebook">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                {/* Facebook SVG path */}
                <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.234 2.686.234v2.953h-1.516c-1.492 0-1.957.925-1.957 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 22.954 24 17.99 24 12z" />
              </svg>
            </a>
            <a href="#" target="_blank" aria-label="Discord">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                {/* Discord SVG path */}
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3853-.3969-.8748-.6083-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8851 1.515.0699.0699 0 00-.032.0277C.5336 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0775.0105c.1202.099.246.1981.372.2914a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6061 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
            </a>
            <a href="#" target="_blank" aria-label="X">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" target="_blank" aria-label="Whatnot">
              <span className="text-sm font-medium">whatnot</span>
            </a>
          </div>
        </div>
      </header>

      <div className="h-14" />
    </>
  );
}
