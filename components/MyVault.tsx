// components/MyVault.tsx
"use client";

import React, { useEffect, useState } from "react";

export type VaultStats = {
  itemsCount: number;
  categoriesCount: number;
  rarityScore: number; // 0..100
  topCategories?: string[];
};

type Props = {
  userId?: string;
  initial?: VaultStats | null;
  onCategorySelect?: (category: string) => void;
  className?: string;
  chartSize?: number;
  chartStroke?: number;
  animate?: boolean;
};

const DEFAULT_CATEGORIES = ["Cards", "Watches", "Coins", "Memorabilia"];

export default function MyVault({
  userId,
  initial = null,
  onCategorySelect,
  className = "",
  chartSize = 96,
  chartStroke = 12,
  animate = true,
}: Props) {
  const [stats, setStats] = useState<VaultStats | null>(initial);
  const [loading, setLoading] = useState<boolean>(!initial && !!userId);
  const [error, setError] = useState<string | null>(null);
  const categories = stats?.topCategories ?? DEFAULT_CATEGORIES;

  useEffect(() => {
    if (!userId || initial) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    const uid: string = userId;

    async function load() {
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
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
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
            <div className="flex items-center gap-4">
              <div className="flex gap-4 items-center">
                <Stat label="Items" value={stats.itemsCount.toLocaleString()} />
                <Stat label="Categories" value={stats.categoriesCount.toString()} />
              </div>

              <div className="flex items-center gap-3">
                <Donut
                  value={clamp(stats.rarityScore, 0, 100)}
                  size={chartSize}
                  stroke={chartStroke}
                  animate={animate}
                  label={`Rarity ${stats.rarityScore.toFixed(1)}`}
                />
                <div className="text-sm text-gray-600">
                  <div className="font-medium text-gray-900">{stats.rarityScore.toFixed(1)}</div>
                  <div className="text-xs">Rarity Score</div>
                </div>
              </div>
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

function Donut({ value, size, stroke, animate, label }: { value: number; size: number; stroke: number; animate: boolean; label?: string }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - pct / 100);
  const color = pct >= 75 ? "#16a34a" : pct >= 40 ? "#f59e0b" : "#6b7280";
  const bgColor = "#e6e6e6";
  const transition = animate ? { transition: "stroke-dashoffset 900ms ease-out, stroke 300ms" } : {};

  return (
    <svg role="img" aria-label={label ?? `Value ${value}`} width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="inline-block">
      <title>{label ?? `Value ${value}`}</title>
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle r={radius} fill="transparent" stroke={bgColor} strokeWidth={stroke} strokeLinecap="round" />
        <circle
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          style={transition as React.CSSProperties}
          transform="rotate(-90)"
        />
        <text x="0" y="4" textAnchor="middle" fontSize={Math.max(10, size * 0.16)} fill="#111827" className="font-medium">
          {Math.round(pct)}%
        </text>
      </g>
    </svg>
  );
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
