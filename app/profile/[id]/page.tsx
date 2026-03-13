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

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
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

  const username = profile?.username ? `@${profile.username}` : null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newUrls = Array.from(e.target.files).map((f) =>
      URL.createObjectURL(f)
    );
    setCollectionPhotos((prev) => [...prev, ...newUrls]);
  };

  const clearPhotos = () => setCollectionPhotos([]);

  // ++++++++++++++++++++++++++++++++++++++++++++++++++
  // HEADER — NO LOGO — FULL WIDTH — DESKTOP ONLY
  // ++++++++++++++++++++++++++++++++++++++++++++++++++
  const Header = () => (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="w-full px-10">
          <div className="flex h-16 items-center justify-between gap-10">

            {/* LEFT BRAND + SUBTITLE + DASHBOARD/PROFILE */}
            <div className="flex items-center gap-10">
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-wide text-white">
                  COLLECTORCONNECTOR
                </div>
                <div className="text-[11px] text-zinc-500">
                  A home for collectors
                </div>
              </div>

              <nav className="flex items-center gap-3">
                /dashboard
                <HeaderPill href={`/profile/${userId}`} label="Profile" active />
              </nav>
            </div>

            {/* MIDDLE: External links group */}
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              #
              #
              #
              #
              #
            </div>

            {/* RIGHT: AVATAR ONLY */}
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full overflow-hidden border border-white/20">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="User"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Spacer under fixed header */}
      <div className="h-16" />
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <div className="flex items-center justify-center h-[70vh] text-xl">
          Loading...
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <h1 className="text-3xl mb-4">Error</h1>
          <p className="text-white/70">{error || "Profile not found"}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      <Header />

      <main className="w-full px-10 pt-8 max-w-7xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-2xl p-6 mb-10 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex items-center gap-5">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-700 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-3xl shadow-md">
                  👤
                </div>
              )}

              <div>
                <h1 className="text-3xl font-bold">{displayName}</h1>
                {profile.location && (
                  <p className="text-gray-400 text-sm mt-1">{profile.location}</p>
                )}

                <div className="flex flex-wrap gap-3 mt-4">
                  <span className="bg-gray-800 text-gray-300 px-4 py-1.5 rounded-full text-sm font-medium border border-gray-700">
                    {profile.collections_count || 0} COLLECTIONS
                  </span>
                  <span className="bg-gray-800 text-gray-300 px-4 py-1.5 rounded-full text-sm font-medium border border-gray-700">
                    {profile.items_count || 0} PIECES
                  </span>
                </div>
              </div>
            </div>

            <button className="self-start sm:self-center bg-red-950/70 hover:bg-red-900/70 text-red-300 px-6 py-2.5 rounded-lg text-sm font-medium transition">
              Log out
            </button>
          </div>
        </div>

        {/* Stats + Favourites + Avatar Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

          <StatCard title="Collections" value={profile.collections_count || 0} />
          <StatCard title="Pieces" value={profile.items_count || 0} />

          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 lg:col-span-1">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">
              Favourite Piece
            </h3>
            <div className="aspect-[3/4] bg-gray-800 rounded-lg mb-4 overflow-hidden border border-gray-700">
              <div className="w-full h-full flex items-center justify-center text-gray-600 text-5xl">
                ?
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">
                Upload photo
              </button>
              <button className="bg-gray-800 hover:bg-gray-700 text-red-400 py-2 rounded-lg text-sm">
                Remove photo
              </button>
            </div>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">
              Profile Photo
            </h3>
            <div className="w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-gray-800 shadow-inner">
              <AvatarUpload
                userId={userId}
                currentUrl={profile.avatar_url}
                editable={isOwnProfile}
              />
            </div>
          </div>

        </div>

        {/* Your Collection Photos */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4">Your Collection Photos</h3>
          <p className="text-gray-400 text-sm mb-6">
            Add photos of your pieces (stored temporarily in browser for demo).
          </p>

          <label className="inline-block bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg cursor-pointer mb-6">
            Choose Files
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>

          {collectionPhotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
              {collectionPhotos.map((url, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden bg-black border border-gray-800 shadow-md"
                >
                  <img src={url} alt={`item ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {collectionPhotos.length > 0 && (
            <button
              onClick={clearPhotos}
              className="text-red-400 hover:text-red-300 text-sm font-medium"
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

// +++++++++++++++++++++++++++++++++++++++++++++
//  Header pill component (monochrome)
// +++++++++++++++++++++++++++++++++++++++++++++
function HeaderPill({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  const base =
    "px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors";
  const activeStyle =
    "bg-white/10 text-zinc-100 border border-white/20 hover:bg-white/15";
  const normalStyle =
    "bg-white/5 text-zinc-200 border border-white/10 hover:bg-white/10 hover:border-white/20";

  return (
    <Link href={href} className={`${base} ${active ? activeStyle : normalStyle}`}>
      {label}
    </Link>
  );
}

// +++++++++++++++++++++++++++++++++++++++++++++
//  Stat card component
// +++++++++++++++++++++++++++++++++++++++++++++
function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
      <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">
        {title}
      </h3>
      <div className="text-4xl font-bold mb-1">{value}</div>
      <div className="text-sm text-gray-500">Total</div>
    </div>
  );
}
