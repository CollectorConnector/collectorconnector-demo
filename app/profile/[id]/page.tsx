"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ImportInstagramModal from "@/components/ImportInstagramModal";

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

  if (loading) return <div style={{backgroundColor:'#000', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'900', fontStyle:'italic'}}>LOADING VAULT...</div>;

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: '100px' }}>
      {/* Navigation */}
      <nav style={{ padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #111' }}>
        <div style={{ fontWeight: '900', fontStyle: 'italic', fontSize: '24px', letterSpacing: '-1.5px', cursor: 'pointer' }} onClick={() => router.push('/')}>COLLECTOR CONNECTOR</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setIsImportOpen(true)} style={{ backgroundColor: '#111', color: '#fff', border: '1px solid #222', padding: '12px 20px', borderRadius: '14px', fontSize: '10px', fontWeight: '900', letterSpacing: '1px', cursor: 'pointer' }}>IMPORT IG</button>
          <button onClick={() => router.push('/curator')} style={{ backgroundColor: '#fff', color: '#000', border: 'none', padding: '12px 20px', borderRadius: '14px', fontSize: '10px', fontWeight: '900', letterSpacing: '1px', cursor: 'pointer' }}>CURATOR INBOX</button>
        </div>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
        {/* Hero Section */}
        <header style={{ marginBottom: '80px' }}>
          <h1 style={{ fontSize: 'min(15vw, 120px)', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-6px', lineHeight: '0.8', margin: '0 0 24px 0', textTransform: 'uppercase' }}>
            {profile?.username || "COLLECTOR"}
          </h1>
          <p style={{ color: '#666', fontWeight: '700', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', maxWidth: '500px', lineHeight: '1.6' }}>
            {profile?.bio || "PREMIUM ARCHIVE • CURATED COLLECTIBLES"}
          </p>
        </header>

        {/* Collections Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '40px' }}>
          {collections.map((col) => (
            <div key={col.id} onClick={() => router.push(`/collection/${col.id}`)} style={{ cursor: 'pointer' }}>
              <div style={{ aspectRatio: '4/5', backgroundColor: '#0a0a0a', borderRadius: '40px', overflow: 'hidden', border: '1px solid #1a1a1a', position: 'relative', transition: '0.3s' }}>
                {col.image_url ? (
                  <img src={col.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: '900', color: '#111', fontStyle: 'italic' }}>CC</div>
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }} />
                <div style={{ position: 'absolute', bottom: '32px', left: '32px' }}>
                  <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-1px' }}>{col.title}</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '10px', fontWeight: '900', color: '#666', letterSpacing: '1px' }}>{items.filter(i => i.collection_id === col.id).length} PIECES</p>
                </div>
              </div>
            </div>
          ))}

          {/* New Collection Button */}
          <div style={{ aspectRatio: '4/5', border: '2px dashed #1a1a1a', borderRadius: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '40px', color: '#222', fontWeight: '900' }}>+</div>
            <div style={{ fontSize: '10px', color: '#444', fontWeight: '900', letterSpacing: '1px', marginTop: '8px' }}>NEW COLLECTION</div>
          </div>
        </div>
      </main>

      {isImportOpen && <ImportInstagramModal userId={id as string} onClose={() => setIsImportOpen(false)} />}
    </div>
  );
}
