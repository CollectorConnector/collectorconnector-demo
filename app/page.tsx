// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <section className="text-center">
      <h1 className="text-3xl md:text-4xl font-semibold glow-white tracking-tight">
        WHERE COLLECTORS MEET
      </h1>

      <p className="mt-3 text-zinc-400">
        Create your identity. Showcase your collections. Connect with collectors around the world.
      </p>

      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <Link href="/u/stacy" className="text-zinc-200 hover:text-white transition-colors">
          View profile
        </Link>
        <Link href="/explore" className="text-zinc-400 hover:text-zinc-200 transition-colors">
          Explore collections
        </Link>
      </div>
    </section>
  );
}
