"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
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
  item_count?: number | null;
};

type Item = {
  id: string;
  title?: string | null;
  description?: string | null;
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
          <div className="mt-10 text-white/60">Loading…</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-dvh bg-black pt-24 pb-20 text-white">
        <Header />
        <div className="mx-auto max-w-5xl px-4">
          <div className="mt-10 text-white/60">Profile not found.</div>
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
        {/* Hero Card — NO IMAGES */}
        <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] shadow-lg p-6 space-y-6">

          {/* Avatar Upload ONLY */}
          <div className="flex justify-center">
            <AvatarUpload userId={profile.id} currentAvatar={null} />
          </div>

          {/* Identity */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              {displayName}
            </h1>

            <p className="text-sm text-white/70">
              {displayUsername}
              {displayUsername && profile.location ? " · " : ""}
              {profile.location}
            </p>

            <FollowButton />

            {profile.bio ? (
              <p className="text-sm leading-relaxed text-white/80">
                {profile.bio}
              </p>
            ) : null}
          </div>

          {/* Stats */}
          <StatsStrip
            items={itemsCount}
            categories={categoriesCount}
            rarity={rarityScore}
          />

          {/* Collections */}
          <div className="border-t border-white/10 pt-4">
            <h2 className="text-white/80 text-sm mb-2">Collections</h2>
            {collections.length === 0 ? (
              <p className="text-white/60 text-sm">No collections yet.</p>
            ) : (
              <ul className="space-y-2 text-white/80 text-sm">
                {collections.map((col) => (
                  <li key={col.id}>
                    {col.name} — {col.item_count ?? 0} items
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Activity */}
          <div className="border-t border-white/10 pt-4">
            <h2 className="text-white/80 text-sm mb-2">Recent Activity</h2>
            {activity.length === 0 ? (
              <p className="text-white/60 text-sm">No recent activity yet.</p>
            ) : (
              <ul className="space-y-2 text-white/80 text-sm">
                {activity.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong>
                    {item.description ? ` — ${item.description}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-white/10 pt-3 text-center text-[10px] uppercase tracking-[0.3em] text-white/30">
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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-sm font-semibold tracking-wide text-white/80">
          CollectorConnector
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
  return (
    <div className="grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10 bg-white/[0.04] text-center">
      <div className="px-4 py-3">
        <div className="text-lg font-semibold text-white">{items}</div>
        <div className="text-xs uppercase tracking-wider text-white/60">Items</div>
      </div>
      <div className="px-4 py-3">
        <div className="text-lg font-semibold text-white">{categories}</div>
        <div className="text-xs uppercase tracking-wider text-white/60">Categories</div>
      </div>
      <div className="px-4 py-3">
        <div className="text-lg font-semibold text-white">{rarity}</div>
        <div className="text-xs uppercase tracking-wider text-white/60">Rarity</div>
      </div>
    </div>
  );
}
