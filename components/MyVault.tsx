// components/MyVault.tsx
"use client";

import React, { useEffect, useState } from "react";

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
  const [loading, setLoading] = useState<boolean>(!initial && !!userId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || initial) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    const uid: string = userId;

    (async function load() {
      try {
        const res = await fetch(`/api/vault-stats?userId=${encodeURIComponent(uid)}`);
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        const json = await res.json();
        if (!mounted) return;
        setStats({
          itemsCount: Number(json.itemsCount ?? 0),
          categoriesCount: Number(json.categoriesCount ?? 0),
          rarityScore: Number(json.rarityScore ?? 0),
          topCategories: Array.isArray(json.topCategories) ? json.topCategories : DEFAULT_CATEGORIES,
        });
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Failed to load vault stats");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userId, initial]);

  const categories = stats?.topCategories ?? DEFAULT_CATEGORIES;

  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">My Vault</h2>
          <p className="text-sm text-gray-500">Overview of your collection</p>
        </div>

        <div>
          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : error ? (
            <div className="text-sm text-red-500">Error: {error}</div>
          ) : stats ? (
            <div className="flex gap-6 items-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.itemsCount.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.categoriesCount}</div>
                <div className="text-xs text-gray-500">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(stats.rarityScore)}</div>
                <div className="text-xs text-gray-500">Rarity</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No data</div>
          )}
        </div>
      </div>

      <hr className="my-4" />

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button key={c} className="px-3 py-1 bg-gray-100 rounded text-sm">
            {c}
          </button>
        ))}
      </div>
    </section>
  );
}
