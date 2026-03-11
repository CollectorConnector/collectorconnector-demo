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
  created_at?: string | null;
};

type Item = {
  id: string;
  title?: string | null;
  description?: string | null;
  image_url?: string | null;
  created_at?: string | null;
};

/* -------------------------------------------------------
   Page
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

    let alive = true;
    async function run() {
      try {
        const [{ data: profileData }, { data: collectionData }, { data: activityData }] =
          await Promise.all([
            supabase.from("profiles").select("*").eq("id", id).single(),
            supabase.from("collections").select("*").eq("user_id", id).order("created_at", { ascending: false }),
            supabase.from("items").select("*").eq("user_id", id).order("created_at", { ascending: false }),
          ]);

        if (!alive) return;

        setProfile((profileData as Profile) || null);
        setCollections((collectionData as Collection[]) || []);
        setActivity((activityData as Item[]) || []);
      } catch (e) {
        console.error("Failed to load profile page data:", e);
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [id]);

  const displayName = useMemo(
    () => profile?.display_name || profile?.username || "Collector",
    [profile]
  );

  const displayUsername = profile?.username ? `@${profile.username}` : null;

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
      <div className="min-h-dvh bg-gradient-to-b from-[#0d0d0d] to-black pt-24 pb-20 text-white">
        <Header />
        <div className="mx-auto max-w-5xl px-4">
          <div className="mt-10 animate-pulse space-y-6">
            <div className="h-40 rounded-3xl bg-white/5" />
            <div className="h-6 w-48 rounded bg-white/10" />
            <div className="h-28 rounded-2xl bg-white/5" />
            <div className="h-72 rounded-2xl bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-[#0d0d0d] to-black pt-24 pb-20 text-white">
        <Header />
        <div className="mx-auto max-w-5xl px-4">
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/80">
            Profile not found.
          </div>
        </div>
      </div>
    );
  }

  const itemsCount = profile.items_count ?? activity.length ?? 0;
  const categoriesCount = profile.categories_count ?? collections.length ?? 0;
  const rarityScore = profile.rarity_score ?? 0;

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#0d0d0d] to-black pt-16 pb-20 text-white">
      <Header />
      <main className="mx-auto max-w-5xl px-4">
        <div className="relative isolate">
          <NeonGlow className="-z-10" />

          {/* HERO STRIP (Version C) */}
          <section className="overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] shadow-[0_0_80px_rgba(255,255,255,0.12)] backdrop-blur-xl ring-1 ring-white/10">
            <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-stretch">
              {/* Avatar — squircle */}
              <div className="shrink-0">
                <div className="overflow-hidden rounded-[28%] border border-white/15 ring-1 ring-white/10 shadow-[0_0_40px_rgba(255,255,255,0.12)]">
                  <Image
                    src={profile.avatar_url || "/diamond2.png"}
                    alt={`${displayName} avatar`}
                    width={128}
                    height={128}
                    className="h-28 w-28 object-cover sm:h-32 sm:w-32"
                  />
                </div>
              </div>

              {/* Identity */}
              <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
                <h1 className="truncate text-2xl font-semibold tracking-tight text-white">{displayName}</h1>
                <p className="truncate text-sm text-white/70">
                  {displayUsername}
                  {displayUsername && profile.location ? " · " : ""}
                  {profile.location}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                  {tierText ? <TierBadge text={tierText} /> : null}
                  <FollowButton />
                </div>

                {profile.bio ? (
                  <p className="text-pretty text-sm leading-relaxed text-white/80">{profile.bio}</p>
                ) : null}
              </div>

              {/* Quick Stats */}
              <div className="w-full max-w-xs sm:w-60">
                <StatsStrip items={itemsCount} categories={categoriesCount} rarity={rarityScore} />
              </div>
            </div>

            {/* Collections Gallery */}
            <div className="border-t border-white/10 p-4">
              <CollectionsGallery collections={collections} />
            </div>

            {/* Activity Feed */}
            <div className="border-t border-white/10 p-4">
              <ActivityFeed activity={activity} />
            </div>

            {/* Branding footer */}
            <div className="border-t border-white/10 p-3 text-center text-[10px] uppercase tracking-[0.3em] text-white/30">
              CC · CollectorConnector
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------
   Header (SMALL, CRISP LOGO + no stray characters)
------------------------------------------------------- */
function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2">
          {/* Tiny, crisp logo (20px). Use an SVG if you have it for perfect sharpness. */}
          <Image
            src="/CC-SML-Logo.png"
            alt="CollectorConnector"
            width={20}
            height={20}
            className="h-5 w-5 object-contain select-none"
            priority
          />
          <span className="text-sm font-semibold tracking-wide text-white/80 group-hover:text-white">
            Collector<span className="text-emerald-400">Connector</span>
          </span>
        </Link>

        {/* Right side placeholder */}
        <div className="text-xs text-white/50">Profile</div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------
   Shared UI
------------------------------------------------------- */
function NeonGlow({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 blur-3xl ${className}`}
      style={{
        background:
          "radial-gradient(80% 60% at 50% 30%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0) 70%)",
      }}
    />
  );
}

function TierBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 ring-1 ring-white/10">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
      {text}
    </span>
  );
}

function FollowButton() {
  return (
    <button
      type="button"
      className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-[0_0_18px_rgba(255,255,255,0.25)] transition hover:shadow-[0_0_28px_rgba(255,255,255,0.35)]"
    >
      Follow · Add Friend
    </button>
  );
}

function StatsStrip({ items, categories, rarity }: { items: number; categories: number; rarity: number }) {
  const stats = [
    { label: "Items", value: items },
    { label: "Categories", value: categories },
    { label: "Rarity", value: rarity },
  ];
  return (
    <div className="grid grid-cols-3 divide-x divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] text-center">
      {stats.map((s) => (
        <div key={s.label} className="px-4 py-3">
          <div className="text-lg font-semibold text-white">{s.value}</div>
          <div className="text-xs uppercase tracking-wider text-white/60">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function CollectionsGallery({ collections }: { collections: Collection[] }) {
  if (!collections || collections.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/60">
        No collections yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2 backdrop-blur">
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {collections.map((col) => (
          <div key={col.id} className="snap-start shrink-0">
            <div className="group relative h-40 w-56 overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-[0_0_20px_rgba(255,255,255,0.08)]">
              <Image
                src={col.cover_image || "/diamond2.png"}
                alt={col.name}
                fill
                className="object-cover transition group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <p className="truncate text-sm font-medium text-white">{col.name}</p>
                <p className="text-[11px] text-white/70">{col.item_count ?? 0} items</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityFeed({ activity }: { activity: Item[] }) {
  if (!activity || activity.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/60">
        No recent activity yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activity.map((item) => (
        <article
          key={item.id}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-md transition hover:border-white/30"
        >
          <div className="relative mb-3 h-64 w-full overflow-hidden rounded-xl bg-black">
            <Image
              src={item.image_url || "/diamond2.png"}
              alt={item.title || "Item"}
              fill
              className="object-cover"
            />
          </div>

          {item.title ? <p className="font-medium text-white">{item.title}</p> : null}
          {item.description ? <p className="mt-1 text-sm text-white/70">{item.description}</p> : null}
          {item.created_at ? (
            <p className="mt-2 text-[11px] text-white/50">{new Date(item.created_at).toLocaleString()}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
