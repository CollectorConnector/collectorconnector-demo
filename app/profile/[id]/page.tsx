/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AvatarUpload from "./AvatarUpload";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Profile • CollectorConnector",
};

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

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
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, username, name, bio, location, avatar_url, member_number, instagram, ebay, discord, x, whatnot"
    )
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as unknown as Profile;
}

// Tier label helper
function tierLabel(n?: number | null) {
  if (!n) return null;
  if (n === 1) return "Founder · #1";
  if (n >= 2 && n <= 50) return `Gold · #${n}`;
  if (n >= 51 && n <= 100) return `Silver · #${n}`;
  if (n >= 101 && n <= 500) return `Bronze · #${n}`;
  return `Member · #${n}`;
}

// Simple, safe brand mark
function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-7 w-7">
        <Image
          src="/CC-SML-Logo.svg"
          alt="CC Logo"
          fill
          className="object-contain"
        />
      </div>
      <span className="select-none text-sm font-semibold tracking-wide">
        CollectorConnector
      </span>
    </div>
  );
}

// Simple monochrome icons
function Icon({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-zinc-300 hover:opacity-80 transition-opacity">
      {children}
    </span>
  );
}

function SocialLink({
  href,
  children,
}: {
  href?: string | null;
  children: React.ReactNode;
}) {
  if (!href) {
    return (
      <span className="text-zinc-600 cursor-not-allowed">{children}</span>
    );
  }
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-zinc-300 hover:opacity-80 transition-opacity"
    >
      {children}
    </Link>
  );
}

function HeaderBar({ profile }: { profile: Profile }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <BrandMark />
          <div className="hidden sm:block h-5 w-px bg-white/10" />
          <span className="truncate text-sm text-zinc-400">
            @{profile.username}
          </span>
        </div>

        <nav className="flex items-center gap-4 text-zinc-300">
          <SocialLink href={profile.ebay}>eBay</SocialLink>
          <SocialLink href={profile.instagram}>Instagram</SocialLink>
          <SocialLink href={profile.discord}>Discord</SocialLink>
          <SocialLink href={profile.x}>X</SocialLink>
          <SocialLink href={profile.whatnot}>Whatnot</SocialLink>
        </nav>
      </div>
    </header>
  );
}

export default async function ProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await getProfile(params.id);
  if (!profile) return notFound();

  const tier = tierLabel(profile.member_number);

  return (
    <div className="min-h-screen bg-black text-white">
      <HeaderBar profile={profile} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="h-6" />

        {/* Instagram‑style layout */}
        <section className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
          {/* Left column: Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative aspect-square w-[180px] overflow-hidden rounded-full border border-white/10">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-500">
                  No avatar
                </div>
              )}
            </div>

            <div className="w-full">
              <AvatarUpload userId={profile.id} />
            </div>
          </div>

          {/* Right column: Info */}
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h1 className="truncate text-2xl font-semibold">
                @{profile.username}
              </h1>
              {tier && (
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wide text-zinc-400">
                  {tier}
                </span>
              )}
            </div>

            <div className="text-sm text-zinc-300">
              <div className="flex flex-wrap items-center gap-3">
                {profile.name && (
                  <span className="font-medium text-zinc-200">
                    {profile.name}
                  </span>
                )}
                {profile.location && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400">{profile.location}</span>
                  </>
                )}
              </div>
            </div>

            {profile.bio && (
              <p className="max-w-prose text-sm leading-relaxed text-zinc-300">
                {profile.bio}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
              <SocialLink href={profile.ebay}>eBay</SocialLink>
              <SocialLink href={profile.instagram}>Instagram</SocialLink>
              <SocialLink href={profile.discord}>Discord</SocialLink>
              <SocialLink href={profile.x}>X</SocialLink>
              <SocialLink href={profile.whatnot}>Whatnot</SocialLink>
            </div>
          </div>
        </section>

        <div className="h-16" />
      </main>
    </div>
  );
}
