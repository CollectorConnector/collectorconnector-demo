"use client";

import React from "react";
import Image from "next/image";

// Assuming these are standard SVG icons for your checkmarks
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
      strokeWidth={2}
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
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Header with Logo */}
      <div className="flex flex-col items-center mb-16">
        <Image
          src="/public/CC-main-logo.png"
          alt="CollectorConnector Logo"
          width={180}
          height={60}
          className="mb-8"
        />
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 text-center tracking-tight">
          Upgrade Your Selling Power
        </h1>
        <p className="text-xl text-gray-600 text-center max-w-2xl">
          Lower fees, bigger reach, and exclusive tools. Support the platform and
          unlock your full potential as a collector.
        </p>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Bronze */}
        <div className="border border-gray-200 rounded-2xl p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Bronze</h3>
          <div className="text-4xl font-extrabold text-orange-500 mb-6">
            £4.99<span className="text-lg font-normal text-gray-500">/mo</span>
          </div>
          <ul className="text-gray-700 mb-8 space-y-4">
            <li className="flex items-center"><CheckIcon /> 7% selling fee</li>
            <li className="flex items-center"><CheckIcon /> Early access to features</li>
            <li className="flex items-center"><CheckIcon /> Support the platform</li>
          </ul>
          <button
            onClick={() => subscribe("bronze")}
            className="w-full bg-orange-100 text-orange-700 py-3 rounded-xl font-bold hover:bg-orange-200 transition-colors"
          >
            Choose Bronze
          </button>
        </div>

        {/* Silver (Featured) */}
        <div className="border-2 border-gray-800 rounded-2xl p-8 bg-gray-900 shadow-xl relative scale-105">
          <div className="absolute top-0 right-0 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg uppercase tracking-wider">
            Popular
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Silver</h3>
          <div className="text-4xl font-extrabold text-white mb-6">
            £9.99<span className="text-lg font-normal text-gray-400">/mo</span>
          </div>
          <ul className="text-gray-200 mb-8 space-y-4">
            <li className="flex items-center"><CheckIcon /> 6% selling fee</li>
            <li className="flex items-center"><CheckIcon /> Priority support</li>
            <li className="flex items-center"><CheckIcon /> Early access to features</li>
            <li className="flex items-center"><CheckIcon /> More perks coming soon</li>
          </ul>
          <button
            onClick={() => subscribe("silver")}
            className="w-full bg-white text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
          >
            Choose Silver
          </button>
        </div>

        {/* Gold */}
        <div className="border border-gray-200 rounded-2xl p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Gold</h3>
          <div className="text-4xl font-extrabold text-yellow-500 mb-6">
            £19.99<span className="text-lg font-normal text-gray-500">/mo</span>
          </div>
          <ul className="text-gray-700 mb-8 space-y-4">
            <li className="flex items-center"><CheckIcon /> 5% selling fee</li>
            <li className="flex items-center"><CheckIcon /> Priority support</li>
            <li className="flex items-center"><CheckIcon /> Listing boost</li>
            <li className="flex items-center"><CheckIcon /> Early access to features</li>
          </ul>
          <button
            onClick={() => subscribe("gold")}
            className="w-full bg-yellow-500 text-white py-3 rounded-xl font-bold hover:bg-yellow-600 transition-colors"
          >
            Choose Gold
          </button>
        </div>
      </div>

      {/* Why Upgrade Section */}
      <div className="mt-20 bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Why upgrade?</h2>
        <p className="text-gray-600 leading-relaxed max-w-3xl">
          CollectorConnector is built for collectors, by collectors. When you
          upgrade, you aren't just getting lower fees and better tools—you're
          directly contributing to the growth and sustainability of our
          community, ensuring we can keep building the features you care about
          most.
        </p>
      </div>
    </div>
  );
}
