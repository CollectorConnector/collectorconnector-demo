
// components/Nav.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/upload", label: "Upload" },
  { href: "/u/stacy", label: "Account" }, // swap to dynamic/auth route later
];

const external = [
  { href: "https://www.ebay.com", label: "eBay" },
  { href: "https://www.whatnot.com", label: "Whatnot" },
  { href: "https://www.instagram.com", label: "Instagram" },
  { href: "https://www.youtube.com", label: "YouTube" },
  { href: "https://discord.com", label: "Discord" },
];

export default function Navbar() {
  const pathname = usePathname();

  const active = useMemo(() => {
    // basic active match on first segment
    if (!pathname) return "/";
    if (pathname === "/") return "/";
    const first = "/" + pathname.split("/").filter(Boolean)[0];
    return first;
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* LEFT: Logo + Primary Nav */}
        <div className="flex items-center gap-7">
          <Link href="/" className="flex items-center">
            <Image
              src="/CC-MAIN-Logo.png" // ensure file exists under /public
              alt="CollectorConnector"
              width={132}
              height={28}
              className="h-7 w-auto"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            {navItems.map(({ href, label }) => {
              const isActive = active === href || pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "transition-colors",
                    isActive
                      ? "text-white"
                      : "text-zinc-400 hover:text-zinc-200",
                  ].join(" ")}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* RIGHT: External links (neutral, grey) */}
        <div className="hidden sm:flex items-center gap-4 text-sm text-zinc-400">
          {external.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-200 transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
