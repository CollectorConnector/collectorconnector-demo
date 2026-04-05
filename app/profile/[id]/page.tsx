"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ImportInstagramModal from "@/components/ImportInstagramModal";
import Footer from "@/components/Footer";

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportOpen, setIsImportOpen] = useState(false);

  useEffect(() => {
    async function fetchProfileData() {
      if (!id) return;

      // Fetch Profile, Collections, and active Items in parallel for speed
      const [prof, cols, its] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).single(),
        supabase.from("collections").select("*").eq("user_id", id),
        supabase.from("items").select("*").eq("user_id", id).neq("status", "imported")
      ]);

      setProfile(prof.data);
      setCollections(cols.data || []);
      setItems(its.data || []);
      setLoading(false);
    }

    fetchProfileData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white font-black italic animate-pulse tracking-widest">LOADING VAULT...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <nav className="p-6 flex justify-between items-center border-b border-zinc-900/50">
        <div className="font-black italic text-xl tracking-tighter cursor-pointer" onClick={() => router.push('/')}>
          COLLECTOR CONNECTOR
        </div>
        <button 
          onClick={() => router.push('/')}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors"
        >
          Exit Vault
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-20">
          <div>
            <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.8]">
              {profile?.username || "COLLECTOR"}
            </h1>
            <p className="mt-6 text-zinc-500 font-bold max-w-md uppercase text-xs tracking-widest leading-loose">
              {profile?.bio || "ESTABLISHED 2024 • PREMIUM COLLECTOR"}
            </p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setIsImportOpen(true)}
              className="px-6 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95"
            >
              Import IG
            </button>
            <button 
              onClick={() => router.push('/curator')}
              className="px-6 py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95"
            >
              Curator Inbox
            </button>
          </div>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {collections.map((col) => (
            <div 
              key={col.id} 
              onClick={() => router.push(`/collection/${col.id}`)}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/5] bg-zinc-900 rounded-[40px] overflow-hidden border border-zinc-800 group-hover:border-zinc-400 transition-all duration-500 relative shadow-2xl">
                {col.image_url ? (
                  <img src={col.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-800 font-black text-6xl italic">CC</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-8 left-8">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">{col.title}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {items.filter(i => i.collection_id === col.id).length} PIECES
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* New Collection Slot */}
          <div className="aspect-[4/5] border-2 border-dashed border-zinc-800 rounded-[40px] flex flex-col items-center justify-center group hover:border-zinc-500 transition-all cursor-pointer">
             <span className="text-zinc-800 group-hover:text-zinc-500 font-black text-6xl mb-2">+</span>
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700 group-hover:text-zinc-500">New Collection</span>
          </div>
        </div>
      </main>

      <Footer />

      {isImportOpen && (
        <ImportInstagramModal 
          userId={id as string} 
          onClose={() => setIsImportOpen(false)} 
        />
      )}
    </div>
  );
}
