"use client";

import React from "react";
import Image from "next/image";

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
    const res = await fetch(`/api/stripe/upgrade?plan=${tier}`, {
      method: "POST",
    });

    const data = await res.json();

    if (data?.url) {
      window.location.href = data.url;
    } else {
      alert("Unable to start subscription. Please try again.");
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-20">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-2">
          Upgrade Your Selling Power
        </h1>

        <p className="text-md md:text-lg text-gray-500 mb-6">
          Choose the tier that matches your goals
        </p>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed">
          Lower fees. More perks. Bigger reach.  
          Support the platform and unlock more selling tools over time.
        </p>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
        {/* Bronze */}
        <div className="border border-gray-200 rounded-3xl p-10 bg-white shadow-sm hover:shadow-xl transition-all flex flex-col items-center">
          <Image
            src="/bronze.png"
            alt="Bronze Tier"
            width={70}
            height={70}
            className="mb-4"
          />

          <h3 className="text-2xl font-bold text-gray-900 mb-2">Bronze</h3>
          <p className="text-4xl font-extrabold text-orange-500 mb-6">
            £4.99<span className="text-lg font-normal text-gray-500">/mo</span>
          </p>

          <ul className="text-gray-700 mb-10 space-y-3">
            <li className="flex items-center justify-center"><CheckIcon /> 7% selling fee</li>
            <li className="flex items-center justify-center"><CheckIcon /> Early access to features</li>
            <li className="flex items-center justify-center"><CheckIcon /> Support the platform</li>
          </ul>

          <button
            onClick={() => subscribe("bronze")}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors"
          >
            Upgrade to Bronze
          </button>
        </div>

        {/* Silver */}
        <div className="border-2 border-gray-900 rounded-3xl p-10 bg-gray-900 shadow-2xl relative flex flex-col items-center md:-mt-6">
          <div className="absolute -top-4 bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-md">
            Best Value
          </div>

          <Image
            src="/silver.png"
            alt="Silver Tier"
            width={70}
            height={70}
            className="mb-4"
          />

          <h3 className="text-2xl font-bold text-white mb-2">Silver</h3>
          <p className="text-4xl font-extrabold text-white mb-6">
            £9.99<span className="text-lg font-normal text-gray-400">/mo</span>
          </p>

          <ul className="text-gray-200 mb-10 space-y-3">
            <li className="flex items-center justify-center"><CheckIcon /> 6% selling fee</li>
            <li className="flex items-center justify-center"><CheckIcon /> Priority support</li>
            <li className="flex items-center justify-center"><CheckIcon /> Early access to features</li>
          </ul>

          <button
            onClick={() => subscribe("silver")}
            className="w-full bg-white text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
          >
            Upgrade to Silver
          </button>
        </div>

        {/* Gold */}
        <div className="border border-gray-200 rounded-3xl p-10 bg-white shadow-sm hover:shadow-xl transition-all flex flex-col items-center">
          <Image
            src="/gold.png"
            alt="Gold Tier"
            width={70}
            height={70}
            className="mb-4"
          />

          <h3 className="text-2xl font-bold text-gray-900 mb-2">Gold</h3>
          <p className="text-4xl font-extrabold text-yellow-500 mb-6">
            £19.99<span className="text-lg font-normal text-gray-500">/mo</span>
          </p>

          <ul className="text-gray-700 mb-10 space-y-3">
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

      {/* Why Upgrade */}
      <div className="mt-24 bg-white border border-gray-200 rounded-3xl p-12 shadow-sm mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">Why upgrade?</h2>
        <p className="text-gray-600 leading-relaxed text-lg max-w-2xl mx-auto">
          CollectorConnector is built for collectors, by collectors.  
          When you upgrade, you’re not just getting lower fees —  
          you’re directly supporting the growth, sustainability, and future of the platform.
        </p>
      </div>
    </div>
  );
}
