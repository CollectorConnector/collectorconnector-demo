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
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header avatarUrl={null} displayName="Loading..." />
        <div className="flex items-center justify-center h-[80vh] text-xl">
          Loading...
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header avatarUrl={null} displayName="Error" />
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <h1 className="text-3xl mb-4">Error</h1>
          <p className="text-white/70">{error || "Profile not found"}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      <Header avatarUrl={profile.avatar_url} displayName={displayName} />

      <main className="w-full px-5 sm:px-8 md:px-12 pt-6 max-w-6xl mx-auto">
        {/* Profile Card */}
        <div className="bg-gradient-to-b from-gray-900/70 to-black/90 border border-gray-800/80 rounded-2xl p-6 md:p-8 shadow-2xl mb-12">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6 md:gap-8">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden border-2 border-gray-700/80 shadow-lg">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-gray-800 to-gray-950 flex items-center justify-center text-3xl font-bold text-gray-400">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {isOwnProfile && (
                <div className="mt-4">
                  <AvatarUpload
                    userId={userId}
                    currentUrl={profile.avatar_url}
                    editable={true}
                  />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-1">{displayName}</h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 mb-3">
                {profile.username && <span>@{profile.username}</span>}
                {profile.location && <span>• {profile.location}</span>}
              </div>

              {profile.bio && (
                <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
                  {profile.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-gray-800/70 border border-gray-700 rounded-full px-5 py-2 text-center min-w-[110px]">
                  <div className="text-xl font-semibold">
                    {profile.collections_count || 0}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">
                    Collections
                  </div>
                </div>

                <div className="bg-gray-800/70 border border-gray-700 rounded-full px-5 py-2 text-center min-w-[110px]">
                  <div className="text-xl font-semibold">
                    {profile.items_count || 0}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">
                    Items
                  </div>
                </div>
              </div>
            </div>

            {/* Edit button */}
            {isOwnProfile && (
              <Link
                href="/edit-profile"
                className="self-start sm:self-center px-6 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-sm font-medium transition whitespace-nowrap"
              >
                Edit Profile
              </Link>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ───────────────────────────────────────────────
//  Header – pill nav style matching your mock
// ───────────────────────────────────────────────
function Header({
  avatarUrl,
  displayName = "Collector",
}: {
  avatarUrl?: string | null;
  displayName?: string;
}) {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-4">
            {/* Left – logo + text */}
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/CC-main-logo.png"
                alt="CollectorConnector"
                className="h-7 sm:h-8 w-auto object-contain"
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

            {/* Center – pill nav */}
            <nav className="hidden md:flex items-center gap-2.5">
              <PillLink href="/dashboard" label="Dashboard" />
              <PillLink href={`/profile/${userId}`} label="Profile" active />
              <PillLink href="#" label="eBay" subtle />
              <PillLink href="#" label="PSA" subtle />
              <PillLink href="#" label="Goldin" subtle />
              <PillLink href="#" label="Whatnot" subtle />
              <PillLink href="#" label="Sports Card Investor" subtle />
            </nav>

            {/* Right – DEMO + version + avatar */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <span className="px-2.5 py-1 text-[11px] uppercase tracking-wider bg-white/5 border border-white/10 rounded-full text-zinc-300">
                  DEMO
                </span>
                <span className="text-xs text-zinc-500">v0.7.4</span>
              </div>

              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden border border-white/20 shadow-sm">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-xs font-bold text-zinc-400">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="h-14 sm:h-16" />
    </>
  );
}

function PillLink({
  href,
  label,
  active = false,
  subtle = false,
}: {
  href: string;
  label: string;
  active?: boolean;
  subtle?: boolean;
}) {
  const base = "px-4 py-1.5 text-sm rounded-full transition-all whitespace-nowrap";
  if (active) {
    return (
      <Link
        href={href}
        className={`${base} bg-blue-600/20 text-blue-300 border border-blue-500/40 hover:bg-blue-600/30`}
      >
        {label}
      </Link>
    );
  }
  if (subtle) {
    return (
      <Link
        href={href}
        className={`${base} bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10 hover:border-white/20`}
      >
        {label}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className={`${base} bg-white/5 text-zinc-200 border border-white/10 hover:bg-white/10 hover:border-white/20`}
    >
      {label}
    </Link>
  );
}
