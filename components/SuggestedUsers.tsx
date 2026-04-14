"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function SuggestedUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
    fetchSuggestedUsers();
  }, []);

  async function fetchSuggestedUsers() {
    try {
      // Fetching active collectors
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_url, avatar_url")
        .limit(10);

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching suggested users:", err);
    } finally {
      setLoading(false);
    }
  }

  // Helper to determine the tier icon based on ID (matching your profile logic)
  const getTierIcon = (userId: string) => {
    const stacyId = "8b594b57-fc82-477a-a709-45aec99a228f";
    const foundersIds = ["e0759f79-d113-4af6-a575-cee076037092", "bb088a77-ba12-4fe3-a357-03d13dc0019"];
    
    if (userId === stacyId) return "/icons/tiers/diamond.svg";
    if (foundersIds.includes(userId)) return "/icons/tiers/founder.svg";
    
    // Default fallback for general collectors
    return "/icons/tiers/collector.svg";
  };

  if (loading) return null;

  return (
    <div style={{ 
      display: 'flex', 
      overflowX: 'auto', 
      gap: '12px', 
      paddingBottom: '10px',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }} className="no-scrollbar">
      {users.filter(u => u.id !== currentUserId).map((user) => {
        const fallbackIcon = getTierIcon(user.id);
        
        return (
          <div key={user.id} style={{
            minWidth: '160px',
            background: '#09090b',
            border: '1px solid #27272a',
            borderRadius: '24px',
            padding: '20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Link href={`/profile/${user.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ width: '80px', height: '80px', marginBottom: '12px', position: 'relative' }}>
                <img 
                  src={user.avatar_url || fallbackIcon} 
                  alt={user.username}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== window.location.origin + fallbackIcon) {
                      target.src = fallbackIcon;
                    }
                  }}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    borderRadius: '16px', 
                    objectFit: 'cover',
                    background: '#18181b',
                    padding: user.avatar_url ? '0' : '15px' // Adds a little padding if it's an SVG icon
                  }} 
                />
              </div>
              <p style={{ 
                color: '#fff', 
                fontSize: '14px', 
                fontWeight: '900', 
                margin: '0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '120px'
              }}>
                {user.display_url || "New Collector"}
              </p>
              <p style={{ color: '#818cf8', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
                @{user.username}
              </p>
            </Link>

            <button style={{
              width: '100%',
              background: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: '12px',
              padding: '8px 0',
              fontSize: '12px',
              fontWeight: '900',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}>
              Follow
            </button>
          </div>
        );
      })}
    </div>
  );
}
