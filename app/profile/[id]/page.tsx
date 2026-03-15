"use client";

import type { ReactNode } from "react";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <ProfileHeader />

      <main className="px-5 sm:px-8 pt-6 pb-20 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Profile content</h1>
        <p className="text-gray-400 text-sm">
          If you still see a giant logo above this text, it is NOT coming from this file.
        </p>
      </main>
    </div>
  );
}

function ProfileHeader() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10">
        <div className="w-full px-5 sm:px-8 h-14 flex items-center justify-between">

          {/* SMALL, CONTAINED LOGO */}
          <img
            src="/CC-SML-Logo.png"
            alt="CollectorConnector"
            className="h-6 w-auto object-contain"
          />

          {/* SEARCH BAR */}
          <div className="flex-1 flex mx-4">
            <input
              type="text"
              placeholder="Search collectors, cards, comics..."
              className="w-full bg-zinc-900 border border-zinc-700 text-sm text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* (OPTIONAL) RIGHT SIDE – LEAVE EMPTY FOR NOW */}
          <div className="w-6" />
        </div>
      </header>

      {/* Spacer so content isn't hidden behind fixed header */}
      <div className="h-14" />
    </>
  );
}
