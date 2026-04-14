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
    
    return "/icons/tiers/collector.svg";   // Default for normal users
  };

  const getAvatarSrc = (user: any) => {
    if (user.avatar_url?.includes("item-images")) {
      return `${user.avatar_url}?t=${Date.now()}`;
    }
    return getTierIcon(user.id);
  };

  const isUserUpload = (avatarUrl?: string) => {
    return !!(avatarUrl && avatarUrl.includes("item-images"));
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
        .map((user) => {
          const tierIcon = getTierIcon(user.id);
          const avatarSrc = getAvatarSrc(user);
          const isUpload = isUserUpload(user.avatar_url);

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
                    background: '#18181b',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  <img 
                    src={avatarSrc} 
                    alt={user.username || "Collector"}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: isUpload ? 'cover' : 'contain',
                      padding: isUpload ? '0' : '20px',
                      boxSizing: 'border-box'
                    }} 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = tierIcon;
                      target.style.padding = '20px';
                      target.style.objectFit = 'contain';
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
                  {user.display_url || user.username || "New Collector"}
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
