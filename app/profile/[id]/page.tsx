"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
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

      setProfile(profileData || null);
      setCollections(collectionData || []);
      setActivity(activityData || []);
      setLoading(false);
    }

    loadData();
  }, [id]);

  if (loading) return <div className="p-6 text-white">Loading…</div>;
  if (!profile) return <div className="p-6 text-white">Profile not found</div>;

  return (
    <div className="max-w-3xl mx-auto pb-20">

      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-gradient-to-b from-[#0d0d0d] to-[#1a1a1a] border-b border-gray-800 shadow-md px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.push("/")} className="flex items-center">
          <Image
            src="/CC-SML-Logo.png"
            alt="Home"
            width={24}
            height={24}
            style={{ width: "24px", height: "24px" }}
            className="object-contain"
          />
        </button>

        <h1 className="text-sm font-semibold text-white">{profile.username}</h1>

        <div className="w-[24px]" /> {/* Spacer for symmetry */}
      </header>

      <div className="px-4 space-y-10">

        {/* PROFILE HEADER */}
        <div className="flex flex-col items-center text-center mt-4 animate-fadeIn">

          {/* Avatar with soft glow */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#444] to-[#222] blur-xl opacity-40"></div>
            <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-700 shadow-lg relative">
              <Image
                src={profile.avatar_url || "/diamond.png"}
                alt="Avatar"
                width={96}
                height={96}
                className="object-cover"
              />
            </div>
          </div>

          {/* Name */}
          <h2 className="text-xl font-semibold mt-3">{profile.display_name}</h2>
          <p className="text-gray-400 text-xs">@{profile.username}</p>

          {/* Location */}
          {profile.location && (
            <p className="text-gray-500 text-[11px] mt-0.5">{profile.location}</p>
          )}

          {/* Tier Badge — polished */}
          {profile.tier && (
            <div className="mt-2 inline-flex items-center gap-1 px-3 py-[3px] rounded-full bg-[#e5e5e5] text-black text-[10px] font-medium shadow-sm border border-gray-300">

              <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center border border-gray-300">
                <Image
                  src={
                    profile.tier === "Diamond" ? "/diamond.png" :
                    profile.tier === "Founder" ? "/founder.png" :
                    profile.tier === "Gold" ? "/gold.png" :
                    profile.tier === "Silver" ? "/silver.png" :
                    profile.tier === "Bronze" ? "/bronze.png" :
                    "/diamond.png"
                  }
                  alt={`${profile.tier} Tier`}
                  width={16}
                  height={16}
                  style={{ width: "16px", height: "16px" }}
                  className="object-contain"
                />
              </div>

              <span>{profile.tier}</span>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="text-gray-300 text-sm mt-3 max-w-md leading-relaxed">
              {profile.bio}
            </p>
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 text-center bg-[#111] p-4 rounded-xl border border-gray-800 shadow-md animate-fadeIn">
          <div>
            <p className="text-xl font-semibold">{profile.items_count ?? 0}</p>
            <p className="text-gray-400 text-sm">Items</p>
          </div>
          <div>
            <p className="text-xl font-semibold">{profile.categories_count ?? 0}</p>
            <p className="text-gray-400 text-sm">Categories</p>
          </div>
          <div>
            <p className="text-xl font-semibold">{profile.rarity_score ?? 0}</p>
            <p className="text-gray-400 text-sm">Rarity</p>
          </div>
        </div>

        {/* COLLECTIONS */}
        <section className="animate-fadeIn">
          <h3 className="text-lg font-semibold mb-3">Collections</h3>

          {collections.length === 0 ? (
            <p className="text-gray-400 text-sm">No collections yet</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {collections.map((col) => (
                <div
                  key={col.id}
                  className="bg-[#111] rounded-xl overflow-hidden shadow-md border border-gray-800 hover:scale-[1.02] transition-transform"
                >
                  <div className="relative w-full h-48">
                    <Image
                      src={col.cover_image || "/diamond.png"}
                      alt={col.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-medium">{col.name}</p>
                    <p className="text-gray-400 text-xs">{col.item_count ?? 0} items</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ACTIVITY */}
        <section className="animate-fadeIn">
          <h3 className="text-lg font-semibold mb-3">Activity</h3>

          {activity.length === 0 ? (
            <p className="text-gray-400 text-sm">No recent activity yet</p>
          ) : (
            <div className="space-y-6">
              {activity.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#111] rounded-xl p-4 border border-gray-800 shadow-md hover:scale-[1.01] transition-transform"
                >
                  <div className="relative w-full h-64 rounded-lg overflow-hidden mb-3">
                    <Image
                      src={item.image_url || "/diamond.png"}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <p className="font-medium">{item.title}</p>

                  {item.description && (
                    <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                  )}

                  <p className="text-gray-500 text-xs mt-2">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
