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

        return (
          <div 
            key={col.id} 
            // FIX: Pass the collection ID as a query param so the page knows to filter by folder
            onClick={() => router.push(`/collections/${col.user_id}?collection=${col.id}`)} 
            style={{ 
              background: '#18181b', 
              aspectRatio: '1/1', 
              borderRadius: '24px', 
              border: '1px solid #27272a', 
              position: 'relative', 
              overflow: 'hidden', 
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '16px'
            }}
          >
            {isForSale && (
              <div 
                style={{ 
                  position: 'absolute', top: '12px', left: '12px', zIndex: 20, 
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
            
            <div style={{ 
              position: 'absolute', 
              inset: 0, 
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 70%)',
              zIndex: 5 
            }} />
            
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
              <p style={{ 
                fontSize: '13px', 
                fontWeight: '900', 
                textTransform: 'uppercase', 
                letterSpacing: '1px',
                margin: 0,
                color: '#fff'
              }}>
                {col.title || "Untitled Vault"}
              </p>
              <p style={{ fontSize: '10px', color: '#818cf8', fontWeight: 'bold', marginTop: '2px' }}>
                {col.items?.length || 0} ITEMS
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
