"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
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
      <div className="min-h-dvh bg-black text-white">
        <div className="w-full">
          <Nav />
        </div>
        <div className="mx-auto max-w-5xl px-4 pt-32">
          <div className="text-white/60">Loading…</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-dvh bg-black text-white">
        <div className="w-full">
          <Nav />
        </div>
        <div className="mx-auto max-w-5xl px-4 pt-32">
          <div className="text-white/60">Profile not found.</div>
        </div>
        <Footer />
      </div>
    );
  }

  const itemsCount = profile.items_count ?? activity.length ?? 0;
  const categoriesCount = profile.categories_count ?? collections.length ?? 0;
  const rarityScore = profile.rarity_score ?? 0;

  return (
    <div className="min-h-dvh bg-black text-white">

      {/* -------------------------------------------------------
         FULL-WIDTH HEADER
      ------------------------------------------------------- */}
      <div className="w-full fixed top-0 left-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <Nav />
      </div>

      {/* Spacer so content doesn't hide behind fixed header */}
      <div className="h-16" />

      {/* -------------------------------------------------------
         HERO SECTION — FULL WIDTH
      ------------------------------------------------------- */}
      <section className="w-full bg-black pt-20 pb-20 text-center">
        <img
          src="/CC-main-logo.png"
          alt="CollectorConnector Logo"
          className="mx-auto h-20 w-auto opacity-90"
        />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          Where Collectors Meet
        </h1>
        <p className="mt-3 text-white/60 max-w-xl mx-auto text-sm">
          Discover, showcase, and celebrate your collections with a community that
          shares your passion.
        </p>
      </section>

      <main className="mx-auto max-w-5xl px-4 space-y-32 pb-32">

        {/* -------------------------------------------------------
           PROFILE CARD (ELEVATED)
        ------------------------------------------------------- */}
        <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] shadow-[0_0_40px_rgba(255,255,255,0.15)] p-8 space-y-8">

          {/* Avatar */}
          <div className="flex justify-center">
            <AvatarUpload userId={profile.id} currentAvatar={null} />
          </div>

          {/* Identity */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              {displayName}
            </h2>

            <p className="text-sm text-white/70">
              {displayUsername}
              {displayUsername && profile.location ? " · " : ""}
              {profile.location}
            </p>

            <FollowButton />

            {profile.bio ? (
              <p className="text-sm leading-relaxed text-white/80 max-w-xl mx-auto">
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
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-white/80 text-sm mb-3">Collections</h3>
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
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-white/80 text-sm mb-3">Recent Activity</h3>
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

          <div className="border-t border-white/10 pt-4 text-center text-[10px] uppercase tracking-[0.3em] text-white/30">
            CC · CollectorConnector
          </div>
        </section>

        {/* -------------------------------------------------------
           EDITORIAL SECTION 1 — MANAGE YOUR INFORMATION
        ------------------------------------------------------- */}
        <EditorialSection
          title="Manage Your Information"
          subtitle="Take control of your profile and data"
          body="Easily update your personal details, location, and collector identity. Your profile is your digital presence — keep it accurate, expressive, and uniquely yours."
          align="left"
        />

        {/* -------------------------------------------------------
           EDITORIAL SECTION 2 — PERSONALIZE YOUR PROFILE
        ------------------------------------------------------- */}
        <EditorialSection
          title="Personalize Your Profile"
          subtitle="Craft a presence that reflects who you are"
          body="Customize your avatar, bio, and collector details to create a profile that stands out. Your collection tells a story — let your profile tell the rest."
          align="right"
        />

        {/* -------------------------------------------------------
           EDITORIAL SECTION 3 — HIGHLIGHT YOUR BEST WORKS
        ------------------------------------------------------- */}
        <EditorialSection
          title="Highlight Your Best Works"
          subtitle="Showcase your most prized items"
          body="Organize and display your collections with clarity and pride. Whether you're a seasoned collector or just starting out, your best pieces deserve the spotlight."
          align="left"
        />

      </main>

      <Footer />
    </div>
  );
}

/* -------------------------------------------------------
   Editorial Section Component
------------------------------------------------------- */
function EditorialSection({
  title,
  subtitle,
  body,
  align,
}: {
  title: string;
  subtitle: string;
  body: string;
  align: "left" | "right";
}) {
  const isLeft = align === "left";

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      {isLeft && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-white/70 text-sm">{subtitle}</p>
          <p className="text-white/60 text-sm leading-relaxed">{body}</p>
        </div>
      )}

      <div />

      {!isLeft && (
        <div className="space-y-3 md:col-start-2">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-white/70 text-sm">{subtitle}</p>
          <p className="text-white/60 text-sm leading-relaxed">{body}</p>
        </div>
      )}
    </section>
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
