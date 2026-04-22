"use client";

import React from "react";

export default function UpgradePage() {
  async function subscribe(tier) {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      body: JSON.stringify({ tier }),
    });

    const data = await res.json();
    window.location.href = data.url;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <h1 className="text-3xl font-bold text-center mb-4">
        Upgrade Your Selling Power
      </h1>
      <p className="text-center text-gray-600 mb-10">
        Lower fees. More perks. Bigger reach.  
        Support the platform and unlock more selling tools over time.
      </p>

      {/* Why Upgrade */}
      <div className="bg-gray-100 rounded-xl p-5 mb-10">
        <h2 className="text-xl font-semibold mb-2">Why upgrade?</h2>
        <p className="text-gray-700">
          Upgrading reduces your selling fees and unlocks more power as a seller.
          CollectorConnector is built for collectors, by collectors — your
          subscription helps keep the platform running, improves features, and
          supports the community.
        </p>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bronze */}
        <div className="border rounded-xl p-6 shadow-sm bg-white">
          <h3 className="text-2xl font-bold mb-2">Bronze</h3>
          <p className="text-gray-600 mb-4">£4.99 / month</p>
          <ul className="text-gray-700 mb-6 space-y-2">
            <li>• 7% selling fee</li>
            <li>• Early access to new features</li>
            <li>• Support the platform</li>
          </ul>
          <button
            onClick={() => subscribe("bronze")}
            className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600"
          >
            Upgrade to Bronze
          </button>
        </div>

        {/* Silver */}
        <div className="border rounded-xl p-6 shadow-sm bg-white">
          <h3 className="text-2xl font-bold mb-2">Silver</h3>
          <p className="text-gray-600 mb-4">£9.99 / month</p>
          <ul className="text-gray-700 mb-6 space-y-2">
            <li>• 6% selling fee</li>
            <li>• Priority support</li>
            <li>• Early access to new features</li>
            <li>• More perks coming soon</li>
          </ul>
          <button
            onClick={() => subscribe("silver")}
            className="w-full bg-gray-700 text-white py-2 rounded-lg font-semibold hover:bg-gray-800"
          >
            Upgrade to Silver
          </button>
        </div>

        {/* Gold */}
        <div className="border rounded-xl p-6 shadow-sm bg-white">
          <h3 className="text-2xl font-bold mb-2">Gold</h3>
          <p className="text-gray-600 mb-4">£19.99 / month</p>
          <ul className="text-gray-700 mb-6 space-y-2">
            <li>• 5% selling fee</li>
            <li>• Priority support</li>
            <li>• Listing boost</li>
            <li>• Early access to new features</li>
            <li>• More perks coming soon</li>
          </ul>
          <button
            onClick={() => subscribe("gold")}
            className="w-full bg-yellow-500 text-white py-2 rounded-lg font-semibold hover:bg-yellow-600"
          >
            Upgrade to Gold
          </button>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="mt-10 bg-blue-50 border border-blue-200 p-5 rounded-xl text-center">
        <p className="text-blue-700 font-medium">
          More perks coming soon — subscribers get new features first.
        </p>
      </div>
    </div>
  );
}
