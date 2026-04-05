"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ImportInstagramModal({ onClose, userId }: { onClose: () => void, userId: string }) {
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);

  async function startImport() {
    setLoading(true);
    try {
      const res = await fetch('/api/import-instagram', {
        method: 'POST',
        body: JSON.stringify({ igHandle: handle, userId })
      });
      
      const result = await res.json();

      if (!res.ok) {
        alert(`Import Failed: ${result.error || 'Unknown Error'}`);
        return;
      }

      if (result.data) {
        // Bulk insert into your 'items' table
        const { error: insertError } = await supabase.from('items').insert(result.data);
        if (insertError) throw insertError;
        
        alert('Import Successful!');
        onClose();
        window.location.reload();
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[32px] w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-black mb-2 text-center text-white italic tracking-tighter">IMPORT FROM IG</h2>
        <p className="text-zinc-500 text-sm text-center mb-6">Enter your username to pull your latest posts.</p>
        
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">@</span>
          <input 
            type="text" 
            placeholder="username"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className="w-full bg-black border border-zinc-800 rounded-2xl py-4 pl-10 pr-4 text-white font-bold focus:border-white transition-all outline-none"
          />
        </div>

        <button 
          onClick={startImport}
          disabled={loading || !handle}
          className="w-full bg-white text-black font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? 'SCRAPING...' : 'START IMPORT'}
        </button>
        
        <button onClick={onClose} className="w-full mt-4 text-zinc-500 font-bold text-xs uppercase tracking-widest">
          Cancel
        </button>
      </div>
    </div>
  );
}
