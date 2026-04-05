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
      // 1. Fetch from the browser (bypasses Data Center blocks)
      const response = await fetch(`https://www.instagram.com/${igHandle}/?__a=1&__d=dis`);
      
      if (!response.ok) throw new Error("Instagram is blocking the request.");
      
      const data = await response.json();
      const rawPosts = data.graphql?.user?.edge_owner_to_timeline_media?.edges || [];

      if (rawPosts.length === 0) {
        alert("No posts found or account is private.");
        setLoading(false);
        return;
      }

      // 2. Format and send to your internal API for storage
      const posts = rawPosts.map((p: any) => ({
        display_url: p.node.display_url,
        caption: p.node.edge_media_to_caption?.edges[0]?.node?.text || ''
      }));

      const apiRes = await fetch('/api/import-instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posts, userId }),
      });

      if (apiRes.ok) {
        alert("Success! Items are now in your Curator Inbox.");
        onClose();
        window.location.href = '/curator'; // Redirect to see the results
      } else {
        alert("Failed to save items to database.");
      }
    } catch (err) {
      console.error(err);
      alert("Could not reach Instagram. They might be blocking this browser session.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
      <div style={{ backgroundColor: '#18181b', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '8px', fontStyle: 'italic' }}>IMPORT FROM IG</h2>
        <p style={{ color: '#71717a', fontSize: '14px', marginBottom: '24px' }}>Enter a public handle to pull recent posts into your inbox.</p>
        
        <input 
          type="text" 
          placeholder="e.g. ace_cards_and_collectables"
          value={igHandle}
          onChange={(e) => setIgHandle(e.target.value)}
          style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#09090b', border: '1px solid #27272a', color: '#fff', marginBottom: '20px', outline: 'none' }}
        />

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#27272a', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>CANCEL</button>
          <button 
            onClick={handleImport} 
            disabled={loading}
            style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: loading ? '#52525b' : '#fff', color: '#000', fontWeight: '900', cursor: loading ? 'default' : 'pointer' }}
          >
            {loading ? 'SCRAPING...' : 'IMPORT POSTS'}
          </button>
        </div>
      </div>
    </div>
  );
}
