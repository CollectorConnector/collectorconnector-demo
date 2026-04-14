"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function SuggestedUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch all profiles to show in the "View All" list
    supabase.from("profiles").select("*").limit(20).then(({ data }) => {
      setUsers(data || []);
    });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main style={{ maxWidth: '800px', margin: '100px auto 0', padding: '0 16px 80px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '24px' }}>DISCOVER COLLECTORS</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          {users.map((u) => (
            <Link href={`/profile/${u.username}`} key={u.id} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#111', padding: '16px', borderRadius: '20px', border: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#222', overflow: 'hidden' }}>
                    <img src={u.avatar_url || `https://avatar.vercel.sh/${u.username}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: '900', color: '#fff', margin: 0 }}>{u.display_name || u.username}</p>
                    <p style={{ fontSize: '12px', color: '#818cf8', margin: 0 }}>@{u.username}</p>
                  </div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
