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
  const [vaultValue, setVaultValue] = useState(0);

  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // For Quick View
  
  const [recentDrops, setRecentDrops] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const [newCollName, setNewCollName] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("Cards");
  const [customNiche, setCustomNiche] = useState("");
  const [collectionsList, setCollectionsList] = useState<any[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");

  const [itemName, setItemName] = useState("");
  const [itemValue, setItemValue] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const isOwnProfile = currentUserId === userId;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    async function loadAllData() {
      try {
        setLoading(true);
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", userId).single();
        if (prof) setProfile(prof);

        const { data: items } = await supabase.from("items").select("estimated_value").eq("user_id", userId);
        if (items) {
          setItemCount(items.length);
          setVaultValue(items.reduce((sum, i) => sum + (Number(i.estimated_value) || 0), 0));
        }

        const { data: colls, count } = await supabase.from("collections").select("*", { count: 'exact' }).eq("user_id", userId);
        setCollectionCount(count || 0);
        if (colls) setCollectionsList(colls);

        const { data: drops } = await supabase.from("items").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(6);
        setRecentDrops(drops || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, [userId]);

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
        estimated_value: parseFloat(itemValue) || 0,
        collection: selectedCollectionId || null,
        status: "active"
      });
      window.location.reload();
    } catch (err) {
      alert("Post failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleCreateCollection() {
    if (!newCollName || !userId) return;
    const finalNiche = selectedNiche === "Other" ? customNiche : selectedNiche;
    try {
      await supabase.from("collections").insert({ user_id: userId, name: newCollName, niche: finalNiche || "Collector" });
      window.location.reload();
    } catch (err) { alert("Failed"); }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-black">SYNCING VAULT...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main style={{ marginTop: '100px', paddingBottom: '80px', maxWidth: '800px', margin: '100px auto 0', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* PROFILE CARD */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '32px', textAlign: 'center' }}>
            <img src={profile?.avatar_url || "/default-avatar.png"} style={{ width: '120px', height: '120px', borderRadius: '20px', margin: '0 auto 24px', border: '4px solid #18181b', objectFit: 'cover' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800' }}>{profile?.display_url || profile?.username}</h1>
              <img src="/diamond.png" style={{ width: '30px' }} />
            </div>
            <p style={{ color: '#818cf8', fontWeight: 'bold' }}>@{profile?.username}</p>
            <p style={{ color: '#a1a1aa', margin: '16px 0 24px' }}>{profile?.bio || "Digital Vault Explorer."}</p>

            <Link href={`/collections?user=${userId}`} style={{ display: 'block', background: '#fff', color: '#000', fontWeight: '900', padding: '16px', borderRadius: '16px', textDecoration: 'none', marginBottom: '20px' }}>VIEW COLLECTIONS</Link>

            {isOwnProfile && (
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={() => setShowAddItem(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold' }}>+ ITEM</button>
                <button onClick={() => setShowAddCollection(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold' }}>+ VAULT</button>
              </div>
            )}
        </section>

        {/* RECENT DROPS (With Quick View Fix) */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '900' }}>RECENT DROPS</h2>
            <img src="/CC-SML-Logo.png" style={{ width: '18px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {recentDrops.map((drop) => (
              <div key={drop.id} onClick={() => setSelectedImage(drop.image_url)} style={{ aspectRatio: '1/1', background: '#18181b', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }}>
                <img src={drop.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </section>

        <SuggestedUsers />

        {isOwnProfile && (
          <button onClick={handleLogout} style={{ padding: '16px', color: '#ef4444', border: '1px solid #450a0a', borderRadius: '16px', fontWeight: 'bold', width: '100%', background: 'transparent' }}>LOGOUT ACCOUNT</button>
        )}
      </main>

      {/* MODAL: ADD VAULT (With Niche Logic) */}
      {showAddCollection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '20px' }}>NEW VAULT</h2>
            <input placeholder="Vault Name" value={newCollName} onChange={e => setNewCollName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '12px' }} />
            <select value={selectedNiche} onChange={e => setSelectedNiche(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px' }}>
              <option value="Cards">Cards</option>
              <option value="Sneakers">Sneakers</option>
              <option value="Watches">Watches</option>
              <option value="Other">Other...</option>
            </select>
            {selectedNiche === "Other" && (
              <input placeholder="What Niche?" value={customNiche} onChange={e => setCustomNiche(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #818cf8', color: '#fff', padding: '12px', borderRadius: '12px', marginTop: '12px' }} />
            )}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowAddCollection(false)} style={{ flex: 1, color: '#a1a1aa' }}>CANCEL</button>
              <button onClick={handleCreateCollection} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '12px', borderRadius: '12px' }}>CREATE</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD ITEM (With 130Point Link) */}
      {showAddItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '10px' }}>NEW ITEM</h2>
            <a href="https://130point.com/sales/" target="_blank" style={{ color: '#818cf8', fontSize: '12px', fontWeight: '900', textDecoration: 'none', display: 'block', marginBottom: '20px' }}>VIEW MARKET VALUES →</a>
            
            <select value={selectedCollectionId} onChange={(e) => setSelectedCollectionId(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '12px' }}>
              <option value="">Select Vault</option>
              {collectionsList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <input placeholder="Title" value={itemName} onChange={e => setItemName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '12px' }} />
            <input placeholder="Value (£)" type="number" value={itemValue} onChange={e => setItemValue(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '20px' }} />
            
            <input type="file" onChange={(e) => { const f = e.target.files?.[0]; if(f) { setFile(f); setPreview(URL.createObjectURL(f)); } }} />
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowAddItem(false)} style={{ flex: 1, color: '#a1a1aa' }}>CANCEL</button>
              <button onClick={handlePostItem} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '12px', borderRadius: '12px' }}>POST</button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK VIEW POPUP */}
      {selectedImage && (
        <div onClick={() => setSelectedImage(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
          <img src={selectedImage} style={{ maxWidth: '90%', maxHeight: '80%', borderRadius: '12px', border: '1px solid #27272a' }} />
          <p style={{ position: 'absolute', bottom: '40px', color: '#52525b', fontWeight: 'bold' }}>CLICK ANYWHERE TO CLOSE</p>
        </div>
      )}

      <Footer />
    </div>
  );
}
