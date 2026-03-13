// app/profile/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import AvatarUpload from "./AvatarUpload";

type Collection = {
  id: string;
  name: string;
  item_count?: number | null;
};

type Item = {
  id: string;
  title?: string | null;
  description?: string | null;
  created_at?: string | null;
};

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  const [profile, setProfile] = useState<any>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activity, setActivity] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Local demo gallery
  const [collectionPhotos, setCollectionPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) {
      router.replace("/not-found");
      return;
    }

    async function loadData() {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.id === userId) setIsOwnProfile(true);

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) throw error;
        setProfile(data);

        const [{ data: collectionData }, { data: activityData }] =
          await Promise.all([
            supabase
              .from("collections")
              .select("*")
              .eq("user_id", userId)
              .order("created_at", { ascending: false }),
            supabase
              .from("items")
              .select("*")
              .eq("user_id", userId)
              .order("created_at", { ascending: false }),
          ]);

        setCollections((collectionData as Collection[]) || []);
        setActivity((activityData as Item[]) || []);
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
    () => profile?.display_name || profile?.username || "Collector",
    [profile]
  );

  // ---- Header component that matches your mock exactly ----
  function Header({ avatarUrl }: { avatarUrl?: string | null }) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between gap-4">
              {/* LEFT: brand + subtitle + primary pills */}
              <div className="flex min-w-0 items-center gap-6">
                {/* Brand mark */}
                <div className="flex items-center gap-3">
                  {/* Hard-limit logo to avoid any oversizing */}
                  <img
                    src="/CC-main-logo.png"
                    alt="CollectorConnector"
                    className="h-6 sm:h-7 w-auto object-contain"
                  />
                  <div className="leading-tight">
                    <div className="text-sm font-semibold tracking-wide text-white">
                      COLLECTORCONNECTOR
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      A home for collectors
                    </div>
                  </div>
                </div>

                {/* Primary nav pills (Dashboard / Profile) */}
                <nav className="hidden md:flex items-center gap-2">
                  <HeaderPill href="/dashboard" label="Dashboard" />
                  <HeaderPill href={`/profile/${userId}`} label="Profile" active />
                </nav>
              </div>

              {/* CENTER: rounded group of external links (as in your mock) */}
              <div className="hidden lg:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1">
                <HeaderPill href="#" label="eBay" subtle />
                <HeaderPill href="#" label="PSA" subtle />
                <HeaderPill href="#" label="Goldin" subtle />
                <HeaderPill href="#" label="Whatnot" subtle />
                <HeaderPill href="#" label="Sports Card Investor" subtle />
              </div>

              {/* RIGHT: DEMO + version + avatar */}
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-zinc-300">
                  Demo
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
                  v0.7.4
                </span>

                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="User avatar"
                    className="h-8 w-8 rounded-full object-cover border border-white/15"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-zinc-700/60 border border-white/10" />
                )}
              </div>
            </div>
          </div>
        </header>
        {/* Spacer under fixed header */}
        <div className="h-16 w-full" />
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header avatarUrl={null} />
        <div className="flex items-center justify-center py-20">
          <div className="text-xl">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header avatarUrl={null} />
        <div className="flex flex-col items-center justify-center py-20">
          <h1 className="text-3xl mb-2">Error</h1>
          <p className="text-white/70">{error || "Profile not found"}</p>
        </div>
        <Footer />
      </div>
    );
  }

  const username = profile?.username ? `@${profile.username}` : null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newUrls = files.map((file) => URL.createObjectURL(file));
    setCollectionPhotos((prev) => [...prev, ...newUrls]);
  };
  const clearPhotos = () => setCollectionPhotos([]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      <Header avatarUrl={profile?.avatar_url} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Dashboard header card (kept from your version) */}
        <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-2xl p-6 mb-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-700"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-2xl">
                  👤
                </div>
              )}

              <div>
                <h1 className="text-2xl font-bold">{displayName}</h1>
                <p className="text-gray-400 text-sm mt-1">
                  A calm overview of your world of pieces.
                </p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
                    {profile?.collections_count || 0} COLLECTIONS
                  </span>
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
                    {profile?.items_count || 0} PIECES
                  </span>
                  <span className="bg-purple-900/40 text-purple-300 px-3 py-1 rounded-full text-xs font-medium border border-purple-800/50">
                    PRIVATE
                  </span>
                </div>
              </div>
            </div>

            <button className="bg-red-900/50 hover:bg-red-800/70 text-red-300 px-5 py-2 rounded-lg text-sm transition">
              Log out
            </button>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm mb-2 uppercase tracking-wider">
              Collections
            </h3>
            <div className="text-3xl font-bold mb-1">
              {profile?.collections_count || 0}
            </div>
            <div className="text-sm text-gray-500">Total</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm mb-2 uppercase tracking-wider">
              Pieces
            </h3>
            <div className="text-3xl font-bold mb-1">
              {profile?.items_count || 0}
            </div>
            <div className="text-sm text-gray-500">Total</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 col-span-1 md:col-span-2 lg:col-span-1">
            <h3 className="text-gray-400 text-sm mb-2 uppercase tracking-wider">
              Favourite Piece
            </h3>
            <div className="aspect-square bg-gray-800 rounded-lg mb-3 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-gray-600 text-4xl">
                ?
              </div>
            </div>
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm w-full mb-2">
              Upload photo
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 text-red-400 px-4 py-2 rounded-lg text-sm w-full">
              Remove photo
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 col-span-1 md:col-span-2 lg:grid lg:col-span-1">
            <h3 className="text-gray-400 text-sm mb-2 uppercase tracking-wider">
              Profile Photo
            </h3>
            <div className="aspect-square rounded-full overflow-hidden border-4 border-gray-800 mb-4 mx-auto max-w-[180px]">
              <AvatarUpload
                userId={userId}
                currentUrl={profile?.avatar_url}
                editable={isOwnProfile}
              />
            </div>
          </div>
        </div>

        {/* Collection Photos - multi upload demo */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4">Your Collection Photos</h3>
          <p className="text-gray-400 text-sm mb-6">
            Add photos of your pieces. (This version stores them temporarily in
            browser memory)
          </p>

          <div className="mb-6">
            <label className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-3 rounded-lg cursor-pointer inline-block">
              Choose Files
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = e.target.files
                    ? Array.from(e.target.files)
                    : [];
                  const newUrls = files.map((file) =>
                    URL.createObjectURL(file)
                  );
                  setCollectionPhotos((prev) => [...prev, ...newUrls]);
                }}
                className="hidden"
              />
            </label>
          </div>

          {collectionPhotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
              {collectionPhotos.map((url, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden bg-black border border-gray-800"
                >
                  <img
                    src={url}
                    alt="collection item"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {collectionPhotos.length > 0 && (
            <button
              onClick={() => setCollectionPhotos([])}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              Clear all photos
            </button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ---------------------------
   Header pill component
---------------------------- */
function HeaderPill({
  href,
  label,
  active = false,
  subtle = false,
}: {
  href: string;
  label: string;
  active?: boolean;
  subtle?: boolean; // for the center rounded group
}) {
  const base =
    "rounded-full border px-4 py-1.5 text-sm transition-colors whitespace-nowrap";
  const activeClasses =
    "border-white/20 bg-white/10 text-zinc-100 hover:bg-white/15";
  const normalClasses =
    "border-white/10 bg-transparent text-zinc-200 hover:bg-white/5";
  const subtleClasses =
    "border-white/10 bg-transparent text-zinc-300 hover:bg-white/10";

  const cls = subtle
    ? `${base} ${subtleClasses}`
    : active
    ? `${base} ${activeClasses}`
    : `${base} ${normalClasses}`;

  return (
    <Link href={href} className={cls}>
      {label}
    </Link>
  );
}
