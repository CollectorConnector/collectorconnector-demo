"use client";

import { useState } from 'react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function ImportInstagramModal({ isOpen, onClose, userId }: ImportModalProps) {
  const [igHandle, setIgHandle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!igHandle) return;
    setLoading(true);

    try {
      // Fetch directly from browser to avoid data-center blocks
      const response = await fetch(`https://www.instagram.com/${igHandle}/?__a=1&__d=dis`);
      
      if (!response.ok) throw new Error("Instagram blocked the request.");
      
      const data = await response.json();
      const rawPosts = data.graphql?.user?.edge_owner_to_timeline_media?.edges || [];

      if (rawPosts.length === 0) {
        alert("No posts found. Is the account private?");
        setLoading(false);
        return;
      }

      const posts = rawPosts.map((p: any) => ({
        display_url: p.node.display_url,
        caption: p.node.edge_media_to_caption?.edges[0]?.node?.text || ''
      }));

      // Hand off to our internal API for storage
      const apiRes = await fetch('/api/import-instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posts, userId }),
      });

      if (apiRes.ok) {
        alert("Import successful! Redirecting to Curator Inbox...");
        window.location.href = '/curator';
      } else {
        alert("Database sync failed.");
      }
    } catch (err) {
      alert("Instagram is blocking this request. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ backgroundColor: '#18181b', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>IMPORT INSTAGRAM</h2>
        <p style={{ color: '#71717a', fontSize: '14px', marginBottom: '20px' }}>Enter a public handle to grab recent posts.</p>
        
        <input 
          type="text" 
          placeholder="e.g. ace_cards_and_collectables"
          value={igHandle}
          onChange={(e) => setIgHandle(e.target.value)}
          style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#000', border: '1px solid #27272a', color: '#fff', marginBottom: '20px' }}
        />

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '12px', backgroundColor: '#27272a', color: '#fff', border: 'none', fontWeight: 'bold' }}>CANCEL</button>
          <button 
            onClick={handleImport} 
            disabled={loading}
            style={{ flex: 2, padding: '14px', borderRadius: '12px', backgroundColor: loading ? '#52525b' : '#fff', color: '#000', border: 'none', fontWeight: '900' }}
          >
            {loading ? 'IMPORTING...' : 'CONFIRM'}
          </button>
        </div>
      </div>
    </div>
  );
}
