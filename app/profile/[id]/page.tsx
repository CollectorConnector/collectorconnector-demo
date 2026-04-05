"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ImportInstagramModal from '@/components/ImportInstagramModal';

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfileData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      // Fetch Profile
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', id).single();
      
      // Fetch Collections
      const { data: cols } = await supabase.from('collections').select('*').eq('user_id', id);

      // Fetch Recent Items (Active only, not imported)
      const { data: its } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      setProfile(prof);
      setCollections(cols || []);
      setItems(its || []);
      setLoading(false);
    }
    fetchProfileData();
  }, [id]);

  if (loading) return <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>LOADING...</div>;

  const isOwner = userId === id;

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <Header />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 20px' }}>
        {/* Profile Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#18181b', margin: '0 auto 20px', border: '2px solid #27272a', overflow: 'hidden' }}>
             {profile?.avatar_url && <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic' }}>{profile?.username || 'Collector'}</h1>
          
          {isOwner && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button 
                onClick={() => setIsImportOpen(true)}
                style={{ backgroundColor: '#fff', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}
              >
                IMPORT IG
              </button>
              <button 
                onClick={() => router.push('/curator')}
                style={{ backgroundColor: '#27272a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}
              >
                CURATOR INBOX
              </button>
            </div>
          )}
        </div>

        {/* Collections Grid */}
        <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#71717a', marginBottom: '20px', letterSpacing: '2px' }}>COLLECTIONS</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginBottom: '60px' }}>
          {collections.map(col => (
            <div key={col.id} onClick={() => router.push(`/collections/${col.id}`)} style={{ background: '#09090b', borderRadius: '24px', padding: '20px', border: '1px solid #18181b', cursor: 'pointer' }}>
              <div style={{ aspectRatio: '16/9', background: '#18181b', borderRadius: '16px', marginBottom: '15px' }}></div>
              <h3 style={{ margin: 0, fontWeight: '900', fontSize: '18px' }}>{col.title}</h3>
            </div>
          ))}
        </div>

        {/* Recent Items */}
        <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#71717a', marginBottom: '20px', letterSpacing: '2px' }}>RECENT DROPS</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
          {items.map(item => (
            <div key={item.id} onClick={() => router.push(`/items/${item.id}`)} style={{ aspectRatio: '1/1', borderRadius: '20px', overflow: 'hidden', border: '1px solid #18181b', cursor: 'pointer' }}>
              <img src={item.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </main>

      <ImportInstagramModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        userId={userId || ''} 
      />

      <Footer />
    </div>
  );
}
