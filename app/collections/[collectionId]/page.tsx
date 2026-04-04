"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Collection = {
  id: string;
  user_id: string;
  title: string;
  niche: string | null;
  cover_url: string | null;
  item_count: number | null;
};

type Item = {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
  estimated_value: number | null;
  collection_id: string | null;
};

export default function CollectionPage() {
  const params = useParams<{ collectionId: string }>();
  const router = useRouter();
  const collectionId = params.collectionId;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Add Item modal state
  const [showAddItem, setShowAddItem] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  const isOwner = currentUserId && collection && currentUserId === collection.user_id;

  // Load collection + items
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Load collection
        const { data: col, error: colErr } = await supabase
          .from("collections")
          .select("*")
          .eq("id", collectionId)
          .single();

        if (colErr || !col) {
          setCollection(null);
          return;
        }

        setCollection(col as Collection);

        // Load items
        const { data: itemData } = await supabase
          .from("items")
          .select("*")
          .eq("collection_id", collectionId)
          .order("created_at", { ascending: false });

        setItems((itemData as Item[]) || []);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [collectionId]);

  // Add Item upload logic
  async function handleUpload() {
    if (!file || !currentUserId || !collection) {
      alert("Please select a file");
      return;
    }

    setUploading(true);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `item-${Date.now()}.${ext}`;
      const filePath = `${currentUserId}/items/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("items")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("items")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from("items")
        .insert({
          user_id: currentUserId,
          collection_id: collection.id,
          image_url: urlData.publicUrl,
          title: "New Item",
          description: "",
          estimated_value: null,
        });

      if (insertError) throw insertError;

      setShowAddItem(false);
      setPreview(null);
      setFile(null);

      // Reload items
      const { data: itemData } = await supabase
        .from("items")
        .select("*")
        .eq("collection_id", collection.id)
        .order("created_at", { ascending: false });

      setItems((itemData as Item[]) || []);
    } catch (err) {
      console.error(err);
      alert("Upload failed — check console");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading…
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-3xl">Collection not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 max-w-[720px] mx-auto">

      {/* Cover */}
      <div className="w-full flex justify-center mb-8">
        <img
          src={collection.cover_url || "/CC-main-logo.png"}
          alt={collection.title}
          className="w-64 h-64 object-cover rounded-2xl border border-zinc-700"
        />
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold text-center mb-4">{collection.title}</h1>

      {/* Niche */}
      {collection.niche && (
        <p className="text-center text-zinc-400 text-xl mb-6">
          {collection.niche}
        </p>
      )}

      {/* Add Item button (owner only) */}
      {isOwner && (
        <div className="flex justify-center mb-10">
          <button
            onClick={() => setShowAddItem(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-full text-lg font-medium"
          >
            + Add Item
          </button>
        </div>
      )}

      {/* Items grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <p className="col-span-3 text-center text-zinc-500 text-xl py-12">
            No items yet — add your first one!
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900"
            >
              <img
                src={item.image_url || "/default-item.png"}
                alt={item.title || "Item"}
                className="w-full h-40 object-cover"
              />
              <div className="p-3">
                <p className="text-white font-medium truncate">
                  {item.title || "Untitled"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-neutral-900 p-6 rounded-xl w-80">
            <h2 className="text-lg font-semibold mb-4">Add Item</h2>

            {!preview && (
              <label className="border border-neutral-700 rounded-lg p-4 flex items-center justify-center cursor-pointer hover:bg-neutral-800 transition">
                Choose Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                      setFile(selectedFile);
                      setPreview(URL.createObjectURL(selectedFile));
                    }
                  }}
                />
              </label>
            )}

            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="rounded-lg mb-4 max-h-60 object-cover"
              />
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowAddItem(false)}
                className="flex-1 border border-neutral-700 rounded-lg py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleUpload}
                className="flex-1 bg-white text-black rounded-lg py-2 font-semibold"
              >
                {uploading ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
