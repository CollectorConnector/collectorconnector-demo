// app/profile/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AvatarUpload from "./AvatarUpload";

/* ───────────────────────────────────────────────
   Types
─────────────────────────────────────────────── */
type Profile = {
  id: string;
  display_name?: string | null;
  username?: string | null;
  location?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  items_count?: number | null;         // optional counters if you use them
  collections_count?: number | null;   // optional counters if you use them
};

type Photo = {
  id: string;
  user_id: string;
  url: string;
  created_at: string;
};

/* ───────────────────────────────────────────────
   Page
─────────────────────────────────────────────── */
export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingMany, setUploadingMany] = useState(false);

  const isOwner = authUserId === userId;

  // Load profile + auth + photos
  useEffect(() => {
    if (!userId) {
      router.replace("/not-found");
      return;
    }

    let alive = true;

    (async () => {
      try {
        setLoading(true);

        // who am I?
        const { data: auth } = await supabase.auth.getUser();
        if (!alive) return;
        setAuthUserId(auth.user?.id || null);

        // profile
        const { data: p, error: perr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        if (perr) throw perr;
        if (!alive) return;
        setProfile(p as Profile);

        // collection photos
        const { data: ph, error: phErr } = await supabase
          .from("collection_photos")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (phErr) throw phErr;
        if (!alive) return;
        setPhotos((ph as Photo[]) || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [userId, router]);

  // Display name preference
  const name = useMemo(
    () => profile?.display_name || profile?.username || "Collector",
    [profile]
  );

  const location = profile?.location || "Swindon, UK";
  const bio =
    profile?.bio ||
    "Collector Connector CEO, Collects Cards, Comics, Sneakers, beanie babies & Coca-Cola";

  // Static pills per your wireframe (change later to dynamic if you want)
  const pills = ["Sports Cards", "TCG Cards", "Comic Books", "Sneakers"];

  // Multi-upload collection photos → Storage('item-photos') + DB insert
  async function handleAddCollectionPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !isOwner) return;

    setUploadingMany(true);
    try {
      const newRows: Photo[] = [];

      for (const file of Array.from(files)) {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const name = `${crypto.randomUUID()}.${ext}`;
        const path = `collections/${userId}/${name}`;

        // upload (same bucket you used in AvatarUpload: 'item-photos')
        const { error: upErr } = await supabase
          .storage
          .from("item-photos")
          .upload(path, file, { upsert: false, contentType: file.type, cacheControl: "3600" });
        if (upErr) throw upErr;

        // public URL
        const { data } = supabase.storage.from("item-photos").getPublicUrl(path);
        const publicUrl = data.publicUrl;

        // insert DB row
        const { data: inserted, error: insErr } = await supabase
          .from("collection_photos")
          .insert({ user_id: userId, url: publicUrl })
          .select()
          .single();
        if (insErr) throw insErr;

        newRows.push(inserted as Photo);
      }

      // prepend new photos
      setPhotos((prev) => [...newRows, ...prev]);
      // reset input
      e.currentTarget.value = "";
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Check console for details.");
    } finally {
      setUploadingMany(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <main className="mx-auto max-w-6xl px-6 pt-16">
          <div className="text-center text-zinc-400">Loading…</div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white">
        <main className="mx-auto max-w-6xl px-6 pt-16">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile not found</h1>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* NO HEADER (per your request) */}

      <main className="mx-auto max-w-6xl px-6 pb-24">
        {/* ───────────────────────────────────────────────
            Profile Identity Block
        ─────────────────────────────────────────────── */}
        <section className="pt-10 text-center">
          {/* Avatar cluster (square with diagonal tag and CC badge) */}
          <div className="relative inline-block">
            <div className="mx-auto h-44 w-44 overflow-hidden rounded-lg border border-white/40 bg-zinc-900">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-5xl text-zinc-600">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Diagonal label */}
            <div className="pointer-events-none absolute -top-4 -left-8 -rotate-12">
              <div className="rounded border border-white/40 bg-black px-3 py-1 text-[11px] text-zinc-300">
                Avatar (Profile Pic)
              </div>
            </div>

            {/* CC badge */}
            <div className="pointer-events-none absolute -right-3 bottom-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-black text-xs">
              CC
            </div>
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight">{name}</h1>
          <div className="mt-1 text-sm text-zinc-400">Collector Connector 1</div>
          <div className="mt-1 text-sm text-zinc-400">{location}</div>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300">
            Bio: {bio}
          </p>

          {/* Follow (only when viewing someone else) */}
          {!isOwner && (
            <button
              type="button"
              className="mt-6 inline-flex items-center justify-center rounded-md border border-white/40 px-5 py-2 text-sm hover:bg-white/5"
            >
              Follow
            </button>
          )}

          {/* Owner-only: change avatar (uses YOUR AvatarUpload) */}
          {isOwner && (
            <div className="mt-5 flex items-center justify-center">
              <AvatarUpload
                userId={userId}
                currentUrl={profile.avatar_url}
                editable={true}
                onSaved={(url) => setProfile((p) => (p ? { ...p, avatar_url: url } : p))}
              />
            </div>
          )}

          {/* Divider */}
          <div className="mx-auto mt-8 h-px w-64 bg-white/40" />
        </section>

        {/* Pills row */}
        <section className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {pills.map((label) => (
            <span
              key={label}
              className="inline-flex items-center rounded border border-white/40 px-4 py-2 text-sm"
            >
              {label}
            </span>
          ))}
        </section>

        {/* ───────────────────────────────────────────────
            Collections Gallery
        ─────────────────────────────────────────────── */}
        <section className="mt-12">
          <h2 className="mb-5 text-center text-xl font-semibold">Collections Gallery</h2>

          {/* Owner-only multi-upload */}
          {isOwner && (
            <div className="mb-5 flex items-center justify-center">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-white/40 px-4 py-2 text-sm hover:bg-white/5">
                {uploadingMany ? "Uploading…" : "Add collection photos"}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleAddCollectionPhotos}
                  disabled={uploadingMany}
                />
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Left card: Niche Families */}
            <div className="rounded-lg border border-white/40 p-5">
              <h3 className="mb-3 font-medium">Niche Families</h3>
              <ul className="space-y-1 text-sm text-zinc-300">
                <li>1,500 – Sports Cards</li>
                <li>1,321 – TCG Cards</li>
                <li>1,525 – Comics</li>
                <li>1,778 – Sneakers</li>
                <li>1,323 – Beanie Babies</li>
              </ul>
            </div>

            {/* Center tile: CC or newest uploaded image */}
            <div className="flex items-center justify-center rounded-lg border border-white/40 p-5">
              {photos.length === 0 ? (
                <div className="text-6xl font-semibold tracking-tight">CC</div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photos[0].url}
                  alt="Latest"
                  className="h-48 w-full max-w-sm rounded object-cover"
                />
              )}
            </div>

            {/* Right card: News */}
            <div className="rounded-lg border border-white/40 p-5">
              <h3 className="mb-2 font-medium">News + Upcoming Events</h3>
              <p className="text-sm text-zinc-300">
                New feature launch coming soon… <br />
                Community meetup – London – April 2026
              </p>
            </div>
          </div>

          {/* Grid of uploaded photos (below the three cards) */}
          {photos.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {photos.slice(0, 12).map((p) => (
                <div key={p.id} className="overflow-hidden rounded border border-white/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" className="h-40 w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ───────────────────────────────────────────────
            Live Feed (wireframe)
        ─────────────────────────────────────────────── */}
        <section className="mt-12">
          <div className="rounded-lg border border-white/40 p-6">
            <h2 className="mb-4 text-xl font-semibold">Live Feed</h2>

            <div className="flex items-start gap-5">
              {/* Simple stick-figure */}
              <svg
                width="80"
                height="100"
                viewBox="0 0 80 100"
                className="text-white"
                aria-hidden="true"
              >
                <circle cx="30" cy="20" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                <line x1="30" y1="30" x2="30" y2="60" stroke="currentColor" strokeWidth="2" />
                <line x1="10" y1="40" x2="50" y2="40" stroke="currentColor" strokeWidth="2" />
                <line x1="30" y1="60" x2="15" y2="85" stroke="currentColor" strokeWidth="2" />
                <line x1="30" y1="60" x2="45" y2="85" stroke="currentColor" strokeWidth="2" />
                <text x="58" y="24" fill="currentColor" fontSize="10" fontFamily="monospace">
                  RC
                </text>
              </svg>

              <div className="flex-1">
                <p className="text-lg font-medium">Richard House</p>
                <p className="text-sm text-zinc-500">New upload</p>

                <div className="mt-3 inline-block rounded border border-white/40 bg-black px-3 py-2 text-sm">
                  (RH) – New Rare Card
                  <br />
                  Shohei Ohtani Rookie
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
