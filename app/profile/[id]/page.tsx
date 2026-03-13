"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
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
  categories_count?: number | null;
  rarity_score?: number | null;
};

type Collection = {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  item_count?: number | null;
};

type Item = {
  id: string;
  title?: string | null;
  description?: string | null;
  created_at?: string | null;
};

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activity, setActivity] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Collection creation modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Trading Cards");

  useEffect(() => {
    if (!userId) {
      router.replace("/not-found");
      return;
    }

    let aborted = false;

    async function fetchProfileData() {
      try {
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id === userId) setIsOwnProfile(true);

        const [{ data: profileData, error: pErr }, { data: collData }, { data: actData }] =
          await Promise.all([
            supabase.from("profiles").select("*").eq("id", userId).single(),
            supabase
              .from("collections")
              .select("*")
              .eq("user_id", userId)
              .order("created_at", { ascending: false }),
            supabase
              .from("items")
              .select("*")
              .eq("user_id", userId)
              .order("created_at", { ascending: false })
              .limit(8),
          ]);

        if (aborted) return;

        if (pErr || !profileData) {
          setError("Profile not found");
          return;
        }

        setProfile(profileData);
        setCollections(collData ?? []);
        setActivity(actData ?? []);
      } catch (err) {
        console.error("Profile load failed:", err);
        if (!aborted) setError("Something went wrong while loading the profile.");
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    fetchProfileData();
    return () => { aborted = true; };
  }, [userId, router]);

  const displayName = useMemo(
    () => profile?.display_name || profile?.username || "Collector",
    [profile]
  );
  const displayUsername = profile?.username ? `@${profile.username}` : null;

  // Create new collection
  async function handleCreateCollection() {
    if (!newName.trim() || !profile) return;

    const { data, error } = await supabase
      .from("collections")
      .insert({
        user_id: profile.id,
        name: newName.trim(),
        description: newDesc.trim() || null,
        category: newCategory,
      })
      .select()
      .single();

    if (error) {
      alert("Failed to create collection: " + error.message);
    } else {
      setCollections([data, ...collections]);
      setShowCreateModal(false);
      setNewName("");
      setNewDesc("");
      setNewCategory("Trading Cards");
    }
  }

  if (loading) return <ProfileSkeleton />;
  if (error || !profile) {
    return (
      <div className="min-h-dvh bg-black text-white flex flex-col">
        <div className="w-full fixed top-0 z-50 bg-black border-b border-white/10">
          <Nav />
        </div>
        <div className="h-16" />
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <div>
            <h1 className="text-3xl font-semibold mb-4">Oops…</h1>
            <p className="text-white/70 mb-8 max-w-md mx-auto">{error || "Profile not found."}</p>
            <button onClick={() => router.back()} className="rounded-lg bg-white/10 px-5 py-2.5 text-sm hover:bg-white/15 transition">
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const itemsCount = profile.items_count ?? activity.length ?? 0;
  const categoriesCount = profile.categories_count ?? collections.length ?? 0;
  const rarityScore = profile.rarity_score ?? 0;

  return (
    <div className="min-h-dvh bg-black text-white flex flex-col">
      {/* Navbar with small logo */}
      <header className="w-full fixed top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/CC-main-logo.png" alt="CollectorConnector" className="h-7 sm:h-8 w-auto" />
              <span className="text-lg font-semibold tracking-tight hidden sm:block">CollectorConnector</span>
            </Link>

            <div className="flex items-center gap-5 sm:gap-7">
              <a href="https://www.ebay.com/usr/yourusername" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 hover:text-white transition-colors">eBay</a>
              <a href="https://instagram.com/yourusername" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 hover:text-white transition-colors">Instagram</a>
              <a href="https://x.com/yourusername" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 hover:text-white transition-colors">X</a>
              <a href="https://discord.gg/yourserver" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 hover:text-white transition-colors">Discord</a>
              <Nav />
            </div>
          </div>
        </div>
      </header>

      <div className="h-16 shrink-0" />

      {/* Small hero */}
      <section className="pt-12 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Where Collectors Meet</h1>
        <p className="mt-5 text-lg text-white/70 max-w-2xl mx-auto px-4">
          Discover, showcase, and celebrate your collections with a community that shares your passion.
        </p>
      </section>

      <main className="mx-auto w-full max-w-5xl px-5 sm:px-6 lg:px-8 space-y-24 pb-32 flex-1">
        {/* Profile Card – Avatar + Username / Location / Bio */}
        <section className="relative rounded-3xl border border-white/12 bg-gradient-to-b from-white/[0.07] to-white/[0.03] shadow-2xl shadow-black/40 p-8 sm:p-12">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Avatar */}
            <AvatarUpload
              userId={profile.id}
              currentUrl={profile.avatar_url}
              editable={isOwnProfile}
            />

            {/* Username, Location & Bio – right next to avatar */}
            <div className="space-y-3 max-w-lg">
              <h2 className="text-4xl font-semibold tracking-tight">{displayName}</h2>
              
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-white/70">
                {displayUsername && <span>{displayUsername}</span>}
                {profile.location && <span>· {profile.location}</span>}
              </div>

              {profile.bio && (
                <p className="text-base leading-relaxed text-white/80 max-w-2xl mx-auto">
                  {profile.bio}
                </p>
              )}
            </div>

            <FollowButton />

            {/* Stats */}
            <StatsStrip
              items={itemsCount}
              categories={categoriesCount}
              rarity={rarityScore}
            />

            {/* CREATE COLLECTION BUTTON – only visible to owner */}
            {isOwnProfile && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 text-sm font-medium transition"
              >
                <span>📦</span>
                Create New Collection
              </button>
            )}
          </div>

          {/* Collections + Activity */}
          <div className="mt-16 grid md:grid-cols-2 gap-10 border-t border-white/10 pt-12">
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center justify-between">
                My Collections
                <span className="text-xs text-white/50">({collections.length})</span>
              </h3>
              {collections.length === 0 ? (
                <p className="text-white/50 text-sm">No collections yet. Create your first one above!</p>
              ) : (
                <ul className="space-y-3">
                  {collections.map((col) => (
                    <li key={col.id} className="bg-white/5 rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{col.name}</div>
                        {col.description && <p className="text-sm text-white/60 mt-1 line-clamp-1">{col.description}</p>}
                      </div>
                      <div className="text-right">
                        <div className="text-xs uppercase text-white/50">{col.category}</div>
                        <div className="text-lg font-semibold">{col.item_count ?? 0}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
              {activity.length === 0 ? (
                <p className="text-white/50 text-sm">No recent activity yet.</p>
              ) : (
                <ul className="space-y-2.5 text-sm text-white/80">
                  {activity.map((item) => (
                    <li key={item.id}>
                      <strong>{item.title}</strong>
                      {item.description && ` — ${item.description}`}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Editorial sections (optional – keep for now) */}
        <div className="space-y-32">
          <EditorialSection title="Manage Your Information" subtitle="Take control of your profile and data" body="Easily update your personal details, location, and collector identity." align="left" />
          <EditorialSection title="Personalize Your Profile" subtitle="Craft a presence that reflects who you are" body="Customize your avatar, bio, and collector details to create a profile that stands out." align="right" />
        </div>
      </main>

      <Footer />

      {/* CREATE COLLECTION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="bg-zinc-900 border border-white/20 rounded-3xl max-w-md w-full p-8">
            <h3 className="text-2xl font-semibold mb-6">Create New Collection</h3>

            <div className="space-y-5">
              <div>
                <label className="text-xs uppercase tracking-widest text-white/60 mb-1 block">Collection Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. 2024 Pokémon TCG"
                  className="w-full bg-black border border-white/20 rounded-2xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-white/60 mb-1 block">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none"
                >
                  <option>Trading Cards</option>
                  <option>Comics</option>
                  <option>Stamps</option>
                  <option>LEGO</option>
                  <option>Beanie Babies</option>
                  <option>Action Figures</option>
                  <option>Coins</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-white/60 mb-1 block">Description (optional)</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="My complete Base Set collection..."
                  className="w-full bg-black border border-white/20 rounded-2xl px-4 py-3 text-white h-24 resize-y min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 text-sm font-medium border border-white/20 rounded-2xl hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCollection}
                disabled={!newName.trim()}
                className="flex-1 py-3 text-sm font-semibold bg-white text-black rounded-2xl hover:bg-gray-200 disabled:opacity-50"
              >
                Create Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────
   Reusable components (unchanged)
─────────────────────────────────────────────── */
function ProfileSkeleton() {
  return (
    <div className="min-h-dvh bg-black text-white">
      <div className="w-full fixed top-0 z-50 bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 h-16" />
      </div>
      <div className="h-16" />
      <div className="mx-auto max-w-5xl px-6 pt-20 animate-pulse">
        <div className="h-24 w-24 rounded-full bg-white/10 mx-auto mb-6" />
        <div className="h-9 w-64 bg-white/10 rounded mx-auto mb-3" />
        <div className="h-5 w-48 bg-white/10 rounded mx-auto mb-8" />
        <div className="h-12 w-80 bg-white/5 rounded-xl mx-auto mb-12" />
      </div>
    </div>
  );
}

function EditorialSection({ title, subtitle, body, align = "left" }: { title: string; subtitle: string; body: string; align?: "left" | "right"; }) {
  const isLeft = align === "left";
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      {isLeft ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-white/70">{subtitle}</p>
          <p className="text-white/60 leading-relaxed">{body}</p>
        </div>
      ) : (
        <div className="space-y-4 md:col-start-2">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-white/70">{subtitle}</p>
          <p className="text-white/60 leading-relaxed">{body}</p>
        </div>
      )}
      <div className="hidden md:block" />
    </section>
  );
}

function FollowButton() {
  return (
    <button type="button" className="rounded-xl bg-white px-7 py-2.5 text-sm font-semibold text-black hover:bg-gray-200 transition shadow-lg">
      Follow
    </button>
  );
}

function StatsStrip({ items, categories, rarity }: { items: number; categories: number; rarity: number; }) {
  return (
    <div className="grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden text-center">
      <div className="px-5 py-4"><div className="text-2xl font-semibold">{items}</div><div className="text-xs uppercase tracking-wider text-white/60 mt-1">Items</div></div>
      <div className="px-5 py-4"><div className="text-2xl font-semibold">{categories}</div><div className="text-xs uppercase tracking-wider text-white/60 mt-1">Collections</div></div>
      <div className="px-5 py-4"><div className="text-2xl font-semibold">{rarity}</div><div className="text-xs uppercase tracking-wider text-white/60 mt-1">Rarity Score</div></div>
    </div>
  );
}
