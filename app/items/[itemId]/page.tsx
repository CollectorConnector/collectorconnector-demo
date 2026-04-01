// app/items/[itemId]/page.tsx (simplified)
"use client";

import { useState } from "react";
import SellOnEbayModal from "@/components/SellOnEbayModal";

export default function ItemPage() {
  const [showSellModal, setShowSellModal] = useState(false);

  // You’ll already have this from your existing page
  const item = {
    id: "item-123",
    name: "Charizard 1st Edition",
    imageUrl: "/some-image.jpg",
    estimatedValue: 250,
  };

  return (
    <div className="p-6 text-white">
      {/* existing item UI here */}

      <button
        onClick={() => setShowSellModal(true)}
        className="mt-4 px-4 py-2 rounded-lg border border-white text-white"
      >
        Sell on eBay
      </button>

      {showSellModal && (
        <SellOnEbayModal
          item={item}
          onClose={() => setShowSellModal(false)}
        />
      )}
    </div>
  );
}
