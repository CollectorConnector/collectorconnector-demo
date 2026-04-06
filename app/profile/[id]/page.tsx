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
  const [selectedImage, setSelectedImage] = useState<string | null>(null); 
  
  const [recentDrops, setRecentDrops] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const [newCollName, setNewCollName] = useState("");
  const [selectedNiche, setSelectedNiche] = useState(""); 
  const [customNiche, setCustomNiche] = useState("");
  const [collectionsList, setCollectionsList] = useState<any[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");

  const [itemName, setItemName] = useState("");
  const [itemValue, setItemValue] = useState("");
  
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

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

        const { data: colls } = await supabase.from("collections").select("*").eq("user_id", userId);
        if (colls) {
          setCollectionCount(colls.length);
          setCollectionsList(colls);
        }

        const { data: drops } = await supabase.from("items").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20);
        setRecentDrops(drops || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, [userId]);

  // STABLE UPLOAD ENGINE
  async function uploadFiles(targetCollectionId: string, baseTitle: string, totalValue: number) {
    if (files.length === 0 || !userId || !targetCollectionId) return;
    const valuePerItem = totalValue / files.length || 0;

    for (const f of files) {
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const { error: storageError } = await supabase.storage.from("item-images").upload(fileName, f);
      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(fileName);
      
      await supabase.from("items").insert({
        user_id: userId,
        title: baseTitle || "New Item",
        image_url: publicUrl,
        estimated_value: valuePerItem,
        collection: targetCollectionId,
        status: "active"
      });
    }
  }

  async function handleBatchUploadItems() {
    if (!selectedCollectionId) return alert("Select a collection!");
    setUploading(true);
    try {
      await uploadFiles(selectedCollectionId, itemName, parseFloat(itemValue));
      alert("Drop Successful!");
      window.location.reload();
    } catch (err) {
      alert("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleCreateCollectionBatch() {
    const finalNiche = selectedNiche === "Other" ? customNiche : selectedNiche;
    
    if (!newCollName.trim() || !finalNiche.trim()) {
      alert("Please enter a Name and Niche!");
      return;
    }
    
    setUploading(true);
    try {
      // 1. Create Collection
      const { data: coll, error: collErr } = await supabase
        .from("collections")
        .insert({ user_id: userId, name: newCollName, niche: finalNiche })
        .select()
        .single();

      if (collErr) throw collErr;

      // 2. Critical Delay (1 second) for database sync
      if (files.length > 0 && coll) {
        await new Promise(r => setTimeout(r, 1000));
        await uploadFiles(coll.id, newCollName, 0);
      }

      alert("Collection created successfully!");
      window.location.reload();
    } catch (err) { 
      console.error(err);
      alert("Something went wrong. Please check your connection and try again."); 
    } finally { 
      setUploading(false); 
    }
  }

  // BUTTON VALIDATION
  const isCollectionValid = newCollName.trim() !== "" && (selectedNiche !== "" && (selectedNiche !== "Other" || customNiche.trim() !== ""));

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
                <button onClick={() => { setFiles([]); setPreviews([]); setShowAddItem(true); }} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold' }}>+ ITEM</button>
                <button onClick={() => { setFiles([]); setPreviews([]); setShowAddCollection(true); }} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold' }}>+ COLLECTION</button>
              </div>
            )}
        </section>

        {/* RECENT DROPS GRID */}
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
      </main>

      {/* MODAL: NEW COLLECTION (Validated & Polished) */}
      {showAddCollection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '20px', textAlign: 'center' }}>NEW COLLECTION</h2>
            
            <input placeholder="Collection Name" value={newCollName} onChange={e => setNewCollName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '12px', marginBottom: '12px' }} />
            
            <select value={selectedNiche} onChange={e => setSelectedNiche(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: selectedNiche === "" ? "#52525b" : "#fff", padding: '14px', borderRadius: '12px', marginBottom: '12px' }}>
              <option value="">Select Niche...</option>
              <option value="Cards">Cards</option>
              <option value="Sneakers">Sneakers</option>
              <option value="Watches">Watches</option>
              <option value="Lego">Lego</option>
              <option value="Other">Other...</option>
            </select>
            
            {selectedNiche === "Other" && (
              <input placeholder="Specify Niche (e.g. Beanie Babies)" value={customNiche} onChange={e => setCustomNiche(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #818cf8', color: '#fff', padding: '14px', borderRadius: '12px', marginBottom: '12px' }} />
            )}

            <label style={{ display: 'block', background: '#27272a', color: '#fff', textAlign: 'center', padding: '20px', borderRadius: '12px', cursor: 'pointer', border: '2px dashed #3f3f46', marginBottom: '10px' }}>
               {files.length > 0 ? `${files.length} Photos Ready` : "+ Add Items (Max 20)"}
               <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => {
                 const selectedFiles = Array.from(e.target.files || []).slice(0, 20);
                 setFiles(selectedFiles);
                 setPreviews(selectedFiles.map(f => URL.createObjectURL(f)));
               }} />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
              {previews.map((p, i) => <img key={i} src={p} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '4px' }} />)}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => { setShowAddCollection(false); setFiles([]); setPreviews([]); }} style={{ flex: 1, color: '#a1a1aa', fontWeight: 'bold' }}>CANCEL</button>
              <button 
                onClick={handleCreateCollectionBatch} 
                disabled={uploading || !isCollectionValid} 
                style={{ flex: 2, background: isCollectionValid ? '#fff' : '#27272a', color: isCollectionValid ? '#000' : '#52525b', fontWeight: '900', padding: '12px', borderRadius: '12px', opacity: uploading ? 0.5 : 1, cursor: isCollectionValid ? 'pointer' : 'not-allowed' }}
              >
                {uploading ? 'DROPPING...' : 'CREATE COLLECTION'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BATCH ADD ITEMS (Existing) */}
      {showAddItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '10px' }}>BATCH DROP</h2>
            <a href="https://130point.com/sales/" target="_blank" style={{ color: '#818cf8', fontSize: '12px', fontWeight: '900', textDecoration: 'none', display: 'block', marginBottom: '20px' }}>CHECK MARKET VALUES →</a>
            
            <select value={selectedCollectionId} onChange={(e) => setSelectedCollectionId(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '12px' }}>
              <option value="">Select Target Collection</option>
              {collectionsList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <input placeholder="Batch Title" value={itemName} onChange={e => setItemName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '12px' }} />
            <input placeholder="Total Value (£)" type="number" value={itemValue} onChange={e => setItemValue(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '20px' }} />
            
            <label style={{ display: 'block', background: '#27272a', color: '#fff', textAlign: 'center', padding: '20px', borderRadius: '12px', cursor: 'pointer', border: '2px dashed #3f3f46' }}>
               {files.length > 0 ? `${files.length} Photos Selected` : "Upload Batch (Max 20)"}
               <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => {
                 const selectedFiles = Array.from(e.target.files || []).slice(0, 20);
                 setFiles(selectedFiles);
                 setPreviews(selectedFiles.map(f => URL.createObjectURL(f)));
               }} />
            </label>

            <div style={{ gridTemplateColumns: 'repeat(4, 1fr)', display: 'grid', gap: '4px', marginTop: '10px' }}>
              {previews.map((p, i) => <img key={i} src={p} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '4px' }} />)}
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => { setShowAddItem(false); setFiles([]); setPreviews([]); }} style={{ flex: 1, color: '#a1a1aa' }}>CANCEL</button>
              <button onClick={handleBatchUploadItems} disabled={uploading || files.length === 0 || !selectedCollectionId} style={{ flex: 2, background: (files.length > 0 && selectedCollectionId) ? '#fff' : '#27272a', color: (files.length > 0 && selectedCollectionId) ? '#000' : '#52525b', fontWeight: '900', padding: '12px', borderRadius: '12px', opacity: uploading ? 0.5 : 1 }}>
                {uploading ? 'DROPPING...' : 'DROP BATCH'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedImage && (
        <div onClick={() => setSelectedImage(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
          <img src={selectedImage} style={{ maxWidth: '90%', maxHeight: '80%', borderRadius: '12px', border: '1px solid #27272a' }} />
        </div>
      )}

      <Footer />
    </div>
  );
}
