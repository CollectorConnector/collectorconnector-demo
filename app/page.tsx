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
          width={220}
          height={52}
          className="object-contain"
          priority
        />
      </div>

      {/* EYEBROW (was cyan/blue, now neutral grey) */}
      <div className="text-xs tracking-[0.2em] text-zinc-400">
        BUILT FOR COLLECTORS
      </div>

      {/* HEADLINE (white with subtle white-only glow) */}
      <h1 className="mt-3 text-3xl md:text-5xl font-semibold glow-white">
        WHERE COLLECTORS MEET
      </h1>

      {/* SUBTEXT (soft grey) */}
      <p className="mt-3 max-w-2xl text-zinc-400">
        Create your identity. Showcase your collections. Connect with collectors around the world.
      </p>

      {/* CTA BUTTONS: blue → white */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        {/* Primary: solid white on black */}
        <Link
          href="/u/stacy"
          className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
        >
          Create your profile
        </Link>

        {/* Secondary: outline white only */}
        <Link
          href="/explore"
          className="inline-flex items-center justify-center rounded-md border border-white/80 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-white"
        >
          Explore collectors
        </Link>
      </div>
    </section>
  );
}
