"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface Collection {
  id: string;
  title: string | null;
  cover_url: string | null;
}

export default function CollectionsGrid({ userId }: { userId: string }) {
  const supabase = createClient();
  const router = useRouter();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollections() {
      const { data, error } = await supabase
        .from("collections")
        .select("id, title, cover_url")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setCollections(data);
      }

      setLoading(false);
    }

    fetchCollections();
  }, [userId]);

  if (loading) {
    return (
      <div className="text-center text-white py-10">
        Loading collections…
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="text-center text-white py-10">
        No collections yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 p-2">
      {collections.map((collection) => (
        <div
          key={collection.id}
          onClick={() => router.push(`/collections/${collection.id}`)}
          className="relative w-full aspect-square rounded-[22%] overflow-hidden bg-[#111] flex items-center justify-center active:opacity-80 transition"
        >
          {collection.cover_url ? (
            <img
              src={collection.cover_url}
              alt={collection.title || "Collection"}
              className="w-full h-full object-contain"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-xs"
              style={{
                background: "linear-gradient(135deg, #111, #1a1a1a)",
              }}
            >
              No image yet
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

