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

  // Optional fields for new UI elements
  member_number?: number | null;
  instagram?: string | null;
  ebay?: string | null;
  discord?: string | null;
  x?: string | null; // X (Twitter)
  whatnot?: string | null;
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
   Helpers
------------------------------------------------------- */
function tierLabel(n?: number | null) {
  if (!n) return null;
  if (n === 1) return "Founder · #1";
  if (n >= 2 && n <= 50) return `Gold · #${n}`;
  if (n >= 51 && n <= 100) return `Silver · #${n}`;
  if (n >= 101 && n <= 500) return `Bronze · #${n}`;
  return `Member · #${n}`;
}

function formatLink(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  // If the user stored just a handle or missing protocol, try to normalize minimally
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("@")) return `https://instagram.com/${trimmed.slice(1)}`;
  // Fallback: add https
  return `https://${trimmed}`;
}

/* -------------------------------------------------------
   Monochrome Icons
------------------------------------------------------- */
function SocialIcon({ name, className = "h-5 w-5" }: { name: "instagram" | "ebay" | "discord" | "x" | "whatnot"; className?: string }) {
  switch (name) {
    case "instagram":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
      );
    case "ebay":
      // Monochrome "e"-style badge
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path
            d="M8 12c0-2 1.5-3.5 4-3.5 1.7 0 3 .7 3 .7v2s-1.2-.7-2.7-.7c-1.7 0-2.8 1.1-2.8 2.5s1.1 2.5 2.8 2.5c1.6 0 2.9-.8 2.9-.8v2s-1.4.8-3.2.8C9.5 18.5 8 16.9 8 15z"
            fill="currentColor"
          />
        </svg>
      );
    case "discord":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M7.6 6.6C9.2 5.9 10.9 5.6 12 5.6s2.8.3 4.4 1l.4.2a9.6 9.6 0 0 1 2.6 6.8c0 0-1.1 1.9-4 2.6l-.9-1.4c2.6-.7 3.5-2 3.5-2-.7.5-1.6.9-2.5 1.2-.5.2-1 .3-1.5.4-.3.1-.6.1-.9.1l-.6-.9a12 12 0 0 1-1.1 0l-.6.9c-.3 0-.6 0-.9-.1-.5-.1-1-.2-1.5-.4-.9-.3-1.8-.7-2.5-1.2 0 0 .9 1.3 3.5 2l-.9 1.4c-2.9-.7-4-2.6-4-2.6a9.6 9.6 0 0 1 2.6-6.8l.4-.2Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <circle cx="9.5" cy="12" r="1" fill="currentColor" />
          <circle cx="14.5" cy="12" r="1" fill="currentColor" />
        </svg>
      );
    case "x":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4l16 16M20 4 4 20" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "whatnot":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8l-6-3-6 3V8Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
  }
}

function SocialLink({
  url,
  label,
  icon,
}: {
  url?: string | null;
  label: string;
  icon: "instagram" | "ebay" | "discord" | "x" | "whatnot";
}) {
  const href = formatLink(url);
  const classes = "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-opacity";
  if (!href) {
    return (
      <span className={`${classes} text-zinc-600 cursor-not-allowed`}>
        <SocialIcon name={icon} />
        <span className="hidden sm:inline">{label}</span>
      </span>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${classes} text-zinc-200 hover:opacity-80`}>
      <SocialIcon name={icon} />
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}

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
  const tier = tierLabel(profile?.member_number);

  if (loading) {
    return (
      <div className="min-h-dvh bg-black text-white">
        {/* PREMIUM CC HEADER */}
        <div className="w-full fixed top-0 left-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center">
            <Nav />
          </div>
        </div>
        {/* HEADER SPACER */}
        <div className="h-16 w-full" />

        <div className="mx-auto max-w-6xl px-4 pt-10">
          <div className="text-white/60">Loading…</div>
        </div>

        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-dvh bg-black text-white">
        {/* PREMIUM CC HEADER */}
        <div className="w-full fixed top-0 left-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center">
            <Nav />
          </div>
        </div>
        {/* HEADER SPACER */}
        <div className="h-16 w-full" />

        <div className="mx-auto max-w-6xl px-4 pt-10">
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
         PREMIUM CC HEADER
      ------------------------------------------------------- */}
      <div className="w-full fixed top-0 left-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center">
          <Nav />
        </div>
      </div>
      {/* HEADER SPACER */}
      <div className="h-16 w-full" />

      {/* -------------------------------------------------------
         HERO (kept as-is; feel free to remove if you want the profile at top)
      ------------------------------------------------------- */}
      <section className="w-full bg-black pt-20 pb-16 text-center">
        <img
          src="/CC-main-logo.png"
          alt="CollectorConnector Logo"
          className="mx-auto h-16 w-auto opacity-90"
        />
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">
          Where Collectors Meet
        </h1>
        <p className="mt-3 text-white/60 max-w-xl mx-auto text-sm">
          Discover, showcase, and celebrate your collections with a community that shares your passion.
        </p>
      </section>

      {/* -------------------------------------------------------
         MAIN
      ------------------------------------------------------- */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 space-y-16 pb-28">
        {/* -------------------------------------------------------
           A) PROFILE TOP — Avatar left, info right
        ------------------------------------------------------- */}
        <section className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
          {/* Left: Avatar + upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative aspect-square w-[180px] overflow-hidden rounded-full border border-white/10 bg-zinc-900">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-500">
                  No avatar
                </div>
              )}
            </div>

            {/* Keep your existing uploader API to avoid prop errors */}
            <div className="w-full">
              <AvatarUpload userId={profile.id} currentAvatar={null} />
            </div>
          </div>

          {/* Right: Identity + bio + socials */}
          <div className="flex min-w-0 flex-col gap-4">
            {/* Name + Tier */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h2 className="truncate text-2xl font-semibold leading-tight">
                {displayName}
              </h2>
              {tier && (
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wide text-zinc-400">
                  {tier}
                </span>
              )}
            </div>

            {/* Username / location */}
            {(displayUsername || profile.location) && (
              <div className="text-sm text-zinc-400">
                <div className="flex flex-wrap items-center gap-3">
                  {displayUsername && <span className="text-zinc-300">{displayUsername}</span>}
                  {displayUsername && profile.location && <span className="text-zinc-600">•</span>}
                  {profile.location && <span className="text-zinc-400">{profile.location}</span>}
                </div>
              </div>
            )}

            {/* Bio */}
            {profile.bio && (
              <p className="max-w-prose text-sm leading-relaxed text-zinc-300">
                {profile.bio}
              </p>
            )}

            {/* C) Social links row */}
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <SocialLink url={profile.ebay} label="eBay" icon="ebay" />
              <SocialLink url={profile.instagram} label="Instagram" icon="instagram" />
              <SocialLink url={profile.discord} label="Discord" icon="discord" />
              <SocialLink url={profile.x} label="X" icon="x" />
              <SocialLink url={profile.whatnot} label="Whatnot" icon="whatnot" />
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------
           Stats (clean, premium)
        ------------------------------------------------------- */}
        <section className="rounded-xl border border-white/10 bg-white/[0.04]">
          <div className="grid grid-cols-3 divide-x divide-white/10 text-center">
            <div className="px-4 py-4">
              <div className="text-lg font-semibold text-white">{itemsCount}</div>
              <div className="text-xs uppercase tracking-wider text-white/60">Items</div>
            </div>
            <div className="px-4 py-4">
              <div className="text-lg font-semibold text-white">{categoriesCount}</div>
              <div className="text-xs uppercase tracking-wider text-white/60">Categories</div>
            </div>
            <div className="px-4 py-4">
              <div className="text-lg font-semibold text-white">{rarityScore}</div>
              <div className="text-xs uppercase tracking-wider text-white/60">Rarity</div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------
           Collections
        ------------------------------------------------------- */}
        <section className="border-t border-white/10 pt-6">
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
        </section>

        {/* -------------------------------------------------------
           Activity
        ------------------------------------------------------- */}
        <section className="border-t border-white/10 pt-6">
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
        </section>

        {/* -------------------------------------------------------
           Editorial Sections (kept)
        ------------------------------------------------------- */}
        <EditorialSection
          title="Manage Your Information"
          subtitle="Take control of your profile and data"
          body="Easily update your personal details, location, and collector identity. Your profile is your digital presence — keep it accurate, expressive, and uniquely yours."
          align="left"
        />
        <EditorialSection
          title="Personalize Your Profile"
          subtitle="Craft a presence that reflects who you are"
          body="Customize your avatar, bio, and collector details to create a profile that stands out. Your collection tells a story — let your profile tell the rest."
          align="right"
        />
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
