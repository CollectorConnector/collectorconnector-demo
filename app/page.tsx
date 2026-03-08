// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <section className="flex flex-col items-center text-center gap-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold glow-white">
          WHERE COLLECTORS MEET
        </h1>

        <p className="max-w-2xl text-zinc-400">
          Create your identity. Showcase your collections. Connect with collectors around the world.
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/u/stacy"
            className="inline-flex items-center justify-center rounded-md border border-white/10 bg-black px-4 py-2 text-sm text-white hover:border-white/25"
          >
            View profile
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center justify-center rounded-md border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white hover:border-white/25"
          >
            Explore collections
          </Link>
        </div>
      </section>
    </div>
  );
}
