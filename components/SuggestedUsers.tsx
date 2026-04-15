"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function SuggestedUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [myFollowing, setMyFollowing] = useState<string[]>([]); // Track who you already follow
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id || null;
      setCurrentUserId(userId);

      if (userId) {
        fetchMyFollowing(userId);
      }
      fetchSuggestedUsers();
    }
    init();
  }, []);

  // Fetch the current user's following list to check for existing relationships
  async function fetchMyFollowing(userId: string) {
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (data) {
      setMyFollowing(data.map(f => f.following_id));
    }
  }

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

  // Handle clicking Follow/Following
  async function handleFollowToggle(targetUserId: string) {
    if (!currentUserId) return;

    const isFollowing = myFollowing.includes(targetUserId);

    if (isFollowing) {
      // Unfollow logic
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId);

      if (!error) {
        setMyFollowing(prev => prev.filter(id => id !== targetUserId));
      }
    } else {
      // Follow logic
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, following_id: targetUserId });

      if (!error) {
        setMyFollowing(prev => [...prev, targetUserId]);
      }
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
          const isFollowing = myFollowing.includes(user.id);
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
                    background: user.avatar_url ? '#18181b' : gradientColor,
                  }}
                >
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '900', color: '#fff' }}>
                      {initial}
                    </div>
                  )}
                </div>
                
                <p style={{ color: '#fff', fontSize: '14px', fontWeight: '900', margin: '0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.display_url || user.username || "New Collector"}
                </p>
                <p style={{ color: '#818cf8', fontSize: '11px', fontWeight: 'bold', marginBottom: '16px' }}>
                  @{user.username}
                </p>
              </Link>

              <button 
                onClick={() => handleFollowToggle(user.id)}
                style={{ 
                  width: '100%', 
                  background: isFollowing ? '#18181b' : '#fff', 
                  color: isFollowing ? '#fff' : '#000', 
                  border: isFollowing ? '1px solid #27272a' : 'none', 
                  borderRadius: '12px', 
                  padding: '8px 0', 
                  fontSize: '11px', 
                  fontWeight: '900', 
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          );
        })}
    </div>
  );
}
