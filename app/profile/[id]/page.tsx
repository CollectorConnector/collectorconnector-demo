"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
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
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Nav />
        <div className="h-16" />
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
        <Nav />
        <div className="h-16" />
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <h1 className="text-3xl mb-4">Error</h1>
          <p className="text-white/70">{error || "Profile not found"}</p>
        </div>
        <Footer />
      </div>
    );
  }

  const displayName =
    profile.display_name ||
    profile.username ||
    "Unnamed Collector";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      <Nav />
      <div className="h-16" />

      <main className="w-full px-6 sm:px-10 pt-8 max-w-5xl mx-auto">

        {/* Profile Card */}
        <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-2xl p-6 mb-10 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">

            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-[18px] overflow-hidden border border-white/20">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-zinc-700 flex items-center justify-center text-2xl font-bold text-zinc-300">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-2xl font-semibold">{displayName}</h1>
                {profile.username && (
                  <p className="text-zinc-400">@{profile.username}</p>
                )}
                {profile.location && (
                  <p className="text-zinc-500 text-sm mt-1">{profile.location}</p>
                )}
              </div>
            </div>

            {/* Edit Button */}
            {isOwnProfile && (
              <Link
                href="/edit-profile"
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-sm hover:bg-white/20 transition"
              >
                Edit Profile
              </Link>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="mt-4 text-zinc-300 leading-relaxed">{profile.bio}</p>
          )}

          {/* Stats */}
          <div className="mt-6 flex gap-10 text-center">
            <div>
              <div className="text-xl font-semibold">
                {profile.collections_count || 0}
              </div>
              <div className="text-zinc-500 text-sm">Collections</div>
            </div>
            <div>
              <div className="text-xl font-semibold">
                {profile.items_count || 0}
              </div>
              <div className="text-zinc-500 text-sm">Items</div>
            </div>
          </div>
        </div>

        {/* Avatar Upload (only for own profile) */}
        {isOwnProfile && (
          <div className="mb-10">
            <AvatarUpload userId={userId} />
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
