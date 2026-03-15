"use client";

import Link from "next/link";

export default function Nav() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="w-full px-5 sm:px-8 h-14 flex items-center justify-between">

          {/* Left: Logo + Tagline */}
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/CC-main-logo.png"
              alt="CollectorConnector"
              className="h-7 w-auto object-contain"
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

          {/* Right: Small avatar placeholder */}
          <div className="h-8 w-8 rounded-full overflow-hidden bg-zinc-700 border border-white/20" />
        </div>
      </header>

      {/* Spacer so content doesn't hide behind header */}
      <div className="h-14" />
    </>
  );
}
