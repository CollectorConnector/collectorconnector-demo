// components/MyVault.tsx
"use client";

import React, { useEffect, useState } from "react";

export type VaultStats = {
  itemsCount: number;
  categoriesCount: number;
  rarityScore: number; // e.g., 90.8
  topCategories?: string[]; // optional override
};

type Props = {
  userId?: string; // optional: if provided, component can fetch live data
  initial?: VaultStats | null;
  onCategorySelect?: (category: string) => void;
  className?: string;
};

const DEFAULT_CATEGORIES = ["Cards", "Watches", "Coins", "Memorabilia"];

export default function MyVault({ userId, initial = null, onCategorySelect, className = "" }: Props) {
  const [stats, setStats] = useState<VaultStats | null>(initial);
  const [loading, setLoading] = useState<boolean>(!initial && !!userId);
  const [error, setError] = useState<string | null>(null);
  const categories = stats?.topCategories ?? DEFAULT_CATEGORIES;

  useEffect(() => {
    if (!userId || initial) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const res = await fetch(`/api/vault-stats?userId=${encodeURIComponent(userId)}`);
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        const json = await res.json();
        if (!mounted) return;
        setStats({
          itemsCount: json.itemsCount ?? 0,
          categoriesCount: json.categoriesCount ?? 0,
          rarityScore: json.rarityScore ?? 0,
          topCategories: json.topCategories ?? DEFAULT_CATEGORIES,
        });
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Failed to load vault stats");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [userId, initial]);

  function handleCategoryClick(cat: string) {
    onCategorySelect?.(cat);
  }

  return (
    <section aria-labelledby="my-vault-heading" className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 id="my-vault-heading" className="text-lg font-semibold text-gray-900">
            My Vault
          </h2>
          <p className="mt-1 text-sm text-gray-500">Overview of your collection</p>
        </div>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : error ? (
            <div className="text-sm text-red-500">Error: {error}</div>
          ) : stats ? (
            <div className="flex gap-4">
              <Stat label="Items" value={stats.itemsCount.toLocaleString()} />
              <Stat label="Categories" value={stats.categoriesCount.toString()} />
              <Stat label="Rarity Score" value={stats.rarityScore.toFixed(1)} />
            </div>
          ) : (
            <div className="text-sm text-gray-500">No data</div>
          )}
        </div>
      </div>

      <hr className="my-5" />

      <div>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-pressed="false"
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing top categories. Use the category buttons to filter the list below.
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center min-w-[88px]">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
