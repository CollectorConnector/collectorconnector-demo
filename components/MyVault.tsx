// components/MyVault.tsx
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // Ensure this path is correct

export type VaultStats = {
  itemsCount: number;
  categoriesCount: number;
  rarityScore: number;
  topCategories?: string[];
};

type Props = {
  userId?: string;
  initial?: VaultStats | null;
};

const DEFAULT_CATEGORIES = ["Cards", "Watches", "Coins", "Memorabilia"];

export default function MyVault({ userId, initial = null }: Props) {
  const [stats, setStats] = useState<VaultStats | null>(initial);
  const [items, setItems] = useState<any[]>([]); // New state for items
  const [loading, setLoading] = useState<boolean>(!initial && !!userId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchData() {
      setLoading(true);
      
      // 1. Fetch Stats
      const statsRes = await fetch(`/api/vault-stats?userId=${encodeURIComponent(userId!)}`);
      if (statsRes.ok) {
        const json = await statsRes.json();
        setStats({
          itemsCount: Number(json.itemsCount ?? 0),
          categoriesCount: Number(json.categoriesCount ?? 0),
          rarityScore: Number(json.rarityScore ?? 0),
          topCategories: Array.isArray(json.topCategories) ? json.topCategories : DEFAULT_CATEGORIES,
        });
      }

      // 2. Fetch Items for the Vault
      const { data: itemsData } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', userId);
      
      if (itemsData) setItems(itemsData);
      setLoading(false);
    }

    fetchData();
  }, [userId, initial]);

  const toggleSaleStatus = async (item: any) => {
    const { error } = await supabase
      .from('items')
      .update({ for_sale: !item.for_sale })
      .eq('id', item.id);
      
    if (!error) {
      setItems(items.map(i => i.id === item.id ? { ...i, for_sale: !i.for_sale } : i));
    }
  };

  const categories = stats?.topCategories ?? DEFAULT_CATEGORIES;

  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      {/* ... Existing Stats UI ... */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">My Vault</h2>
          <p className="text-sm text-gray-500">Overview of your collection</p>
        </div>
        {/* ... Stats display code remains the same ... */}
      </div>

      <hr className="my-4" />

      {/* Item Display with Toggle */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {items.map((item) => (
          <div key={item.id} className="relative border rounded-lg p-2">
            <img src={item.image_url} alt={item.name} className="w-full h-32 object-cover rounded" />
            <p className="font-medium mt-2">{item.name}</p>
            
            <button
              onClick={() => toggleSaleStatus(item)}
              className={`mt-2 p-2 rounded-full ${item.for_sale ? 'bg-green-500' : 'bg-blue-500'}`}
              title={item.for_sale ? "Remove from Sale" : "Mark for Sale"}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="white" strokeWidth="2" fill="none">
                <path d="M12 2v20M2 12h20" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
