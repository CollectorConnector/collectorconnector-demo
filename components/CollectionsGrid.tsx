"use client";

import { useRouter } from "next/navigation";

interface CollectionsGridProps {
  items: any[] | null;
}

/**
 * CollectionsGrid component styled to match the UI in image_17.png
 * Features centered typography, high-impact overlays, and rounded containers.
 */
export default function CollectionsGrid({ items }: CollectionsGridProps) {
  const router = useRouter();

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-20 font-black text-[#27272a] tracking-tighter uppercase">
        No Vaults Found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-black">
      {items.map((col) => {
        // Use the first item's image as the vault cover
        const coverImage = col.items?.[0]?.image_url || null;
        const count = col.items?.length || 0;

        return (
          <div
            key={col.id}
            onClick={() => router.push(`/collections/${col.id}`)}
            className="group relative flex flex-col items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition-transform duration-200"
            style={{
              background: "#121214",
              aspectRatio: "1/1",
              borderRadius: "36px", // Aggressive rounding seen in image_17.png
              border: "1px solid #27272a",
            }}
          >
            {/* Background Cover Image */}
            {coverImage && (
              <img
                src={coverImage}
                alt={col.title}
                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-700"
              />
            )}

            {/* Dark centered overlay for text contrast */}
            <div
              className="absolute inset-0 z-0 bg-black/40"
              style={{
                background: "radial-gradient(circle, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 100%)",
              }}
            />

            {/* Centered Labels */}
            <div className="relative z-10 text-center px-4 pointer-events-none">
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: "900", // Extra bold for that "Lorcana" / "Retro Games" look
                  textTransform: "uppercase",
                  lineHeight: "1.1",
                  letterSpacing: "-0.5px",
                  color: "#ffffff",
                  textShadow: "0px 2px 8px rgba(0,0,0,0.9)",
                }}
              >
                {col.title || "Untitled Vault"}
              </h3>
              
              <p
                style={{
                  fontSize: "11px",
                  color: "#a5b4fc", // Indigo tint for count seen in image_17.png
                  fontWeight: "800",
                  marginTop: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {count} Items
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
