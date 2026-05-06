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
        NO VAULTS FOUND
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {items.map((col) => {
        const coverImage = col.items?.[0]?.image_url || null;
        const count = col.items?.length || 0;

        return (
          <div
            key={col.id}
            onClick={() => router.push(`/collections/${col.id}`)}
            style={{
              background: "#18181b",
              aspectRatio: "1/1",
              borderRadius: "24px",
              border: "1px solid #27272a",
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "16px",
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
                  opacity: 0.5,
                }}
              />
            )}

            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)",
                zIndex: 5,
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 10,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  margin: 0,
                  color: "#fff",
                }}
              >
                {col.title || "Untitled Vault"}
              </p>
              <p
                style={{
                  fontSize: "10px",
                  color: "#e4e4e7",
                  fontWeight: "bold",
                  marginTop: "2px",
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
