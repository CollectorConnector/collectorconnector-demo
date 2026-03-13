"use client";

import Link from "next/link";
import Image from "next/image";

export default function Nav() {
  return (
    <nav className="w-full text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-0">
        {/* Left: Brand */}
        <Link href="/" className="flex items-center gap-3 min-w-0">
          {/* Hard-constrained logo size (prevents huge render) */}
          <Image
            src="/CC-SML-Logo.png"   // <-- your confirmed logo file (B)
            alt="CollectorConnector"
            width={120}
            height={32}
            priority
            className="h-7 w-auto object-contain select-none"
          />
          <span className="select-none text-sm font-semibold tracking-wide">
            CollectorConnector
          </span>
        </Link>

        {/* Right: (intentionally minimal — add links/buttons if you need) */}
        <div className="flex items-center gap-6">
          {/* Example:
          <Link href="/explore" className="text-sm text-zinc-400 hover:text-zinc-200 transition">
            Explore
          </Link>
          */}
        </div>
      </div>
    </nav>
  );
}
