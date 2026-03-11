"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

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
  categories_count?: number | null;
  rarity_score?: number | null;
  tier?: string | null;
  member_number?: number | null;
};

type Collection = {
  id: string;
  name: string;
  cover_image?: string | null;
  item_count?: number | null;
};

type Item = {
  id: string;
  title?: string | null;
  description?: string | null;
  image_url?: string | null;
  created_at?: string | null;
};

/* -------------------------------------------------------
   Main Page
------------------------------------------------------- */
export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activity, setActivity] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function run() {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      const { data: collectionData } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });

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

    run();
  }, [id]);

  const displayName = useMemo(
    () => profile?.display_name || profile?.username || "Collector",
    [profile]
  );

  const usernameLine = profile?.username ? `@${profile.username}` : null;

  const tierText = useMemo(() => {
    if (!profile) return null;

    if (profile.tier) return profile.tier;

    const n = profile.member_number;
    if (n === 1) return "Founder · #1";
    if (n >= 2 && n <= 50) return `Gold · #${n}`;
    if (n >= 51 && n <= 100) return `Silver · #${n}`;
    if (n >= 101 && n <= 500) return `Bronze · #${n}`;
    if (n) return `Member #${n}`;

    return null;
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 px-4">
        <Header />
        <p>Loading…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 px-4">
        <Header />
        <p>Profile not found.</p>
      </div>
    );
  }

  const itemsCount = profile.items_count ?? activity.length ?? 0;
  const categoriesCount =
    profile.categories_count ?? collections.length ?? 0;
  const rarityScore = profile.rarity_score ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0d0d] to-black pb-20 text-white">
      <Header />

      <main className="mx-auto max-w-5xl px-4 pt-10">
        <div className="relative isolate">
          <NeonGlow />

          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-[0_0_80px_rgba(255,255,255,0.12)] backdrop-blur-xl ring-1 ring-white/10">
            {/* HERO STRIP */}
            <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-start">
              {/* Avatar */}
              <div className="shrink-0">
                <div className="overflow-hidden rounded-[28%] border border-white/15 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                  <Image
                    src={profile.avatar_url || "/diamond2.png"}
                    alt="Avatar"
                    width={128}
                    height={128}
                    className="object-cover h-28 w-28 sm:h-32 sm:w-32"
                  />
                </div>
              </div>

              {/* Identity */}
              <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
                <h1 className="text-2xl font-semibold">{displayName}</h1>

                <p className="text-white/70 text-sm truncate">
                  {usernameLine}
                  {usernameLine && profile.location ? " · " : ""}
                  {profile.location}
                </p>

                <div className="flex items-center flex-wrap justify-center sm:justify-start gap-3">
                  {tierText && <TierBadge text={tierText} />}
                  <FollowButton />
                </div>

                {profile.bio && (
                  <p className="text-sm text-white/80 leading-relaxed">
                    {profile.bio}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="w-full max-w-xs sm:w-60">
                <StatsStrip
                  items={itemsCount}
                  categories={categoriesCount}
                  rarity={rarityScore}
                />
              </div>
            </div>

            {/* Collections */}
            <div className="border-t border-white/10 p-4">
              <CollectionsGallery collections={collections} />
            </div>

            {/* Activity */}
            <div className="border-t border-white/10 p-4">
              <ActivityFeed activity={activity} />
            </div>

            {/* Branding */}
            <div className="border-t border-white/10 py-3 text-center text-[10px] uppercase tracking-[0.3em] text-white/40">
              CC · CollectorConnector
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------
   Proper Header (tiny crisp logo)
------------------------------------------------------- */
function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl h-14 flex items-center justify-between px-4">
        /
          <div className="flex items-center gap-2">
            <Image
              src="/CC-SML-Logo.png"
              alt="CC Logo"
              width={20}
              height={20}
              className="h-5 w-5 object-contain"
            />
            <span className="text-sm font-semibold tracking-wide text-white/80">
              Collector<span className="text-emerald-400">Connector</span>
            </span>
          </div>
        </Link>

        <div className="text-xs text-white/50">Profile</div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------
   Shared UI Components
------------------------------------------------------- */
function NeonGlow() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 blur-3xl pointer-events-none"
      style={{
        background:
          "radial-gradient(80% 60% at 50% 30%, rgba(255,255,255,0.18), transparent 70%)",
      }}
    />
  );
}

function TierBadge({ text }: { text: string }) {
  return (
    <span className="px-3 py-1 text-xs text-white/80 bg-white/5 border border-white/15 rounded-full flex items-center gap-1">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
      {text}
    </span>
  );
}

function FollowButton() {
  return (
    <button className="px-4 py-2 bg-white text-black rounded-xl text-sm font-semibold shadow hover:bg-gray-100">
      Follow · Add Friend
    </button>
  );
}

function StatsStrip({
  items,
  categories,
  rarity,
}: {
  items: number;
  categories: number;
  rarity: number;
}) {
  const stats = [
    { label: "Items", value: items },
    { label: "Categories", value: categories },
    { label: "Rarity", value: rarity },
  ];

  return (
    <div className="grid grid-cols-3 text-center border border-white/10 bg-white/[0.05] rounded-xl overflow-hidden">
      {stats.map((s) => (
        <div key={s.label} className="py-3 px-4">
          <p className="text-lg font-semibold">{s.value}</p>
          <p className="text-xs text-white/60 uppercase tracking-wide">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function CollectionsGallery({ collections }: { collections: Collection[] }) {
  if (collections.length === 0)
    return (
      <div className="p-4 text-sm text-white/60 bg-white/[0.04] rounded-xl border border-white/10">
        No collections yet.
      </div>
    );

  return (
    <div className="p-2 bg-white/[0.04] border border-white/10 rounded-xl backdrop-blur">
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory p-1 [&::-webkit-scrollbar]:hidden">
        {collections.map((col) => (
          <div key={col.id} className="snap-start shrink-0">
            <div className="relative w-56 h-40 rounded-xl overflow-hidden border border-white/10 bg-white/5 shadow">
              <Image
                src={col.cover_image || "/diamond2.png"}
                alt={col.name}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-sm font-medium text-white">{col.name}</p>
                <p className="text-[11px] text-white/70">
                  {col.item_count ?? 0} items
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityFeed({ activity }: { activity: Item[] }) {
  if (activity.length === 0)
    return (
      <div className="p-4 text-sm text-white/60 bg-white/[0.04] rounded-xl border border-white/10">
        No recent activity yet.
      </div>
    );

  return (
    <div className="space-y-4">
      {activity.map((item) => (
        <article
          key={item.id}
          className="p-4 bg-white/[0.04] border border-white/10 rounded-xl"
        >
          <div className="relative w-full h-64 rounded-lg overflow-hidden mb-3">
            <Image
              src={item.image_url || "/diamond2.png"}
              alt={item.title || "Item"}
              fill
              className="object-cover"
            />
          </div>

          <p className="text-white font-medium">{item.title}</p>
          {item.description && (
            <p className="text-white/70 text-sm mt-1">{item.description}</p>
          )}
          {item.created_at && (
            <p className="text-white/40 text-[11px] mt-2">
              {new Date(item.created_at).toLocaleString()}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
