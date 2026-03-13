/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// If you already have a central Supabase helper, you can replace this inline client
// with your existing utility. This inline version is safe for server components.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export const revalidate = 0; // always render fresh for now

export const metadata: Metadata = {
  title: 'Profile • CollectorConnector',
};

type Profile = {
  id: string;
  username: string | null;
  name: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  member_number: number | null;
  instagram?: string | null;
  ebay?: string | null;
  discord?: string | null;
  x?: string | null;
  whatnot?: string | null;
};

async function getProfile(id: string): Promise<Profile | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase env vars missing');
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(
      [
        'id',
        'username',
        'name',
        'bio',
        'location',
        'avatar_url',
        'member_number',
        'instagram',
        'ebay',
        'discord',
        'x',
        'whatnot',
      ].join(',')
    )
    .eq('id', id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }  
  return data as unknown as Profile;
}

function tierLabel(n?: number | null) {
  if (n == null) return null;
  if (n === 1) return 'Founder · #1';
  if (n >= 2 && n <= 50) return `Gold · #${n}`;
  if (n >= 51 && n <= 100) return `Silver · #${n}`;
  if (n >= 101 && n <= 500) return `Bronze · #${n}`;
  return `Member · #${n}`;
}

/** ---- Simple inline brand mark (uses file if present, text fallback) ---- */
function BrandMark() {
  // If /public/CC-SML-Logo.svg exists, this will render. If not, we show text.
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-7 w-7">
        {/* If your logo filename differs, update the src path below */}
        <Image
          src="/CC-SML-Logo.svg"
          alt="CollectorConnector"
          fill
          className="object-contain"
          sizes="28px"
          priority
          onError={(e) => {
            // @ts-ignore – gracefully degrade to text on error
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      <span className="select-none text-sm font-semibold tracking-wide">CollectorConnector</span>
    </div>
  );
}

/** ---- Social Icon (monochrome) ---- */
function Icon({
  name,
  className = 'h-5 w-5',
}: {
  name: 'instagram' | 'ebay' | 'discord' | 'x' | 'whatnot';
  className?: string;
}) {
  switch (name) {
    case 'instagram':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
      );
    case 'ebay':
      // Simple “e” circle mark (monochrome)
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M8 12c0-2 1.5-3.5 4-3.5 1.7 0 3 .7 3 .7v2s-1.2-.7-2.7-.7c-1.7 0-2.8 1.1-2.8 2.5s1.1 2.5 2.8 2.5c1.6 0 2.9-.8 2.9-.8v2s-1.4.8-3.2.8C9.5 18.5 8 16.9 8 15z" fill="currentColor" />
        </svg>
      );
    case 'discord':
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
    case 'x':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4l16 16M20 4 4 20" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'whatnot':
      // Simple badge shape
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8l-6-3-6 3V8Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
  }
}

function SocialLink({
  href,
  label,
  icon,
}: {
  href?: string | null;
  label: string;
  icon: 'instagram' | 'ebay' | 'discord' | 'x' | 'whatnot';
}) {
  const active = !!href;
  const content = (
    <span className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm ${active ? 'text-zinc-200 hover:opacity-80' : 'text-zinc-500 cursor-not-allowed'}`}>
      <Icon name={icon} />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
  if (!active) return <span aria-disabled="true">{content}</span>;
  return (
    <Link href={href!} target="_blank" rel="noopener noreferrer" className="transition-opacity">
      {content}
    </Link>
  );
}

function HeaderBar({ profile }: { profile: Profile | null }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <BrandMark />
          <div className="hidden sm:block h-5 w-px bg-white/10" />
          <div className="truncate text-sm text-zinc-400">
            {profile?.username ? `@${profile.username}` : 'Profile'}
          </div>
        </div>
        <nav className="flex items-center gap-3 text-zinc-300">
          <SocialLink href={profile?.ebay ?? null} label="eBay" icon="ebay" />
          <SocialLink href={profile?.instagram ?? null} label="Instagram" icon="instagram" />
          <SocialLink href={profile?.discord ?? null} label="Discord" icon="discord" />
          <SocialLink href={profile?.x ?? null} label="X" icon="x" />
          <SocialLink href={profile?.whatnot ?? null} label="Whatnot" icon="whatnot" />
        </nav>
      </div>
    </header>
  );
}

// Import your existing local uploader (kept as-is for now)
import AvatarUpload from './AvatarUpload';

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const profile = await getProfile(params.id);
  if (!profile) return notFound();

  const tier = tierLabel(profile.member_number);

  return (
    <div className="min-h-screen bg-black text-white">
      <HeaderBar profile={profile} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Top spacing */}
        <div className="h-6" />

        {/* Profile block */}
        <section className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
          {/* Left: Avatar + upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative aspect-square w-[180px] overflow-hidden rounded-full border border-white/10">
              {profile.avatar_url ? (
                // Using <img> to avoid domain config issues with Next/Image on remote URLs
                <img
                  src={profile.avatar_url}
                  alt={profile.username ?? 'Avatar'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-500">
                  No avatar
                </div>
              )}
            </div>

            {/* Keep your existing upload component */}
            <div className="w-full">
              <AvatarUpload />
            </div>
          </div>

          {/* Right: Profile info */}
          <div className="flex min-w-0 flex-col gap-4">
            {/* Username + tier */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h1 className="truncate text-2xl font-semibold leading-tight">
                {profile.username ? `@${profile.username}` : 'Unnamed'}
              </h1>
              {tier && (
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wide text-zinc-400">
                  {tier}
                </span>
              )}
            </div>

            {/* Name / location */}
            <div className="text-sm text-zinc-300">
              <div className="flex flex-wrap items-center gap-3">
                {profile.name && <span className="font-medium text-zinc-200">{profile.name}</span>}
                {profile.location && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400">{profile.location}</span>
                  </>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="max-w-prose text-sm leading-relaxed text-zinc-300">{profile.bio}</p>
            )}

            {/* Social links (duplicated here for convenience below header) */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <SocialLink href={profile.ebay ?? null} label="eBay" icon="ebay" />
              <SocialLink href={profile.instagram ?? null} label="Instagram" icon="instagram" />
              <SocialLink href={profile.discord ?? null} label="Discord" icon="discord" />
              <SocialLink href={profile.x ?? null} label="X" icon="x" />
              <SocialLink href={profile.whatnot ?? null} label="Whatnot" icon="whatnot" />
            </div>
          </div>
        </section>

        {/* Story‑style circles row (optional; placeholder rendering) */}
        <section className="mt-10 border-t border-white/10 pt-6">
          <div className="flex items-center gap-5 overflow-x-auto pb-2">
            {/* Replace these placeholders with real collection categories when ready */}
            {['March', 'Fits', 'February', 'January', 'Get Real', 'Vote', 'Words'].map((label, i) => (
              <div key={i} className="flex w-[92px] flex-col items-center gap-2">
                <div className="relative h-[72px] w-[72px] overflow-hidden rounded-full border border-white/10 bg-zinc-900" />
                <span className="truncate text-xs text-zinc-400">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="h-16" />
      </main>
    </div>
  );
}
