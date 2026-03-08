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
  { href: "/u/stacy", label: "Account" },
];

const external = [
  { href: "https://www.ebay.com", label: "eBay" },
  { href: "https://www.whatnot.com", label: "Whatnot" },
  { href: "https://www.instagram.com", label: "Instagram" },
  { href: "https://www.youtube.com", label: "YouTube" },
  { href: "https://discord.com", label: "Discord" },
];

export default function Nav() {
  const pathname = usePathname();

  const active = useMemo(() => {
    if (!pathname || pathname === "/") return "/";
    const first = "/" + pathname.split("/").filter(Boolean)[0];
    return first;
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* LEFT: Logo + Primary Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <Image
              src="/CC-main-logo.png"
              alt="CollectorConnector"
              width={120}
              height={28}
              className="h-7 w-auto object-contain"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navItems.map(({ href, label }) => {
              const isActive = active === href || pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={isActive
                    ? "text-white"
                    : "text-zinc-400 hover:text-zinc-200 transition-colors"}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* RIGHT: External links */}
        <div className="hidden sm:flex items-center gap-4 text-sm">
          {external.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
