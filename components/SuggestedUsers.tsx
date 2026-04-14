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

  const stringToColor = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 85%, 60%)`;
  };

  const getAvatarSrc = (user: any) => {
    if (user.avatar_url && user.avatar_url.startsWith('http')) {
      return user.avatar_url;
    }
    return null; 
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
          const avatarSrc = getAvatarSrc(user);
          const isUpload = !!avatarSrc;
          const gradientColor = stringToColor(user.username || user.id);
          const initial = (user.username || "N")[0].toUpperCase();

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
                flexShrink: 0,
                position: 'relative'
              }}
            >
              {/* Entire top area is now a link to the profile ID */}
              <Link href={`/profile/${user.id}`} style={{ textDecoration: 'none', width: '100%', cursor: 'pointer' }}>
                <div 
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    margin: '0 auto 12px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: isUpload ? '#18181b' : gradientColor,
                  }}
                >
                  {isUpload ? (
                    <img 
                      src={avatarSrc} 
                      alt={user.username}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover'
                      }} 
                    />
                  ) : (
                    <div 
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        fontWeight: '900',
                        color: '#fff',
                      }}
                    >
                      {initial}
                    </div>
                  )}
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
