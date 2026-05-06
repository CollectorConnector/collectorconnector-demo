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
        const isForSale = col.items?.some((i: any) => i.for_sale);
        const coverImage = col.items?.[0]?.image_url;
        const itemCount = col.items?.length || 0;

        return (
          <div 
            key={col.id} 
            onClick={() => router.push(`/collections/${col.id}`)} 
            style={{ 
              background: '#18181b', 
              aspectRatio: '1/1', 
              borderRadius: '32px', // Matches the deep curves in your screenshot
              border: '1px solid #27272a', 
              position: 'relative', 
              overflow: 'hidden', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center', // Center text vertically
              justifyContent: 'center', // Center text horizontally
              padding: '16px'
            }}
          >
            {/* For Sale Badge */}
            {isForSale && (
              <div 
                style={{ 
                  position: 'absolute', top: '16px', left: '16px', zIndex: 20, 
                  background: '#22c55e', color: '#fff', fontSize: '10px', 
                  fontWeight: '900', padding: '5px 10px', borderRadius: '20px',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                FOR SALE
              </div>
            )}
            
            {/* Background Image Overlay */}
            {coverImage && (
              <img 
                src={coverImage} 
                alt={col.title}
                style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  opacity: 0.6 
                }} 
              />
            )}
            
            {/* Darkening Overlay */}
            <div style={{ 
              position: 'absolute', 
              inset: 0, 
              background: 'rgba(0,0,0,0.4)',
              zIndex: 5 
            }} />
            
            {/* Collection Info */}
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
              <p style={{ 
                fontSize: '14px', 
                fontWeight: '900', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px',
                margin: 0,
                color: '#fff',
                lineHeight: '1.2'
              }}>
                {col.title || "Untitled Vault"}
              </p>
              <p style={{ 
                fontSize: '11px', 
                fontWeight: '800', 
                textTransform: 'uppercase', 
                color: '#818cf8', // Indigo/Purple color from the screenshot
                margin: '4px 0 0 0'
              }}>
                {itemCount} ITEMS
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
