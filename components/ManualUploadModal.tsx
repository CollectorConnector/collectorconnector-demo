"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface ManualUploadProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function ManualUploadModal({ isOpen, onClose, userId }: ManualUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");

  // Load user's collections
  useEffect(() => {
    if (!isOpen || !userId) return;

    const loadCollections = async () => {
      const { data } = await supabase
        .from("collections")
        .select("id, title, item_count")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (data) {
        setCollections(data);
        if (!selectedCollectionId && data.length > 0) {
          setSelectedCollectionId(data[0].id);
        }
      }
    };

    loadCollections();
  }, [isOpen, userId, selectedCollectionId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file || !title || !userId) return alert("Please add a photo and a title!");
    if (!selectedCollectionId) return alert("Please choose a collection!");

    setLoading(true);

    try {
      // Upload image
      const fileName = `${userId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("item-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("item-images")
        .getPublicUrl(fileName);

      // Insert item with collection_id
      const { error: dbError } = await supabase.from("items").insert({
        user_id: userId,
        collection_id: selectedCollectionId,
        title,
        image_url: publicUrl,
        estimated_value: parseFloat(value) || 0,
        status: "active",
      });

      if (dbError) throw dbError;

      // Recompute item_count
      const { count } = await supabase
        .from("items")
        .select("id", { count: "exact", head: true })
        .eq("collection_id", selectedCollectionId)
        .eq("user_id", userId);

      await supabase
        .from("collections")
        .update({ item_count: count ?? 0 })
        .eq("id", selectedCollectionId)
        .eq("user_id", userId);

      alert("Piece added to your collection!");
      onClose();
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
      <div style={{ backgroundColor: "#18181b", padding: "30px", borderRadius: "24px", width: "100%", maxWidth: "500px", border: "1px solid #27272a" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "900", fontStyle: "italic", color: "#fff", marginBottom: "20px" }}>ADD NEW PIECE</h2>

        {/* Collection Selector */}
        <select
          value={selectedCollectionId}
          onChange={(e) => setSelectedCollectionId(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            backgroundColor: "#000",
            border: "1px solid #27272a",
            color: "#fff",
            marginBottom: "20px",
          }}
        >
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        {/* Upload Area */}
        <div
          onClick={() => document.getElementById("fileInput")?.click()}
          style={{
            width: "100%",
            aspectRatio: "4/3",
            backgroundColor: "#09090b",
            borderRadius: "16px",
            border: "2px dashed #27272a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            overflow: "hidden",
            marginBottom: "20px",
          }}
        >
          {preview ? (
            <img src={preview} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          ) : (
            <span style={{ color: "#71717a", fontWeight: "bold" }}>+ CLICK TO UPLOAD PHOTO</span>
          )}
          <input id="fileInput" type="file" hidden accept="image/*" onChange={handleFileChange} />
        </div>

        <input
          placeholder="Card Name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            backgroundColor: "#000",
            border: "1px solid #27272a",
            color: "#fff",
            marginBottom: "12px",
          }}
        />

        <input
          placeholder="Estimated Value (£)"
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            backgroundColor: "#000",
            border: "1px solid #27272a",
            color: "#fff",
            marginBottom: "24px",
          }}
        />

        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "14px", borderRadius: "12px", background: "#27272a", color: "#fff", border: "none", fontWeight: "bold" }}>
            CANCEL
          </button>
          <button
            onClick={handleUpload}
            disabled={loading}
            style={{
              flex: 2,
              padding: "14px",
              borderRadius: "12px",
              background: "#fff",
              color: "#000",
              border: "none",
              fontWeight: "900",
            }}
          >
            {loading ? "UPLOADING..." : "POST PIECE"}
          </button>
        </div>
      </div>
    </div>
  );
}
