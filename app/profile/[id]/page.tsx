"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ManualUploadModal from '@/components/ManualUploadModal';

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfileData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      const [profRes, colRes, itemRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('collections').select('*').eq('user_id', id).order('created_at', { ascending: false }),
        supabase.from('items').select('*').eq('user_id', id).eq('status', 'active').order('created_at', { ascending: false })
      ]);

      setProfile(profRes.data);
      setCollections(colRes.data || []);
      setItems(itemRes.data || []);
      setLoading(false);
    }
    fetchProfileData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white italic font-black">LOADING PROFILE...</div>;

  const isOwner = userId === id;

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff' }}>
      <Header />
      
      {/* Profile Hero Section */}
      <section style={{ paddingTop: '120px', paddingBottom: '40px', borderBottom: '1px solid #18181b' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '30px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(45deg, #18181b, #27272a)', border: '2px solid #27272a', overflow: 'hidden', flexShrink: 0 }}>
             {profile?.avatar_url && <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <div style={{ flexGrow: 1 }}>
            <h1 style={{ fontSize: '42px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-2px', margin: 0 }}>
              {profile?.username || 'Collector'}
            </h1>
            <p style={{ color: '#71717a', fontWeight: 'bold', fontSize: '14px', marginTop: '5px' }}>{items.length} PIECES IN VAULT</p>
          </div>
          
          {isOwner && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setIsManualOpen(true)} style={{ backgroundColor: '#fff', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '13px' }}>+ ADD PIECE</button>
              <button onClick={() => router.push('/curator')} style={{ backgroundColor: '#18181b', color: '#fff', border: '1px solid #27272a', padding: '12px 24px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '13px' }}>CURATOR</button>
            </div>
          )}
        </div>
      </section>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Collections: Horizontal Scroll or Small Grid */}
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: '900', color: '#71717a', marginBottom: '20px', letterSpacing: '2px', textTransform: 'uppercase' }}>Your Collections</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {collections.map(col => (
              <div key={col.id} onClick={() => router.push(`/collections/${col.id}`)} style={{ background: '#09090b', borderRadius: '24px', padding: '24px', border: '1px solid #18181b', cursor: 'pointer', transition: 'border 0.2s' }}>
                <h3 style={{ margin: 0, fontWeight: '900', fontSize: '20px', fontStyle: 'italic' }}>{col.title}</h3>
                <p style={{ color: '#71717a', fontSize: '12px', marginTop: '5px', fontWeight: 'bold' }}>VIEW COLLECTION →</p>
              </div>
            ))}
          </div>
        </div>

        {/* The Main Vault Grid */}
        <div>
          <h2 style={{ fontSize: '12px', fontWeight: '900', color: '#71717a', marginBottom: '20px', letterSpacing: '2px', textTransform: 'uppercase' }}>The Vault</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
            {items.map(item => (
              <div key={item.id} onClick={() => router.push(`/items/${item.id}`)} style={{ aspectRatio: '1/1', borderRadius: '24px', overflow: 'hidden', border: '1px solid #18181b', cursor: 'pointer', backgroundColor: '#09090b' }}>
                <img src={item.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
      </main>

      <ManualUploadModal 
        isOpen={isManualOpen} 
        onClose={() => setIsManualOpen(false)} 
        userId={userId || ''} 
      />
      <Footer />
    </div>
  );
}
