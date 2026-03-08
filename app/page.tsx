// app/page.tsx
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <section className="flex flex-col items-center text-center py-16 md:py-24">
      {/* HERO LOGO */}
      <div className="mb-6">
        <Image
          src="/CC-main-logo.png"
          alt="CollectorConnector"
          width={180}
          height={48}
          className="h-12 w-auto object-contain"
          priority
        />
      </div>

      {/* EYEBROW (was cyan/blue → now neutral grey) */}
      <div className="text-xs tracking-[0.22em] text-zinc-400">
        BUILT FOR COLLECTORS
      </div>

      {/* HEADLINE (white with subtle white-only glow) */}
      <h1 className="mt-3 text-3xl md:text-5xl font-semibold glow-white tracking-tight">
        WHERE COLLECTORS MEET
      </h1>

      {/* SUBTEXT (soft grey) */}
      <p className="mt-3 max-w-2xl text-zinc-400">
        Create your identity. Showcase your collections. Connect with collectors around the world.
      </p>

      {/* CTA BUTTONS — blue → white */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        {/* Primary: solid white on black */}
        <Link
          href="/u/stacy"
          className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-black shadow-sm hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          Create your profile
        </Link>

        {/* Secondary: white outline only */}
        <Link
          href="/explore"
          className="inline-flex items-center justify-center rounded-md border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          Explore collectors
        </Link>
      </div>
    </section>
  );
}
