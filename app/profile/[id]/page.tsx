"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";
import SuggestedUsers from "@/components/SuggestedUsers";
import Header from "@/components/Header";
import Link from "next/link";

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id || "";

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const [itemCount, setItemCount] = useState(0);
  const [collectionCount, setCollectionCount] = useState(0);

  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [recentDrops, setRecentDrops] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const [newCollName, setNewCollName] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("General");
  const [itemName, setItemName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const isOwnProfile = currentUserId === userId;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
  }, []);

  useEffect(() => {
    if (!userId) return;
    async function loadAllData() {
      try {
        setLoading(true);
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", userId).single();
        if (prof) setProfile(prof);

        const { data: items } = await supabase.from("items").select("id").eq("user_id", userId);
        if (items) setItemCount(items.length);

        const { count } = await supabase.from("collections").select("*", { count: 'exact', head: true }).eq("user_id", userId);
        setCollectionCount(count || 0);

        const { data: drops } = await supabase.from("items").select("id, title, image_url").eq("user_id", userId).order("created_at", { ascending: false }).limit(6);
        setRecentDrops(drops || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    loadAllData();
  }, [userId]);

  async function handleCreateCollection() {
    if (!newCollName || !userId) return;
    try {
      await supabase.from("collections").insert({ 
        user_id: userId, 
        name: newCollName,
        niche: selectedNiche 
      });
      window.location.reload();
    } catch (err) { alert("Failed to create collection"); }
  }

  // Same logic for handlePostItem as your original...
  async function handlePostItem() {
    if (!file || !userId) return;
    setUploading(true);
    try {
      const fileName = `${userId}/${Date.now()}.jpg`;
      await supabase.storage.from("item-images").upload(fileName, file);
      const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(fileName);
      await supabase.from("items").insert({
        user_id: userId,
        title: itemName || "Untitled",
        image_url: publicUrl,
        status: "active"
      });
      window.location.reload();
    } catch (err) { alert("Post failed"); } finally { setUploading(false); }
  }

  const displayName = profile?.display_url || profile?.username || "Collector";
  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-black">SYNCING VAULT...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main style={{ marginTop: '100px', paddingBottom: '80px', maxWidth: '800px', margin: '100px auto 0', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* HEADER */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={profile?.avatar_url || "/default-avatar.png"} style={{ width: '120px', height: '120px', borderRadius: '20px', objectFit: 'cover', border: '4px solid #18181b', marginBottom: '24px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800' }}>{displayName}</h1>
              <img src="/diamond.png" style={{ width: '38px', height: '38px', objectFit: 'contain' }} alt="Diamond Tier" />
            </div>
            <p style={{ color: '#818cf8', fontSize: '18px', marginBottom: '16px' }}>@{profile?.username}</p>
            <p style={{ color: '#a1a1aa', fontSize: '16px', marginBottom: '24px', maxWidth: '400px' }}>{profile?.bio || "Digital Vault Explorer."}</p>

            <Link href={`/collections?user=${userId}`} style={{ display: 'block', width: '100%', maxWidth: '320px', backgroundColor: '#ffffff', color: '#000000', fontWeight: '900', padding: '16px 0', borderRadius: '16px', textAlign: 'center', textDecoration: 'none', fontSize: '16px', marginBottom: '20px' }}>
              VIEW COLLECTIONS
            </Link>

            {isOwnProfile && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                <button onClick={() => setShowAddItem(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '8px 16px', borderRadius: '10px', fontWeight: 'bold' }}>+ ITEM</button>
                <button onClick={() => setShowAddCollection(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '8px 16px', borderRadius: '10px', fontWeight: 'bold' }}>+ COLL</button>
              </div>
            )}
        </section>

        {/* STATS - VALUE REMOVED */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', textAlign: 'center' }}>
            <div><p style={{ fontSize: '22px', fontWeight: '900' }}>{itemCount}</p><p style={{ color: '#52525b', fontSize: '11px', fontWeight: 'bold' }}>ITEMS</p></div>
            <div><p style={{ fontSize: '22px', fontWeight: '900' }}>{collectionCount}</p><p style={{ color: '#52525b', fontSize: '11px', fontWeight: 'bold' }}>VAULTS</p></div>
          </div>
        </section>

        {/* RECENT DROPS */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '900' }}>RECENT DROPS</h2>
            <img src="/CC-SML-Logo.png" style={{ width: '18px', height: '18px' }} alt="CC Logo" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {recentDrops.map((drop) => (
              <div key={drop.id} onClick={() => router.push(`/items/${drop.id}`)} style={{ aspectRatio: '1/1', background: '#18181b', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }}>
                <img src={drop.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </section>
        <SuggestedUsers />
      </main>

      {/* NEW COLLECTION MODAL WITH NICHE */}
      {showAddCollection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '20px', textAlign: 'center' }}>NEW COLLECTION</h2>
            <input placeholder="Name" value={newCollName} onChange={e => setNewCollName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '12px', marginBottom: '10px' }} />
            <select value={selectedNiche} onChange={e => setSelectedNiche(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '12px', marginBottom: '20px' }}>
              <option value="Cards">Cards</option>
              <option value="Sneakers">Sneakers</option>
              <option value="Watches">Watches</option>
              <option value="Lego">Lego</option>
              <option value="Other">Other</option>
            </select>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowAddCollection(false)} style={{ flex: 1, color: '#a1a1aa', fontWeight: 'bold' }}>CANCEL</button>
              <button onClick={handleCreateCollection} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '12px', borderRadius: '12px' }}>CREATE</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
