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
  const [newCollectionTitle, setNewCollectionTitle] = useState('');
  const [showNewColInput, setShowNewColInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUserId(user.id);

      const [its, cols] = await Promise.all([
        supabase.from('items').select('*').eq('user_id', user.id).eq('status', 'imported'),
        supabase.from('collections').select('*').eq('user_id', user.id).order('title', { ascending: true })
      ]);

      setItems(its.data || []);
      setCollections(cols.data || []);
      setLoading(false);
    }
    fetchData();
  }, [router]);

  const handleCreateAndMove = async () => {
    if (!newCollectionTitle.trim() || selectedIds.length === 0) return;
    
    // 1. Create the new collection
    const { data: newCol, error: colError } = await supabase
      .from('collections')
      .insert({ title: newCollectionTitle, user_id: userId })
      .select()
      .single();

    if (colError) return alert(colError.message);

    // 2. Move items to it
    const { error: moveError } = await supabase
      .from('items')
      .update({ collection_id: newCol.id, status: 'active' })
      .in('id', selectedIds);

    if (moveError) {
      alert(moveError.message);
    } else {
      setItems(prev => prev.filter(item => !selectedIds.includes(item.id)));
      setCollections(prev => [...prev, newCol]);
      setSelectedIds([]);
      setNewCollectionTitle('');
      setShowNewColInput(false);
      alert(`Success! Created "${newCollectionTitle}" and moved items.`);
    }
  };

  const handleOrganize = async () => {
    if (!targetCollection || selectedIds.length === 0) return;
    const { error } = await supabase
      .from('items')
      .update({ collection_id: targetCollection, status: 'active' })
      .in('id', selectedIds);

    if (!error) {
      setItems(prev => prev.filter(item => !selectedIds.includes(item.id)));
      setSelectedIds([]);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black italic">LOADING INBOX...</div>;

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '120px 20px 80px' }}>
        
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '48px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-2px', margin: 0, textTransform: 'uppercase' }}>Curator Inbox</h1>
            <p style={{ color: '#71717a', fontSize: '14px', fontWeight: 'bold', marginTop: '8px' }}>{items.length} IMPORTS FROM INSTAGRAM</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select 
                value={targetCollection}
                onChange={(e) => setTargetCollection(e.target.value)}
                style={{ backgroundColor: '#18181b', color: '#fff', border: '1px solid #27272a', padding: '14px', borderRadius: '16px', fontWeight: 'bold', fontSize: '14px' }}
              >
                <option value="">Choose Existing Collection...</option>
                {collections.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <button onClick={handleOrganize} disabled={!targetCollection || selectedIds.length === 0} style={{ backgroundColor: '#fff', color: '#000', padding: '14px 28px', borderRadius: '16px', fontWeight: '900', fontSize: '14px', cursor: 'pointer', opacity: (selectedIds.length > 0 && targetCollection) ? 1 : 0.5 }}>ORGANIZE</button>
            </div>
            
            <button 
              onClick={() => setShowNewColInput(!showNewColInput)}
              style={{ color: '#6366f1', background: 'none', border: 'none', fontSize: '12px', fontWeight: '900', cursor: 'pointer' }}
            >
              {showNewColInput ? "× CANCEL" : "+ CREATE NEW COLLECTION FROM SELECTION"}
            </button>

            {showNewColInput && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <input 
                  placeholder="Collection Name (e.g. Pokemon)" 
                  value={newCollectionTitle}
                  onChange={(e) => setNewCollectionTitle(e.target.value)}
                  style={{ backgroundColor: '#18181b', border: '1px solid #27272a', padding: '12px', borderRadius: '12px', color: '#fff' }}
                />
                <button onClick={handleCreateAndMove} style={{ backgroundColor: '#6366f1', color: '#fff', padding: '12px 24px', borderRadius: '12px', border: 'none', fontWeight: '900' }}>CREATE</button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {items.map(item => (
            <div 
              key={item.id}
              onClick={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])}
              style={{ 
                aspectRatio: '1/1', 
                borderRadius: '24px', 
                overflow: 'hidden', 
                border: selectedIds.includes(item.id) ? '4px solid #6366f1' : '1px solid #27272a',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              {/* Note: If Instagram blocks the image, this will show the item name */}
              <img src={item.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e:any) => e.target.src = 'https://placehold.co/400x400/18181b/ffffff?text=Instagram+Protected'} />
              <div style={{ position: 'absolute', bottom: 0, width: '100%', padding: '10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', fontSize: '10px', fontWeight: 'bold' }}>{item.title}</div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
