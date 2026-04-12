"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type SuggestedUser = {
  id: string;
  display_url: string | null;
  username: string | null;
  avatar_url: string | null;
  tier: string | null;
};

export default function SuggestedUsers() {
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const router = useRouter();

  // Update this to match your EXACT folder structure in /public
  // If your icons are just in /public/collector.svg, remove the "/icons/tiers" part.
  const getTierIcon = (tier: string | null) => {
    const tierName = tier?.toLowerCase() || 'collector';
    return `/icons/tiers/${tierName}.svg`; 
  };

  useEffect(() => {
    async function loadUsers() {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_url, username, avatar_url, tier")
        .limit(10);

      if (data) setUsers(data as SuggestedUser[]);
    }
    loadUsers();
  }, []);

  if (users.length === 0) return null;

  return (
    <section style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '900', letterSpacing: '1px', color: '#a1a1aa' }}>
          SUGGESTED COLLECTORS
        </h2>
        <span style={{ fontSize: '11px', color: '#818cf8', fontWeight: 'bold', cursor: 'pointer' }}>
          VIEW ALL
        </span>
      </div>

      <div 
        style={{ 
          display: 'flex', 
          gap: '12px', 
          overflowX: 'auto', 
          paddingBottom: '15px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }} 
        className="hide-scrollbar"
      >
        {users.map((u) => {
          const tierIcon = getTierIcon(u.tier);
          
          return (
            <div
              key={u.id}
              style={{ 
                minWidth: '160px', 
                background: '#09090b', 
                border: '1px solid #27272a', 
                borderRadius: '24px', 
                padding: '20px 16px', 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onClick={() => router.push(`/profile/${u.id}`)}
            >
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <img 
                  src={u.avatar_url || tierIcon} 
                  onError={(e) => { 
                    const target = e.target as HTMLImageElement;
                    // Log the failure to your browser console (F12) to see the broken path
                    console.error("Image load failed for path:", target.src);
                    
                    // If the avatar failed, try the tier icon
                    if (target.src !== window.location.origin + tierIcon) {
                      target.src = tierIcon;
                    } else {
                      // Final safety: if even the tier icon fails, use a generic fallback
                      target.src = "/default-user-icon.svg"; 
                    }
                  }}
                  style={{ 
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '18px', 
                    objectFit: 'cover', 
                    border: '2px solid #18181b',
                    background: '#18181b',
                    // Logic: If it's a tier icon (no avatar), add padding so the SVG doesn't hit the edges
                    padding: u.avatar_url ? '0' : '12px'
                  }} 
                  alt={u.username || "Collector"}
                />
              </div>
              
              <p style={{ 
                fontSize: '13px', 
                fontWeight: '800', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                width: '100%',
                marginBottom: '2px'
              }}>
                {u.display_url || u.username}
              </p>
              
              <p style={{ fontSize: '11px', color: '#818cf8', fontWeight: '600', marginBottom: '16px' }}>
                @{u.username || "collector"}
              </p>

              <button style={{ 
                width: '100%', 
                background: '#fff', 
                color: '#000', 
                fontSize: '11px', 
                fontWeight: '900', 
                padding: '8px 0', 
                borderRadius: '12px',
                border: 'none',
                letterSpacing: '0.5px'
              }}>
                FOLLOW
              </button>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
