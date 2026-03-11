"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0d0d] to-black flex flex-col items-center justify-center px-6 pt-28 text-white relative overflow-hidden">

      {/* Soft radial glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none blur-[120px]"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 20%, rgba(255,255,255,0.20), rgba(255,255,255,0.03), transparent 70%)",
        }}
      />

      {/* Main container */}
      <div className="relative max-w-2xl mx-auto text-center">

        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Image
            src="/CC-main-logo.png"
            alt="CollectorConnector"
            width={200}
            height={200}
            className="opacity-95 drop-shadow-[0_0_22px_rgba(255,255,255,0.25)]"
          />
        </div>

        {/* Micro tagline */}
        <p className="text-xs tracking-[0.30em] text-white/70 mb-3 uppercase">
          BUILT FOR COLLECTORS
        </p>

        {/* Main tagline */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
          WHERE COLLECTORS MEET
        </h1>

        {/* Subtagline */}
        <p className="text-base sm:text-lg text-white/60 leading-relaxed mb-10">
          Create your identity. Showcase your collections.  
          Connect with collectors around the world.
        </p>

        {/* Glass CTA Panel */}
        <div className="mx-auto max-w-sm space-y-3 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_0_45px_rgba(255,255,255,0.10)]">

          {/* Create Profile */}
          <Link
            href="/auth/signup"
            className="block w-full text-center rounded-xl bg-white text-black font-semibold py-3 text-sm shadow-[0_0_16px_rgba(255,255,255,0.25)] hover:bg-gray-200 transition"
          >
            Create your profile
          </Link>

          {/* Explore */}
          <Link
            href="/explore"
            className="block w-full text-center rounded-xl border border-white/20 text-white font-medium py-3 text-sm hover:bg-white/10 transition"
          >
            Explore collectors
          </Link>
        </div>
      </div>

      {/* CC Footer watermark */}
      <div className="absolute bottom-6 text-center text-[10px] tracking-[0.25em] text-white/30 uppercase">
        CC · CollectorConnector
      </div>
    </div>
  );
}
