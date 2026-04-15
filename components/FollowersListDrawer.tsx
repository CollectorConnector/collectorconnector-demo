"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface UserProfile {
  id: string;
  username: string;
  display_url: string;
  avatar_url: string;
}

interface FollowersListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  mode: "followers" | "following";
  userRankFallback?: string;
}

export default function FollowersListDrawer({ isOpen, onClose, userId, mode, userRankFallback }: FollowersListDrawerProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper to get a consistent gradient based on User ID
  const getAvatarGradient = (id: string) => {
    const gradients = [
      'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', // Green/Blue
      'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', // Yellow/Orange
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', // Purple/Pink
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // Soft Red
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Deep Indigo
    ];
    // Simple logic to ensure the same user always gets the same color
    const charSum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[charSum % gradients.length];
  };

  useEffect(() => {
    if (!isOpen || !userId) return;
    loadListData();
  }, [isOpen, userId, mode]);

  async function loadListData() {
    setLoading(true);
    setUsers([]);

    let table = "follows";
    let matchField = mode === "followers" ? "following_id" : "follower_id";
    let fetchField = mode === "followers" ? "follower_id" : "following_id";

    try {
      const { data: followData, error: followError } = await supabase
        .from(table)
        .select(`${fetchField}`)
        .eq(matchField, userId);

      if (followError) throw followError;

      if (followData && followData.length > 0) {
        const targetIds = followData.map((f: any) => f[fetchField]);

        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, display_url, avatar_url")
          .in("id", targetIds);

        if (profileError) throw profileError;
        setUsers(profiles || []);
      }
    } catch (err: any) {
      console.error(`Error loading ${mode}:`, err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const title = mode === "followers" ? "FOLLOWERS" : "FOLLOWING";

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        zIndex: 6000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#09090b',
          border: '1px solid #27272a',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '480px',
          height: '80vh',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          cursor: 'default'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '1px' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Content List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {loading ? (
            <p style={{ color: '#a1a1aa', textAlign: 'center', margin: '20px 0' }}>Loading...</p>
          ) : users.length === 0 ? (
            <p style={{ color: '#52525b', textAlign: 'center', margin: '40px 0', fontSize: '13px' }}>No users found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {users.map(u => {
                const hasValidAvatar = u.avatar_url && u.avatar_url.startsWith('http');
                const firstInitial = (u.display_url || u.username || '?').charAt(0).toUpperCase();
                
                return (
                  <Link 
                    key={u.id} 
                    href={`/profile/${u.id}`}
                    onClick={onClose}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      textDecoration: 'none',
                      color: '#fff',
                      background: '#18181b',
                      borderRadius: '16px',
                      border: '1px solid #27272a',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#27272a')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#18181b')}
                  >
                    {/* Avatar Container with Gradient Fallback */}
                    <div style={{ 
                      width: '44px', 
                      height: '44px', 
                      borderRadius: '38%', 
                      overflow: 'hidden', 
                      border: '2px solid #27272a', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      background: hasValidAvatar ? '#18181b' : getAvatarGradient(u.id)
                    }}>
                        {hasValidAvatar ? (
                          <img 
                            src={u.avatar_url} 
                            crossOrigin="anonymous"
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover'
                            }} 
                          />
                        ) : (
                          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
                            {firstInitial}
                          </span>
                        )}
                    </div>

                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{u.display_url || u.username}</p>
                      <p style={{ fontSize: '12px', color: '#818cf8', fontWeight: 'bold' }}>@{u.username}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
