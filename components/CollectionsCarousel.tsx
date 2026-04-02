"use client";

import { useRouter } from "next/navigation";

type Collection = {
  id: string;
  title: string;
  cover_url: string | null;
  item_count: number | null;
};

export default function CollectionsCarousel({ collections }: { collections: Collection[] }) {
  const router = useRouter();

  if (!collections || collections.length === 0) {
    return (
      <p className="text-center text-zinc-500 text-xl py-12">
        No collections yet. Create your first one!
      </p>
    );
  }

  return (
    <div
      className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide"
      style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}
    >
      {collections.map((col) => (
        <div
          key={col.id}
          className="relative w-48 h-64 flex-shrink-0 snap-center rounded-2xl overflow-hidden cursor-pointer group"
          onClick={() => router.push(`/collections/${col.id}`)}
        >
          <img
            src={col.cover_url || "/CC-main-logo.png"}
            alt={col.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Item count badge */}
          <div className="absolute top-2 right-2 bg-black/60 text-xs px-2 py-1 rounded-lg border border-white/10">
            {col.item_count || 0}
          </div>

          {/* Title */}
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white text-lg font-semibold tracking-tight line-clamp-1">
              {col.title}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
