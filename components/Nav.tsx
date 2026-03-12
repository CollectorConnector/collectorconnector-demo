"use client";

import Link from "next/link";

export default function Nav() {
  return (
    <header className="w-full bg-black border-b border-gray-800 shadow-[0_0_40px_rgba(255,255,255,0.15)] fixed top-0 left-0 z-50">
      <div className="w-full flex flex-wrap items-center px-4 py-3 gap-4">

        {/* LEFT CLUSTER — grows to fill space */}
        <div className="flex items-center gap-6 flex-1 min-w-0">

          {/* TEXT LOGO → HOME */}
          <Link href="/" className="text-lg font-semibold whitespace-nowrap">
            CollectorConnector
          </Link>

          {/* INTERNAL NAV LINKS */}
          <nav className="hidden sm:flex items-center gap-4 text-sm whitespace-nowrap">
            <Link href="/explore" className="hover:text-gray-300 transition">Explore</Link>
            <Link href="/collections/create" className="hover:text-gray-300 transition">Add Item</Link>
            <Link href="/profile/me" className="hover:text-gray-300 transition">Profile</Link>
          </nav>
        </div>

        {/* RIGHT CLUSTER — scrolls if too wide */}
        <nav className="flex items-center gap-4 text-sm overflow-x-auto whitespace-nowrap flex-shrink-0">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition">Instagram</a>
          <a href="https://ebay.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition">eBay</a>
          <a href="https://stockx.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition">StockX</a>
          <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition">Discord</a>
          <a href="https://whatnot.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition">Whatnot</a>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition">X</a>
        </nav>

      </div>
    </header>
  );
}
