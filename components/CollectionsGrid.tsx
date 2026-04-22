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
            {/* Updated For Sale Button Area */}
            {isForSale && (
              <button 
                onClick={(e) => { e.stopPropagation(); /* Add your sale-view navigation or logic here */ }}
                style={{ 
                  position: 'absolute', top: '12px', left: '12px', zIndex: 20, 
                  background: '#22c55e', color: '#fff', fontSize: '10px', 
                  fontWeight: '700', padding: '6px 10px', borderRadius: '16px',
                  display: 'flex', alignItems: 'center', gap: '4px', border: 'none'
                }}
              >
                <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                FOR SALE
              </button>
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
