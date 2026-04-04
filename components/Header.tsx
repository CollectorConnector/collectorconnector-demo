"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-black border-b border-zinc-800 z-50">
      <div className="h-14 flex items-center justify-between px-4 max-w-[720px] mx-auto">

        {/* Main Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center border border-zinc-700 overflow-hidden">
            <img 
              src="/CC-main-logo.png" 
              alt="CollectorConnector" 
              className="w-6 h-6"
            />
          </div>
          <span className="font-bold text-lg tracking-tight">CollectorConnector</span>
        </Link>

        {/* Social Icons */}
        <div className="flex items-center gap-5 text-white">

          {/* Instagram */}
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.849.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.327.273 2.7.078 7.053.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.196 4.354 2.617 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.196 6.78-2.617 6.98-6.98.058-1.281.072-1.689.072-4.948 0-3.259-.014-3.668-.072-4.948-.2-4.354-2.618-6.78-6.98-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"/>
            </svg>
          </a>

          {/* Facebook */}
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>

          {/* eBay */}
          <a href="https://ebay.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform text-lg font-bold tracking-tighter">
            eBay
          </a>

          {/* Whatnot - your yellow W logo */}
          <a href="https://whatnot.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
            <div className="w-7 h-7 bg-black rounded-2xl flex items-center justify-center overflow-hidden border border-zinc-700">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Whatnot_Logo.svg/512px-Whatnot_Logo.svg.png" 
                alt="Whatnot" 
                className="w-5 h-5"
              />
            </div>
          </a>

          {/* Discord */}
          <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.128 12.8 12.8 0 01-1.873.892.077.077 0 00-.041.105c.36.698.772 1.363 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028z"/>
            </svg>
          </a>

          {/* X */}
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
            <svg width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>

        </div>
      </div>
    </header>
  );
}
