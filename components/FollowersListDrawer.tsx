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
  mode: "followers" | "following"; // Defines what data to fetch
  userRankFallback?: string; // If you want to use the Tier icons for avatars
}

export default function FollowersListDrawer({ isOpen, onClose, userId, mode, userRankFallback }: FollowersListDrawerProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) return;
    loadListData();
  }, [isOpen, userId, mode]);

  async function loadListData() {
    setLoading(true);
    setUsers([]); // Clear previous list

    let table = "";
    let matchField = ""; // Field in follows table matching input userId
    let fetchField = ""; // Field in follows table for the returned profileId

    if (mode === "followers") {
      table = "follows";
      matchField = "following_id"; // I want the people following THIS user
      fetchField = "follower_id";
    } else {
      table = "follows";
      matchField = "follower_id"; // I want the people THIS user follows
      fetchField = "following_id";
    }

    try {
      // 1. Fetch the IDs from the follows table
      const { data: followData, error: followError } = await supabase
        .from(table)
        .select(`${fetchField}`)
        .eq(matchField, userId);

      if (followError) throw followError;

      if (followData && followData.length > 0) {
        const targetIds = followData.map((f: any) => f[fetchField]);

        // 2. Fetch profile details for all those IDs in one efficient query
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

  // --- DRAWER LAYOUT ---
  if (!isOpen) return null;

  const title = mode === "followers" ? "FOLLOWERS" : "FOLLOWING";
  const tierIconPath = `/icons/tiers/${(userRankFallback || 'collector').toLowerCase()}.svg`;


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
      onClick={onClose} // Clicking the background closes it
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
          cursor: 'default' // Don't trigger background close click
        }}
        onClick={(e) => e.stopPropagation()} // Stop propagation to background
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
                
                return (
                  <Link 
                    key={u.id} 
                    href={`/profile/${u.id}`}
                    onClick={onClose} // Clicking navigates AND closes drawer
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
                    <div style={{ width: '40px', height: '40px', borderRadius: '38%', overflow: 'hidden', border: '2px solid #27272a', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#18181b' }}>
                        <img 
                          src={hasValidAvatar ? u.avatar_url : tierIconPath} 
                          crossOrigin="anonymous"
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: hasValidAvatar ? 'cover' : 'contain', 
                            padding: hasValidAvatar ? '0' : '8px'
                          }} 
                        />
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
