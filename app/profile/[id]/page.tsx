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

type Collection = {
  id: string;
  user_id: string;
  title: string;
  niche?: string | null;
  cover_url?: string | null;
  item_count?: number | null;
};

type Item = {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  created_at: string;
  estimated_value?: number | null;
  collection_id?: string | null;
};

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [items, setItems] = useState<Item[]>([]);
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
        setError(null);

        const [
          { data: profileData, error: profileError },
          { data: collectionsData, error: collectionsError },
          { data: itemsData, error: itemsError },
        ] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", userId).single(),
          supabase
            .from("collections")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false }),
          supabase
            .from("items")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(3),
        ]);

        if (profileError || !profileData) {
          throw profileError || new Error("Profile not found");
        }

        if (collectionsError) throw collectionsError;
        if (itemsError) throw itemsError;

        setProfile(profileData as Profile);
        setCollections((collectionsData || []) as Collection[]);
        setItems((itemsData || []) as Item[]);
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

  const itemsCount = useMemo(
    () => profile?.items_count ?? items.length ?? 0,
    [profile, items]
  );

  const collectionsCount = useMemo(
    () => profile?.collections_count ?? collections.length ?? 0,
    [profile, collections]
  );

  const latestItem = items[0] || null;

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

      {/* OUTER CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        {/* INNER COLUMN */}
        <div className="max-w-2xl mx-auto">

          {/* AVATAR + NAME + BIO */}
          <div className="text-center mb-7">
            <div className="w-28 h-28 rounded-full overflow-hidden border border-white/20 mx-auto mb-4">
              <img
                src={profile.avatar_url || "/default-avatar.png"}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>

            <h1 className="text-3xl font-bold">{displayName}</h1>

            <p className="text-gray-400 text-base mt-2">
              {profile.bio || "Collector of watches, Pokémon cards, coins & pub history"}
            </p>

            <p className="text-gray-500 text-sm mt-1">
              {profile.location || "Unknown Location"}
            </p>
          </div>

          {/* STATS */}
          <div className="flex justify-between bg-zinc-950 border border-zinc-800 rounded-xl p-5 mb-10">
            <div className="text-center">
              <p className="text-2xl font-bold">{itemsCount}</p>
              <p className="text-gray-500 text-sm">Items</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold">{collectionsCount}</p>
              <p className="text-gray-500 text-sm">Collections</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold">90.8</p>
              <p className="text-gray-500 text-sm">Rarity</p>
            </div>
          </div>

          {/* COLLECTION TAGS */}
          <h2 className="text-2xl font-bold mb-4">Collections</h2>

          <div className="flex flex-wrap gap-3 mb-10">
            {collections.length > 0 ? (
              collections.map((c) => (
                <div
                  key={c.id}
                  className="px-5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm font-medium"
                >
                  {c.title}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No collections yet</p>
            )}
          </div>

          {/* ACTIVITY GRID */}
          <h2 className="text-2xl font-bold mb-4">Activity</h2>

          {items.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 mb-10">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-square rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800"
                >
                  <img
                    src={item.image_url || "/placeholder.png"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-10">
              No recent items yet.
            </p>
          )}

          {/* LATEST ACTIVITY TEXT */}
          <div className="mb-20">
            {latestItem ? (
              <>
                <p className="text-gray-500 text-sm mb-1">
                  {new Date(latestItem.created_at).toLocaleString()}
                </p>
                <p className="text-base">
                  {latestItem.description ||
                    `Added "${latestItem.title}" to the collection.`}
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-500 text-sm mb-1">No recent activity</p>
                <p className="text-base">
                  When you add items, your latest activity will appear here.
                </p>
              </>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

function ProfileHeader() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .ilike("username", `%${query}%`);

      if (!error) setResults(data || []);
    }, 250);

    return () => clearTimeout(delay);
  }, [query]);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "#000",
          borderBottom: "1px solid #1f1f1f",
          height: 56,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 16,
        }}
      >
        {/* LOGO (home button) */}
        <a href="/">
          <img
            src="/CC-main-logo.png"
            alt="Collector Connector"
            width={140}
            height={140}
            style={{ objectFit: "contain", cursor: "pointer" }}
          />
        </a>

        {/* SEARCH BAR */}
        <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            style={{
              width: "100%",
              padding: "6px 10px",
              borderRadius: 8,
              background: "#111",
              border: "1px solid #333",
              color: "white",
              fontSize: 14,
            }}
          />

          {/* RESULTS DROPDOWN */}
          {showResults && results.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: 40,
                left: 0,
                right: 0,
                background: "#0d0d0d",
                border: "1px solid #333",
                borderRadius: 8,
                padding: 8,
                zIndex: 100,
              }}
            >
              {results.map((user) => (
                <a
                  key={user.id}
                  href={`/profile/${user.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 8px",
                    borderRadius: 6,
                    textDecoration: "none",
                    color: "white",
                  }}
                  onClick={() => setShowResults(false)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <img
                    src={user.avatar_url || "/default-avatar.png"}
                    alt=""
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                  <span style={{ fontSize: 14 }}>
                    {user.display_name || user.username}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* SOCIAL ICONS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "white",
          }}
        >
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm6.5-.75a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z"/>
            </svg>
          </a>

          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12a10 10 0 10-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.3l-.4 3h-1.9v7A10 10 0 0022 12z"/>
            </svg>
          </a>

          <a href="https://ebay.com" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10.6 13.4a1 1 0 001.4 1.4l5-5a1 1 0 00-1.4-1.4l-5 5z"/>
              <path d="M8 12a4 4 0 016.8-2.8 1 1 0 101.4-1.4A6 6 0 006 12a6 6 0 0010.2 4.2 1 1 0 10-1.4-1.4A4 4 0 018 12z"/>
            </svg>
          </a>

          <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4a19.8 19.8 0 00-4.9-1.5l-.2.4A14.6 14.6 0 0116.7 5a18.3 18.3 0 00-9.4 0 14.6 14.6 0 011.8-2.1l-.2-.4A19.8 19.8 0 004 4c-1.3 2-2 4.3-2 6.7 0 6.7 4.3 12.3 10 13.3 5.7-1 10-6.6 10-13.3 0-2.4-.7-4.7-2-6.7zM8.5 14.7c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm7 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z"/>
            </svg>
          </a>

          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 2l-5.4 6.3L6 2H2l7.3 8.1L2 22h4l5.7-7.1L18 22h4l-7.6-8.6L22 2h-4z"/>
            </svg>
          </a>
        </div>
      </header>

      <div style={{ height: 56 }} />
    </>
  );
}
