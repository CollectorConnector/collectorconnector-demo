"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  display_name: string | null;
  username: string | null;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
  tier: "Diamond" | "Founder" | "Gold" | "Silver" | "Bronze" | null;
  items_count?: number | null;
  categories_count?: number | null;
  rarity_score?: number | null;
};

type Collection = {
  id: string;
  name: string;
  cover_image: string | null;
  item_count?: number | null;
  niche?: string | null;
};

type ActivityItem = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      const { data: collectionData } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", id);

      const { data: activityData } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      setProfile((profileData as Profile) || null);
      setCollections((collectionData as Collection[]) || []);
      setActivity((activityData as ActivityItem[]) || []);
      setLoading(false);
    }

    if (id) loadData();
  }, [id]);

  if (loading) return <div className="p-6 text-white">Loading…</div>;
  if (!profile) return <div className="p-6 text-white">Profile not found</div>;

  const tierIcon =
    profile.tier === "Diamond"
      ? "/diamond2.png"
      : profile.tier === "Founder"
      ? "/founder2.png"
      : profile.tier === "Gold"
      ? "/gold2.png"
      : profile.tier === "Silver"
      ? "/silver2.png"
      : profile.tier === "Bronze"
      ? "/bronze2.png"
      : "/diamond2.png";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0d0d] to-black">
      {/* push content below global header */}
      <div className="pt-20 pb-20">
        <div className="max-w-3xl mx-auto px-4 space-y-10">

          {/* HERO PROFILE SECTION WITH WHITE GLOW */}
          <section className="relative flex justify-center">
            <div className="absolute -inset-4 rounded-3xl bg-white/10 blur-2xl opacity-70 pointer-events-none" />
            <div className="relative w-full rounded-3xl bg-black/70 border border-white/10 shadow-xl px-6 py-6 flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#444] to-[#222] blur-xl opacity-40" />
                <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-700 shadow-lg">
                  <Image
                    src={profile.avatar_url || "/diamond2.png"}
                    alt="Avatar"
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Name / username / location */}
              <h1 className="text-xl font-semibold text-white">
                {profile.display_name || profile.username}
              </h1>
              {profile.username && (
                <p className="text-gray-400 text-xs">@{profile.username}</p>
              )}
              {profile.location && (
                <p className="text-gray-500 text-[11px] mt-0.5">
                  {profile.location}
                </p>
              )}

              {/* Tier badge */}
              {profile.tier && (
                <div className="mt-3 inline-flex items-center gap-1 px-3 py-[3px] rounded-full bg-[#e5e5e5] text-black text-[10px] font-medium shadow-sm border border-gray-300">
                  <Image
                    src={tierIcon}
                    alt={`${profile.tier} Tier`}
                    width={16}
                    height={16}
                    className="object-contain"
                  />
                  <span>{profile.tier}</span>
                </div>
              )}

              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-300 text-sm mt-4 max-w-md leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Follow / Add friend button */}
              <button
                className="mt-5 inline-flex items-center justify-center px-4 py-2 rounded-full bg-white text-black text-xs font-semibold shadow-md hover:bg-gray-100 transition-colors"
                type="button"
              >
                Follow / Add Friend
              </button>
            </div>
          </section>

          {/* GLASS-CASE GALLERY CAROUSEL (SHELL) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Collections</h2>
              <p className="text-[11px] text-gray-400">
                Swipe to explore their niches
              </p>
            </div>

            <div className="relative">
              <div className="absolute -inset-3 rounded-2xl bg-white/5 blur-xl opacity-60 pointer-events-none" />
              <div className="relative overflow-x-auto flex gap-4 py-4 px-1">
                {collections.length === 0 && (
                  <p className="text-gray-400 text-sm">
                    No collections yet
                  </p>
                )}

                {collections.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    className="shrink-0 w-52 rounded-2xl bg-black/70 border border-white/10 shadow-lg hover:border-white/40 transition-colors flex flex-col overflow-hidden"
                  >
                    <div className="relative w-full h-32 bg-black">
                      <Image
                        src={col.cover_image || "/diamond2.png"}
                        alt={col.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    </div>
                    <div className="p-3 text-left">
                      <p className="text-sm font-medium text-white truncate">
                        {col.name}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {col.item_count ?? 0} items
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* STATS SECTION */}
          <section className="relative">
            <div className="absolute -inset-3 rounded-2xl bg-white/5 blur-xl opacity-40 pointer-events-none" />
            <div className="relative grid grid-cols-3 text-center bg-black/70 p-4 rounded-2xl border border-white/10 shadow-md">
              <div>
                <p className="text-xl font-semibold text-white">
                  {profile.items_count ?? 0}
                </p>
                <p className="text-gray-400 text-xs mt-1">Items</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-white">
                  {profile.categories_count ?? 0}
                </p>
                <p className="text-gray-400 text-xs mt-1">Categories</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-white">
                  {profile.rarity_score ?? 0}
                </p>
                <p className="text-gray-400 text-xs mt-1">Rarity</p>
              </div>
            </div>
          </section>

          {/* ACTIVITY FEED */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Activity</h2>

            {activity.length === 0 ? (
              <p className="text-gray-400 text-sm">No recent activity yet</p>
            ) : (
              <div className="space-y-6">
                {activity.map((item) => (
                  <article
                    key={item.id}
                    className="bg-black/70 rounded-2xl p-4 border border-white/10 shadow-md hover:border-white/40 transition-colors"
                  >
                    <div className="relative w-full h-64 rounded-xl overflow-hidden mb-3 bg-black">
                      <Image
                        src={item.image_url || "/diamond2.png"}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <p className="font-medium text-white">{item.title}</p>

                    {item.description && (
                      <p className="text-gray-400 text-sm mt-1">
                        {item.description}
                      </p>
                    )}

                    <p className="text-gray-500 text-[11px] mt-2">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
