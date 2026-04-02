"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useInstagramImport } from "@/hooks/useInstagramImport";

interface ImportInstagramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportInstagramModal({ isOpen, onClose }: ImportInstagramModalProps) {
  const {
    username,
    setUsername,
    posts,
    selected,
    toggleSelect,
    fetchPosts,
    importSelected,
    loading,
    importing,
    progress,
    selectedCollectionId,
    setSelectedCollectionId,
  } = useInstagramImport();

  // ⭐ Load user collections
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    const loadCollections = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error) setCollections(data);
    };

    if (isOpen) loadCollections();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Import from Instagram</h2>

        {/* Username input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Instagram Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. cardcollector123"
          />
        </div>

        {/* Fetch button */}
        <button
          onClick={fetchPosts}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded mb-4"
        >
          {loading ? "Fetching…" : "Fetch Posts"}
        </button>

        {/* Posts grid */}
        {posts.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => toggleSelect(post.id)}
                className={`relative cursor-pointer border rounded overflow-hidden ${
                  selected.includes(post.id) ? "ring-2 ring-black" : ""
                }`}
              >
                <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* ⭐ Collection picker */}
        {posts.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Choose a collection</label>
            <select
              value={selectedCollectionId}
              onChange={(e) => setSelectedCollectionId(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select a collection…</option>

              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Import button */}
        {selected.length > 0 && (
          <button
            onClick={importSelected}
            disabled={importing}
            className="w-full bg-black text-white py-2 rounded mt-4"
          >
            {importing
              ? `Importing ${progress.current}/${progress.total}…`
              : `Import ${selected.length} Items`}
          </button>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full text-center text-sm text-gray-500 mt-4"
        >
          Close
        </button>
      </div>
    </div>
  );
}
