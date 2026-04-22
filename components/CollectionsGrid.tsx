"use client";

import { useRouter } from "next/navigation";

interface CollectionsGridProps {
  items: any[] | null; 
}

export default function CollectionsGrid({ items }: CollectionsGridProps) {
  const router = useRouter();

  if (!items || items.length === 0) {
    return <div className="text-center py-20 font-black text-[#27272a]">NO VAULTS FOR SALE</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map((col) => {
        // Check if any item in this collection is for sale
        const isForSale = col.items?.some((i: any) => i.for_sale);

        return (
          <div 
            key={col.id} 
            onClick={() => router.push(`/collections/${col.id}`)} 
            style={{ 
              background: '#18181b', 
              aspectRatio: '1/1', 
              borderRadius: '32px', 
              border: '1px solid #27272a', 
              position: 'relative', 
              overflow: 'hidden', 
              cursor: 'pointer'
            }}
          >
            {isForSale && (
              <div style={{ 
                position: 'absolute', top: '12px', left: '12px', zIndex: 20, 
                background: '#818cf8', color: '#000', fontSize: '8px', 
                fontWeight: '900', padding: '4px 8px', borderRadius: '10px' 
              }}>
                FOR SALE
              </div>
            )}
            
            {col.items?.[0] && (
              <img 
                src={col.items[0].image_url} 
                alt={col.name}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} 
              />
            )}
            
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginTop: 'auto', marginBottom: '20px' }}>
              <p style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>{col.name}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
