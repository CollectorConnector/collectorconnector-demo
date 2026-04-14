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

  const getTierIcon = (userId: string) => {
    const stacyId = "8b594b57-fc82-477a-a709-45aec99a228f";
    const foundersIds = ["e0759f79-d113-4af6-a575-cee076037092", "bb088a77-ba12-4fe3-a357-03d13dc0019"];
    
    if (userId === stacyId) return "/icons/tiers/diamond.svg";
    if (foundersIds.includes(userId)) return "/icons/tiers/founder.svg";
    
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
    }} className="no-scrollbar">
      {users.filter(u => u.id !== currentUserId).map((user) => {
        const tierIcon = getTierIcon(user.id);
        const isCustom = user.avatar_url && user.avatar_url.includes('http');
        const displayImg = isCustom ? user.avatar_url : tierIcon;

        return (
          <div key={user.id} style={{
            minWidth: '160px',
            background: '#09090b',
            border: '1px solid #27272a',
            borderRadius: '24px',
            padding: '24px 16px',
            textAlign: 'center'
          }}>
            <Link href={`/profile/${user.id}`} style={{ textDecoration: 'none', display: 'block' }}>
              <img 
                src={displayImg} 
                alt={user.username}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = tierIcon;
                }}
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '20px', 
                  objectFit: isCustom ? 'cover' : 'contain',
                  background: '#18181b',
                  margin: '0 auto 16px',
                  display: 'block',
                  // This ensures icons don't touch the edges but photos do
                  padding: isCustom ? '0' : '20px',
                  boxSizing: 'border-box'
                }} 
              />
              
              <p style={{ 
                color: '#fff', 
                fontSize: '15px', 
                fontWeight: '900', 
                margin: '0 0 4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user.display_url || user.username}
              </p>
              <p style={{ color: '#818cf8', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px' }}>
                @{user.username}
              </p>
            </Link>

            <button style={{
              width: '100%',
              background: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: '14px',
              padding: '10px 0',
              fontSize: '12px',
              fontWeight: '900',
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
