// app/page.tsx
import Image from "next/image";
import Link from "next/link";

{/* TAILWIND TEST BLOCK — remove later */}
<div className="mt-8 rounded-lg bg-zinc-900 p-4 text-white">
  <div className="mb-2 font-semibold">Tailwind test</div>
  <div className="text-zinc-400 text-sm">If this box is NOT dark grey with spacing, Tailwind isn’t running.</div>
</div>

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <section className="flex flex-col items-center text-center gap-6">
        {/* Hero logo (large) */}
        <Image
          src="/CC-main-logo.png"
          alt="CollectorConnector"
          width={240}
          height={48}
          className="h-12 w-auto object-contain"
          priority
        />

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold glow-white">
          WHERE COLLECTORS MEET
        </h1>

        <p className="max-w-2xl text-zinc-400">
          Create your identity. Showcase your collections. Connect with collectors around the world.
        </p>

        {/* Monochrome buttons */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/u/stacy"
            className="inline-flex items-center justify-center rounded-md border border-white/12 px-4 py-2 text-sm font-medium text-white hover:border-white/25 transition-colors"
          >
            View profile
          </Link>

          <Link
            href="/explore"
            className="inline-flex items-center justify-center rounded-md border border-white/12 px-4 py-2 text-sm font-medium text-zinc-200 hover:text-white hover:border-white/25 transition-colors"
          >
            Explore collections
          </Link>
        </div>
      </section>
    </div>
  );
}
