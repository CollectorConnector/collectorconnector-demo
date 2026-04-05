"use client";
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

export default function CuratorInbox() {
  const [items, setItems] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetCollection, setTargetCollection] = useState('');
  const [loading, setLoading] = useState(true);

  // Hardcoded for now - in production, get this from your auth state
  const userId = '8b594b57-fc82-477a-a709-4598...'; // Copy your ID from Supabase

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch unsorted items
      const { data: importedItems } = await supabase
        .from('items')
        .select('*')
        .eq('status', 'imported');
      
      // 2. Fetch collections to populate the dropdown
      const { data: cols } = await supabase
        .from('collections')
        .select('*')
        .order('title', { ascending: true });

      setItems(importedItems || []);
      setCollections(cols || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleOrganize = async () => {
    if (!targetCollection || selectedIds.length === 0) {
      alert("Select items and a collection first!");
      return;
    }

    const { error } = await supabase
      .from('items')
      .update({ 
        collection_id: targetCollection, 
        status: 'active' // This makes them visible on your profile
      })
      .in('id', selectedIds);

    if (error) {
      alert("Error moving items: " + error.message);
    } else {
      alert(`Success! Moved ${selectedIds.length} items.`);
      window.location.reload();
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (loading) return <div style={{ color: 'white', padding: '40px' }}>Loading Inbox...</div>;

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', padding: '24px', color: '#fff', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1.5px', fontStyle: 'italic' }}>CURATOR INBOX</h1>
          <p style={{ color: '#71717a', fontSize: '14px' }}>{items.length} items waiting to be organized</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            value={targetCollection}
            onChange={(e) => setTargetCollection(e.target.value)}
            style={{ backgroundColor: '#18181b', color: '#fff', border: '1px solid #27272a', padding: '12px', borderRadius: '14px', fontWeight: 'bold' }}
          >
            <option value="">Select Collection...</option>
            {collections.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          
          <button 
            onClick={handleOrganize}
            disabled={selectedIds.length === 0}
            style={{ backgroundColor: '#fff', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', opacity: selectedIds.length ? 1 : 0.5 }}
          >
            ORGANIZE ({selectedIds.length})
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
        {items.map(item => (
          <div 
            key={item.id}
            onClick={() => toggleSelect(item.id)}
            style={{ 
              position: 'relative', 
              aspectRatio: '1/1', 
              cursor: 'pointer',
              borderRadius: '20px',
              overflow: 'hidden',
              border: selectedIds.includes(item.id) ? '4px solid #fff' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <img src={item.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="import" />
            {selectedIds.includes(item.id) && (
              <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#fff', color: '#000', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>✓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
