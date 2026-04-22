"use client";

import React from "react";
import Image from "next/image";

// SVG Checkmark icon
const CheckIcon = () => (
  <svg
    className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

export default function UpgradePage() {
  async function subscribe(tier: "bronze" | "silver" | "gold") {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      body: JSON.stringify({ tier }),
    });

    const data = await res.json();
    window.location.href = data.url;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center">
      {/* Header with Logo */}
      <div className="flex flex-col items-center mb-16">
        <div className="mb-8 relative w-64 h-20">
          {/* Path fixed to /CC-main-logo.png */}
          <Image
            src="/CC-main-logo.png"
            alt="CollectorConnector Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Upgrade Your Selling Power
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Lower fees, bigger reach, and exclusive tools. Support the platform and
          unlock your full potential as a collector.
        </p>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Bronze */}
        <div className="border border-gray-200 rounded-3xl p-8 bg-white shadow-sm hover:shadow-lg transition-all flex flex-col items-center">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Bronze</h3>
          <div className="text-4xl font-extrabold text-orange-500 mb-6">
            £4.99<span className="text-lg font-normal text-gray-500">/mo</span>
          </div>
          <ul className="text-gray-700 mb-8 space-y-4 text-center">
            <li className="flex items-center justify-center"><CheckIcon /> 7% selling fee</li>
            <li className="flex items-center justify-center"><CheckIcon /> Early access</li>
            <li className="flex items-center justify-center"><CheckIcon /> Support platform</li>
          </ul>
          <button
            onClick={() => subscribe("bronze")}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors"
          >
            Upgrade to Bronze
          </button>
        </div>

        {/* Silver (Featured) */}
        <div className="border-2 border-gray-900 rounded-3xl p-8 bg-gray-900 shadow-2xl relative md:-mt-4 flex flex-col items-center">
          <div className="absolute -top-3 bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest">
            Best Value
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Silver</h3>
          <div className="text-4xl font-extrabold text-white mb-6">
            £9.99<span className="text-lg font-normal text-gray-400">/mo</span>
          </div>
          <ul className="text-gray-200 mb-8 space-y-4 text-center">
            <li className="flex items-center justify-center"><CheckIcon /> 6% selling fee</li>
            <li className="flex items-center justify-center"><CheckIcon /> Priority support</li>
            <li className="flex items-center justify-center"><CheckIcon /> Early access</li>
          </ul>
          <button
            onClick={() => subscribe("silver")}
            className="w-full bg-white text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
          >
            Upgrade to Silver
          </button>
        </div>

        {/* Gold */}
        <div className="border border-gray-200 rounded-3xl p-8 bg-white shadow-sm hover:shadow-lg transition-all flex flex-col items-center">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Gold</h3>
          <div className="text-4xl font-extrabold text-yellow-500 mb-6">
            £19.99<span className="text-lg font-normal text-gray-500">/mo</span>
          </div>
          <ul className="text-gray-700 mb-8 space-y-4 text-center">
            <li className="flex items-center justify-center"><CheckIcon /> 5% selling fee</li>
            <li className="flex items-center justify-center"><CheckIcon /> Priority support</li>
            <li className="flex items-center justify-center"><CheckIcon /> Listing boost</li>
          </ul>
          <button
            onClick={() => subscribe("gold")}
            className="w-full bg-yellow-500 text-white py-3 rounded-xl font-bold hover:bg-yellow-600 transition-colors"
          >
            Upgrade to Gold
          </button>
        </div>
      </div>

      {/* Why Upgrade Section */}
      <div className="mt-20 bg-white border border-gray-200 rounded-3xl p-10 shadow-sm mx-auto max-w-3xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Why upgrade?</h2>
        <p className="text-gray-600 leading-relaxed">
          CollectorConnector is built for collectors, by collectors. When you
          upgrade, you aren't just getting lower fees and better tools—you're
          directly contributing to the growth and sustainability of our
          community.
        </p>
      </div>
    </div>
  );
}
