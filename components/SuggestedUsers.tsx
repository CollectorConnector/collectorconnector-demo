"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

type SuggestedUser = {
  id: string;
  display_url: string | null;
  username: string | null;
  avatar_url: string | null;
};

export default function SuggestedUsers() {
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const router = useRouter();

  // Define the path to your default SVG icon
  const DEFAULT_AVATAR = '/path/to/default-user-icon.svg';

  useEffect(() => {
    async function loadUsers() {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_url, username, avatar_url")
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
        {users.map((u) => (
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
                src={u.avatar_url || DEFAULT_AVATAR} 
                onError={(e) => { 
                  (e.target as HTMLImageElement).src = DEFAULT_AVATAR; 
                }}
                style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '18px', 
                  objectFit: 'cover', 
                  border: '2px solid #18181b'
                }} 
                alt={u.username || "Collector Profile"}
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
        ))}
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
