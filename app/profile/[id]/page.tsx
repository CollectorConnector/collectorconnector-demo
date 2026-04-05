"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ImportInstagramModal from "@/components/ImportInstagramModal";
import Footer from "@/components/Footer";
import SuggestedUsers from "@/components/SuggestedUsers";

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

      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      // 2. Fetch Collections
      const { data: collectionsData } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", id);

      // 3. Fetch Items (FILTERING OUT THE 'IMPORTED' STATUS)
      const { data: itemsData } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", id)
        .neq("status", "imported"); // This is the magic line for your Inbox

      setProfile(profileData);
      setCollections(collectionsData || []);
      setItems(itemsData || []);
      setLoading(false);
    }

    fetchProfileData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black italic">LOADING VAULT...</div>;
  if (!profile) return <div className="min-h-screen bg-black text-white p-20">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Header / Nav */}
      <nav className="p-6 flex justify-between items-center border-b border-zinc-900/50">
        <div className="font-black italic text-2xl tracking-tighter">COLLECTOR CONNECTOR</div>
        <button 
          onClick={() => router.push('/')}
          className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
        >
          Back to Feed
        </button>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Profile Info */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-none mb-4 uppercase">
                {profile.username || "COLLECTOR"}
              </h1>
              <p className="text-zinc-500 max-w-md font-medium leading-relaxed">
                {profile.bio || "No bio yet. Add one in settings."}
              </p>
            </div>

            {/* Premium Button Group */}
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setIsImportOpen(true)}
                className="bg-zinc-900 text-white border border-zinc-800 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all active:scale-95"
              >
                Import IG
              </button>
              <button 
                onClick={() => router.push('/curator')}
                className="bg-white text-black px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Curator Inbox
              </button>
            </div>
          </div>
        </section>

        {/* Collections Grid */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600 mb-8 flex items-center gap-4">
            Current Collections <span className="h-[1px] flex-1 bg-zinc-900"></span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {collections.map((col) => (
              <div 
                key={col.id} 
                onClick={() => router.push(`/collection/${col.id}`)}
                className="group cursor-pointer"
              >
                <div className="aspect-square bg-zinc-900 rounded-[32px] overflow-hidden border border-zinc-800 group-hover:border-white/50 transition-all duration-500 relative">
                  {col.image_url ? (
                    <img src={col.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-800 font-black text-4xl italic">CC</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="mt-4 font-black italic uppercase tracking-tighter text-lg">{col.title}</h3>
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
                  {items.filter(i => i.collection_id === col.id).length} Items
                </p>
              </div>
            ))}

            {/* Empty State / Add Collection */}
            <div className="aspect-square border-2 border-dashed border-zinc-900 rounded-[32px] flex items-center justify-center hover:border-zinc-700 transition-colors cursor-pointer group">
               <span className="text-zinc-800 group-hover:text-zinc-500 font-black text-5xl">+</span>
            </div>
          </div>
        </section>

        <SuggestedUsers />
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
