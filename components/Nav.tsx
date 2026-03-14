// @/components/Nav.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  // You can pass user data via context/provider later; for now hardcoded demo
  const avatarUrl = "/default-avatar.png"; // replace with real logic when you have user state

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* LEFT: Logo + subtitle */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/CC-main-logo.png"
              alt="CollectorConnector"
              width={180}
              height={40}
              priority
              className="h-7 sm:h-8 w-auto object-contain"
            />
            <div className="hidden sm:block leading-tight">
              <div className="text-base font-semibold tracking-tight text-white">
                COLLECTORCONNECTOR
              </div>
              <div className="text-xs text-zinc-500">
                A home for collectors
              </div>
            </div>
          </Link>

          {/* CENTER: Pill nav links */}
          <nav className="hidden md:flex items-center gap-2">
            <NavPill href="/dashboard" label="Dashboard" active={pathname === "/dashboard"} />
            <NavPill href="/profile/[id]" label="Profile" active={pathname.startsWith("/profile")} />

            {/* Grouped external links in rounded container */}
            <div className="ml-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-1">
              <NavPill href="#" label="eBay" subtle />
              <NavPill href="#" label="PSA" subtle />
              <NavPill href="#" label="Goldin" subtle />
              <NavPill href="#" label="Whatnot" subtle />
              <NavPill href="#" label="Sports Card Investor" subtle />
            </div>
          </nav>

          {/* RIGHT: DEMO + version + avatar */}
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden sm:flex items-center gap-2">
              <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-xs uppercase tracking-wider text-zinc-300">
                DEMO
              </span>
              <span className="text-xs text-zinc-500">v0.7.4</span>
            </div>

            <div className="h-8 w-8 rounded-full overflow-hidden border border-white/20 shadow-sm">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="User avatar"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400">
                  C
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// Reusable pill link component
function NavPill({
  href,
  label,
  active = false,
  subtle = false,
}: {
  href: string;
  label: string;
  active?: boolean;
  subtle?: boolean;
}) {
  const baseClasses = "px-3.5 py-1.5 text-sm font-medium rounded-full transition-all whitespace-nowrap";
  
  if (active) {
    return (
      <Link
        href={href}
        className={`${baseClasses} bg-blue-600/20 text-blue-300 border border-blue-500/40 hover:bg-blue-600/30`}
      >
        {label}
      </Link>
    );
  }

  if (subtle) {
    return (
      <Link
        href={href}
        className={`${baseClasses} bg-transparent text-zinc-300 border border-transparent hover:bg-white/5 hover:border-white/10`}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`${baseClasses} bg-white/5 text-zinc-200 border border-white/10 hover:bg-white/10 hover:border-white/20`}
    >
      {label}
    </Link>
  );
}
