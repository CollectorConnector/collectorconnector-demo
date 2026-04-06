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
  const [showEditCollection, setShowEditCollection] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); 
  
  const [recentDrops, setRecentDrops] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const [newCollName, setNewCollName] = useState("");
  const [selectedNiche, setSelectedNiche] = useState(""); 
  const [customNiche, setCustomNiche] = useState("");
  const [collectionsList, setCollectionsList] = useState<any[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");

  const [editingColl, setEditingColl] = useState<any>(null);
  const [collItems, setCollItems] = useState<any[]>([]); 

  const [itemName, setItemName] = useState("");
  const [itemValue, setItemValue] = useState("");
  
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const [userRank, setUserRank] = useState<string | null>(null);

  const isOwnProfile = currentUserId === userId;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    loadAllData();
    determineRank();
  }, [userId]);

  async function determineRank() {
    // YOUR DIAMOND RANK UID
    const myId = "YOUR_SUPABASE_UID"; 
    if (userId === myId) {
      setUserRank("diamond");
      return;
    }

    const founders = ["mum", "rich"];
    const { data: prof } = await supabase.from("profiles").select("username").eq("id", userId).single();
    if (prof && founders.includes(prof.username?.toLowerCase())) {
      setUserRank("founder");
      return;
    }

    const { data: allUsers } = await supabase.from("profiles").select("id").order("created_at", { ascending: true });
    if (allUsers) {
      const index = allUsers.findIndex(u => u.id === userId);
      if (index >= 0 && index < 10) setUserRank("gold");
      else if (index >= 10 && index < 20) setUserRank("silver");
      else if (index >= 20 && index < 30) setUserRank("bronze");
    }
  }

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

  async function loadCollectionItems(collId: string) {
    const { data } = await supabase.from("items").select("*").eq("collection", collId);
    setCollItems(data || []);
  }

  async function deleteItem(itemId: string) {
    if (!confirm("Are you sure you want to delete this item forever?")) return;
    const { error } = await supabase.from("items").delete().eq("id", itemId);
    if (error) {
      alert("Error deleting: " + error.message);
    } else {
      setCollItems(prev => prev.filter(i => i.id !== itemId));
      setRecentDrops(prev => prev.filter(i => i.id !== itemId));
      loadAllData();
    }
  }

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
      await uploadFiles(selectedCollectionId, itemName, parseFloat(itemValue) || 0);
      alert("Drop Successful!");
      setShowAddItem(false);
      loadAllData();
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setUploading(false);
      setFiles([]);
      setPreviews([]);
    }
  }

  async function handleCreateCollectionBatch() {
    const finalNiche = selectedNiche === "Other" ? customNiche : selectedNiche;
    setUploading(true);
    try {
      const { data: coll, error: collErr } = await supabase
        .from("collections")
        .insert([{ user_id: userId, title: newCollName.trim(), niche: finalNiche.trim() }])
        .select().single();
      if (collErr) throw collErr;
      if (files.length > 0 && coll) {
        await uploadFiles(coll.id, newCollName, 0);
      }
      alert("Collection Dropped!");
      setShowAddCollection(false);
      loadAllData();
    } catch (err: any) { 
      alert(`Error: ${err.message}`); 
    } finally { 
      setUploading(false); 
      setFiles([]);
      setPreviews([]);
    }
  }

  async function handleUpdateCollection() {
    if (!editingColl) return;
    setUploading(true);
    try {
      const { error } = await supabase
        .from("collections")
        .update({ title: editingColl.title, niche: editingColl.niche })
        .eq("id", editingColl.id);
      if (error) throw error;
      alert("Collection Updated!");
      setEditingColl(null);
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  }

  const isCollectionValid = newCollName.trim() !== "" && (selectedNiche !== "" && (selectedNiche !== "Other" || customNiche.trim() !== ""));

  // FIXED FILENAMES: Swapped to lowercase to match your folder
  const renderRankIcon = () => {
    const iconStyle = { width: '30px' };
    if (userRank === "diamond") return <img src="/diamond.png" style={iconStyle} />;
    if (userRank === "founder") return <img src="/founder.png" style={iconStyle} />;
    if (userRank === "gold") return <img src="/gold.png" style={iconStyle} />;
    if (userRank === "silver") return <img src="/silver.png" style={iconStyle} />;
    if (userRank === "bronze") return <img src="/bronze.png" style={iconStyle} />;
    return null;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main style={{ marginTop: '100px', paddingBottom: '80px', maxWidth: '800px', margin: '100px auto 0', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '32px', textAlign: 'center', position: 'relative' }}>
            {isOwnProfile && (
              <Link href="/settings" style={{ position: 'absolute', top: '20px', right: '20px', background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}>EDIT PROFILE</Link>
            )}
            <img src={profile?.avatar_url || "/default-avatar.png"} style={{ width: '120px', height: '120px', borderRadius: '20px', margin: '0 auto 24px', border: '4px solid #18181b', objectFit: 'cover' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800' }}>{profile?.display_url || profile?.username}</h1>
              {renderRankIcon()}
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

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div style={{ background: '#09090b', border: '1px solid #27272a', padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#a1a1aa', fontWeight: 'bold' }}>ITEMS</p>
            <p style={{ fontSize: '20px', fontWeight: '900' }}>{itemCount}</p>
          </div>
          <div style={{ background: '#09090b', border: '1px solid #27272a', padding: '20px', borderRadius: '20px', textAlign: 'center', cursor: 'pointer' }} onClick={() => setShowEditCollection(true)}>
            <p style={{ fontSize: '12px', color: '#a1a1aa', fontWeight: 'bold' }}>COLLECTIONS ⚙️</p>
            <p style={{ fontSize: '20px', fontWeight: '900' }}>{collectionCount}</p>
          </div>
          <div style={{ background: '#09090b', border: '1px solid #27272a', padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#a1a1aa', fontWeight: 'bold' }}>VALUE</p>
            <p style={{ fontSize: '20px', fontWeight: '900', color: '#4ade80' }}>£{vaultValue}</p>
          </div>
        </div>

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

      {/* MODALS START HERE */}
      {showEditCollection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '20px' }}>MY COLLECTIONS</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
              {collectionsList.map(c => (
                <div key={c.id} style={{ background: '#000', padding: '12px', borderRadius: '12px', border: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{c.title}</span>
                  <button onClick={() => { setEditingColl(c); loadCollectionItems(c.id); setShowEditCollection(false); }} style={{ color: '#818cf8', fontWeight: 'bold' }}>EDIT / VIEW</button>
                </div>
              ))}
            </div>
            <button onClick={() => setShowEditCollection(false)} style={{ width: '100%', marginTop: '20px', color: '#a1a1aa' }}>CLOSE</button>
          </div>
        </div>
      )}

      {editingColl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '500px', border: '1px solid #27272a', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '20px' }}>MANAGE: {editingColl.title}</h2>
            <input value={editingColl.title} onChange={e => setEditingColl({...editingColl, title: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '12px' }} />
            <input value={editingColl.niche} onChange={e => setEditingColl({...editingColl, niche: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '20px' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>ITEMS (Click to Zoom / X to Delete)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
              {collItems.map(item => (
                <div key={item.id} style={{ position: 'relative', aspectRatio: '1/1' }}>
                  <img src={item.image_url} onClick={() => setSelectedImage(item.image_url)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', cursor: 'zoom-in' }} />
                  <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold', zIndex: 10 }}>×</button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setEditingColl(null)} style={{ flex: 1, color: '#a1a1aa' }}>CANCEL</button>
              <button onClick={handleUpdateCollection} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '12px', borderRadius: '12px' }}>SAVE CHANGES</button>
            </div>
          </div>
        </div>
      )}

      {showAddCollection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '20px', textAlign: 'center' }}>NEW COLLECTION</h2>
            <input placeholder="Collection Name" value={newCollName} onChange={e => setNewCollName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '12px', marginBottom: '12px' }} />
            <select value={selectedNiche} onChange={e => setSelectedNiche(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '12px', marginBottom: '12px' }}>
              <option value="">Select Niche...</option>
              <option value="Cards">Cards</option>
              <option value="Sneakers">Sneakers</option>
              <option value="Watches">Watches</option>
              <option value="Other">Other...</option>
            </select>
            {selectedNiche === "Other" && (
              <input placeholder="Specify Niche" value={customNiche} onChange={e => setCustomNiche(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #818cf8', color: '#fff', padding: '14px', borderRadius: '12px', marginBottom: '12px' }} />
            )}
            <label style={{ display: 'block', background: '#27272a', color: '#fff', textAlign: 'center', padding: '20px', borderRadius: '12px', cursor: 'pointer', border: '2px dashed #3f3f46', marginBottom: '10px' }}>
               {files.length > 0 ? `${files.length} Photos Added` : "+ Add Items (Max 20)"}
               <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => {
                 const selectedFiles = Array.from(e.target.files || []).slice(0, 20);
                 setFiles(selectedFiles);
                 setPreviews(selectedFiles.map(f => URL.createObjectURL(f)));
               }} />
            </label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowAddCollection(false)} style={{ flex: 1, color: '#a1a1aa' }}>CANCEL</button>
              <button onClick={handleCreateCollectionBatch} disabled={uploading || !isCollectionValid} style={{ flex: 2, background: isCollectionValid ? '#fff' : '#27272a', color: isCollectionValid ? '#000' : '#52525b', fontWeight: '900', padding: '12px', borderRadius: '12px' }}>CREATE</button>
            </div>
          </div>
        </div>
      )}

      {showAddItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '20px' }}>BATCH DROP</h2>
            <select value={selectedCollectionId} onChange={(e) => setSelectedCollectionId(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '12px' }}>
              <option value="">Select Target Collection</option>
              {collectionsList.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <input placeholder="Batch Title" value={itemName} onChange={e => setItemName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '12px' }} />
            <label style={{ display: 'block', background: '#27272a', color: '#fff', textAlign: 'center', padding: '20px', borderRadius: '12px', cursor: 'pointer', border: '2px dashed #3f3f46' }}>
               {files.length > 0 ? `${files.length} Photos Selected` : "Upload Items (Max 20)"}
               <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => {
                 const selectedFiles = Array.from(e.target.files || []).slice(0, 20);
                 setFiles(selectedFiles);
                 setPreviews(selectedFiles.map(f => URL.createObjectURL(f)));
               }} />
            </label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowAddItem(false)} style={{ flex: 1, color: '#a1a1aa' }}>CANCEL</button>
              <button onClick={handleBatchUploadItems} disabled={uploading || !selectedCollectionId || files.length === 0} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '12px', borderRadius: '12px' }}>DROP</button>
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
