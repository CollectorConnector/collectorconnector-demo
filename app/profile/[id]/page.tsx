"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import AvatarUpload from "./AvatarUpload";

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
            supabase
              .from("collections")
              .select("*")
              .eq("user_id", id)
              .order("created_at", { ascending: false }),
            supabase
              .from("items")
              .select("*")
              .eq("user_id", id)
              .order("created_at", { ascending: false }),
          ]);

        if (!alive) return;

        setProfile(profileData || null);
        setCollections(collectionData || []);
        setActivity(activityData || []);
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

  if (loading) {
    return (
      <div className="min-h-dvh bg-black pt-24 pb-20 text-white">
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
      <div className="min-h-dvh bg-black pt-24 pb-20 text-white">
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
    <div className="min-h-dvh bg-black pt-16 pb-20 text-white">
      <Header />

      <main className="mx-auto max-w-5xl px-4">
        {/* Hero Card — NO BLUR, NO GLOW */}
        <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] shadow-lg">
          <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-stretch">
            
            {/* Avatar + upload */}
            <div className="shrink-0">
              <AvatarUpload userId={profile.id} currentAvatar={profile.avatar_url} />
            </div>

            {/* Identity */}
            <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-white">
                {displayName}
              </h1>

              <p className="truncate text-sm text-white/70">
                {displayUsername}
                {displayUsername && profile.location ? " · " : ""}
                {profile.location}
              </p>

              {/* Follow button only */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <FollowButton />
              </div>

              {profile.bio ? (
                <p className="text-pretty text-sm leading-relaxed text-white/80">
                  {profile.bio}
                </p>
              ) : null}
            </div>

            {/* Quick Stats */}
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

          <div className="border-t border-white/10 p-3 text-center text-[10px] uppercase tracking-[0.3em] text-white/30">
            CC · CollectorConnector
          </div>
        </section>
      </main>
    </div>
  );
}

/* -------------------------------------------------------
   Header
------------------------------------------------------- */
function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2">
          <Image
            src="/CC-SML-Logo.png"
            alt="CollectorConnector"
            width={20}
            height={20}
            className="h-5 w-5 object-contain"
            priority
          />
          <span className="text-sm font-semibold tracking-wide text-white/80 group-hover:text-white">
            Collector<span className="text-emerald-400">Connector</span>
          </span>
        </Link>
        <div className="text-xs text-white/50">Profile</div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------
   Shared UI
------------------------------------------------------- */

function FollowButton() {
  return (
    <button
      type="button"
      className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-md"
    >
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
    <div className="grid grid-cols-3 divide-x divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] text-center">
      {stats.map((s) => (
        <div key={s.label} className="px-4 py-3">
          <div className="text-lg font-semibold text-white">{s.value}</div>
          <div className="text-xs uppercase tracking-wider text-white/60">
            {s.label}
          </div>
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2">
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {collections.map((col) => (
          <div key={col.id} className="snap-start shrink-0">
            <div className="group relative h-40 w-56 overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-md">
              <Image
                src={col.cover_image || "/diamond2.png"}
                alt={col.name}
                fill
                className="object-cover transition group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <p className="truncate text-sm font-medium text-white">
                  {col.name}
                </p>
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
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-md"
        >
          <div className="relative mb-3 h-64 w-full overflow-hidden rounded-xl bg-black">
            <Image
              src={item.image_url || "/diamond2.png"}
              alt={item.title || "Item"}
              fill
              className="object-cover"
            />
          </div>

          {item.title ? (
            <p className="font-medium text-white">{item.title}</p>
          ) : null}
          {item.description ? (
            <p className="mt-1 text-sm text-white/70">{item.description}</p>
          ) : null}
          {item.created_at ? (
            <p className="mt-2 text-[11px] text-white/50">
              {new Date(item.created_at).toLocaleString()}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
