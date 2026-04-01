// components/SellOnEbayModal.tsx
"use client";

import { useState } from "react";

export default function SellOnEbayModal({ item, onClose }) {
  const [price, setPrice] = useState(item.estimatedValue || "");
  const [condition, setCondition] = useState("Like New");
  const [shipping, setShipping] = useState("buyer_pays");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [listingUrl, setListingUrl] = useState<string | null>(null);

  async function handlePublish() {
    setLoading(true);

    // For now: mock call – we’ll wire real eBay later
    const res = await fetch("/api/ebay/list-item", {
      method: "POST",
      body: JSON.stringify({
        itemId: item.id,
        price,
        condition,
        shipping,
      }),
    });

    const data = await res.json();
    setListingUrl(data.listingUrl || null);
    setDone(true);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-full max-w-md rounded-2xl bg-black border border-white/10 p-6">
        {!done ? (
          <>
            {/* Top: item preview */}
            <div className="flex flex-col items-center mb-6">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-24 h-24 object-cover border shadow"
                style={{ borderRadius: "35% / 30%" }}
              />
              <h2 className="mt-4 text-lg font-semibold">{item.name}</h2>
              <p className="mt-1 text-xs text-gray-400">
                List this item on eBay in seconds.
              </p>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-lg bg-[#111] border border-white/10 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full rounded-lg bg-[#111] border border-white/10 px-3 py-2 text-sm"
                >
                  <option>New</option>
                  <option>Like New</option>
                  <option>Good</option>
                  <option>Fair</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Shipping
                </label>
                <select
                  value={shipping}
                  onChange={(e) => setShipping(e.target.value)}
                  className="w-full rounded-lg bg-[#111] border border-white/10 px-3 py-2 text-sm"
                >
                  <option value="buyer_pays">Buyer pays shipping</option>
                  <option value="free_shipping">Free shipping</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-white/20 text-sm"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                className="flex-1 px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold"
                disabled={loading}
              >
                {loading ? "Publishing…" : "Publish to eBay"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-black text-xl">
                ✓
              </div>
              <h2 className="mt-4 text-lg font-semibold">
                Your item is live on eBay
              </h2>
              <p className="mt-1 text-xs text-gray-400 text-center">
                You can manage the listing from your eBay account.
              </p>
            </div>

            {listingUrl && (
              <a
                href={listingUrl}
                target="_blank"
                className="block w-full mb-3 text-center text-sm underline"
              >
                View listing on eBay
              </a>
            )}

            <button
              onClick={onClose}
              className="w-full px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold"
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}
