"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CuratorInbox() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetCollection, setTargetCollection] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUserId(user.id);

      // 1. Fetch items that are 'imported' OR have no collection assigned
      const { data: importedItems } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .or('status.eq.imported,collection_id.is.null');
      
      // 2. Fetch existing collections for the dropdown
      const { data: cols } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .order('title', { ascending: true });

      setItems(importedItems || []);
      setCollections(cols || []);
      setLoading(false);
    }
    fetchData();
  }, [router]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleOrganize = async () => {
    if (!targetCollection || selectedIds.length === 0) {
      alert("Please select items and a destination collection.");
      return;
    }

    const { error } = await supabase
      .from('items')
      .update({ 
        collection_id: targetCollection, 
        status: 'active' // Flips them to active so they show on profile
      })
      .in('id', selectedIds);

    if (error) {
      alert("Error: " + error.message);
    } else {
      // Remove moved items from the local view
      setItems(prev => prev.filter(item => !selectedIds.includes(item.id)));
      setSelectedIds([]);
      alert(`Success! Moved ${selectedIds.length} items to your collection.`);
    }
  };

  if (loading) return <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900' }}>LOADING INBOX...</div>;

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <Header />
      
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '120px 20px 80px' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '48px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-2px', margin: 0, textTransform: 'uppercase' }}>Curator Inbox</h1>
            <p style={{ color: '#71717a', fontSize: '14px', fontWeight: 'bold', marginTop: '8px' }}>{items.length} UNSORTED PIECES</p>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <select 
              value={targetCollection}
              onChange={(e) => setTargetCollection(e.target.value)}
              style={{ backgroundColor: '#18181b', color: '#fff', border: '1px solid #27272a', padding: '14px', borderRadius: '16px', fontWeight: 'bold', fontSize: '14px', outline: 'none' }}
            >
              <option value="">Move to Collection...</option>
              {collections.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            
            <button 
              onClick={handleOrganize}
              disabled={selectedIds.length === 0}
              style={{ 
                backgroundColor: selectedIds.length > 0 ? '#fff' : '#27272a', 
                color: selectedIds.length > 0 ? '#000' : '#71717a', 
                border: 'none', 
                padding: '14px 28px', 
                borderRadius: '16px', 
                fontWeight: '900', 
                fontSize: '14px',
                cursor: selectedIds.length > 0 ? 'pointer' : 'default',
                transition: '0.2s all'
              }}
            >
              ORGANIZE ({selectedIds.length})
            </button>
          </div>
        </div>

        {/* The Grid of Imports */}
        {items.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center', background: '#09090b', border: '1px solid #18181b', borderRadius: '32px' }}>
            <p style={{ color: '#52525b', fontWeight: 'bold' }}>INBOX IS CLEAR. RUN AN IG IMPORT TO FILL IT UP.</p>
            <button onClick={() => router.push(`/profile/${userId}`)} style={{ color: '#fff', background: 'none', border: 'none', textDecoration: 'underline', marginTop: '12px', cursor: 'pointer', fontWeight: '900' }}>BACK TO PROFILE</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {items.map(item => (
              <div 
                key={item.id}
                onClick={() => toggleSelect(item.id)}
                style={{ 
                  position: 'relative', 
                  aspectRatio: '1/1', 
                  cursor: 'pointer',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: selectedIds.includes(item.id) ? '4px solid #fff' : '2px solid #18181b',
                  transition: '0.2s transform',
                  transform: selectedIds.includes(item.id) ? 'scale(0.95)' : 'scale(1)'
                }}
              >
                <img src={item.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Import" />
                {selectedIds.includes(item.id) && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#fff', color: '#000', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'black' }}>✓</div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
