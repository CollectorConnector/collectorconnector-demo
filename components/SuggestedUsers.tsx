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
      // Fetch users and their creation order to determine rank silently
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_url, avatar_url, created_at")
        .order("created_at", { ascending: true })
        .limit(15);

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching suggested users:", err);
    } finally {
      setLoading(false);
    }
  }

  // Helper to determine rank based on the same logic as ProfilePage
  const getRank = (userId: string, index: number) => {
    const stacyId = "8b594b57-fc82-477a-a709-45aec99a228f";
    if (userId === stacyId) return "diamond";
    if (index >= 3 && index < 13) return "gold";
    if (index >= 13 && index < 23) return "silver";
    return "collector";
  };

  if (loading) return null;

  return (
    <div 
      style={{ 
        display: 'flex', 
        overflowX: 'auto', 
        gap: '12px', 
        paddingBottom: '10px',
        scrollbarWidth: 'none',
      }} 
      className="no-scrollbar"
    >
      {users
        .filter(u => u.id !== currentUserId)
        .map((user, idx) => {
          const rank = getRank(user.id, idx);
          const tierIconPath = `/icons/tiers/${rank}.svg`;
          const hasValidAvatar = user.avatar_url && user.avatar_url !== "null";

          return (
            <div 
              key={user.id} 
              style={{
                minWidth: '160px',
                background: '#09090b',
                border: '1px solid #27272a',
                borderRadius: '24px',
                padding: '24px 16px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0
              }}
            >
              <Link href={`/profile/${user.id}`} style={{ textDecoration: 'none', width: '100%' }}>
                <div 
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    margin: '0 auto 12px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: '#18181b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img 
                    src={hasValidAvatar ? user.avatar_url : tierIconPath} 
                    alt={user.username}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = tierIconPath;
                      target.style.padding = '18px';
                      target.style.objectFit = 'contain';
                    }}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: hasValidAvatar ? 'cover' : 'contain',
                      padding: hasValidAvatar ? '0' : '18px'
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
                  textOverflow: 'ellipsis'
                }}>
                  {user.display_url || user.username || "Collector"}
                </p>
                <p style={{ color: '#818cf8', fontSize: '11px', fontWeight: 'bold', marginBottom: '16px' }}>
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
                fontSize: '11px',
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
