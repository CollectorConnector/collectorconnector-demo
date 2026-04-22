// components/MyVault.tsx
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; 

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
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(!initial && !!userId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchData() {
      setLoading(true);
      
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

  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">My Vault</h2>
          <p className="text-sm text-gray-500">Overview of your collection</p>
        </div>
      </div>

      <hr className="my-4" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {items.map((item) => (
          <div key={item.id} className="relative border rounded-lg p-3 flex flex-col">
            <img src={item.image_url} alt={item.name} className="w-full h-32 object-cover rounded" />
            <p className="font-medium mt-2 mb-3">{item.name}</p>
            
            <button
              onClick={() => toggleSaleStatus(item)}
              className={`mt-auto flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg transition-colors text-white ${
                item.for_sale ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="text-sm font-medium">
                {item.for_sale ? "For Sale" : "Mark For Sale"}
              </span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
