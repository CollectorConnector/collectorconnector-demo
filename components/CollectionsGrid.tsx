"use client";

import { useRouter } from "next/navigation";

interface CollectionsGridProps {
  items: any[] | null;
}

export default function CollectionsGrid({ items }: CollectionsGridProps) {
  const router = useRouter();

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-20 font-black text-[#27272a] tracking-tighter">
        NO COLLECTIONS FOUND
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {items.map((col) => {
        const coverImage =
          col.cover_url ||
          col.items?.[0]?.image_url ||
          null;

        const count =
          col.items?.length ??
          col.item_count ??
          0;

        return (
          <div
            key={col.id}
            onClick={() => router.push(`/collections/${col.id}`)}
            style={{
              width: "100%",
              height: 190, // ⭐ matches your screenshot
              borderRadius: 24,
              border: "1px solid #27272a",
              background: "#18181b",
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              padding: 12,
              display: "flex",
              alignItems: "flex-end",
            }}
          >
            {coverImage && (
              <img
                src={coverImage}
                alt={col.title}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.65,
                }}
              />
            )}

            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)",
                zIndex: 5,
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 10,
                textAlign: "left",
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  margin: 0,
                  color: "#fff",
                }}
              >
                {col.title}
              </p>

              <p
                style={{
                  fontSize: 11,
                  color: "#e4e4e7",
                  fontWeight: 700,
                  marginTop: 2,
                }}
              >
                {count} ITEMS
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
