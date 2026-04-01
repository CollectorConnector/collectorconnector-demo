"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: collectionsData } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", user.id);

      setCollections(collectionsData || []);
    }

    loadData();
  }, []);

  return (
    <div className="p-6 text-white w-full">

      <h2 className="text-lg font-semibold mb-4">Collections (Test Mode)</h2>

      {collections.length === 0 ? (
        <p className="text-gray-500 text-sm">No collections yet.</p>
      ) : (
        // ⭐ OUTER WRAPPER — MUST SCROLL
        <div
          className="w-full overflow-x-auto"
          style={{ border: "2px solid red", paddingBottom: "12px" }}
        >
          {/* ⭐ INNER ROW — MUST BE HORIZONTAL */}
          <div
            className="flex flex-row flex-nowrap gap-4"
            style={{
              border: "2px solid lime",
              width: "max-content",
              padding: "8px",
            }}
          >
            {collections.map((col) => (
              <div
                key={col.id}
                className="w-32 flex-shrink-0"
                style={{
                  border: "2px solid cyan",
                  background: "rgba(0,255,255,0.1)",
                }}
              >
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-white/10 bg-[#111]">
                  <img
                    src={col.cover_url || "/CC-main-logo.png"}
                    alt={col.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <p className="mt-2 text-sm font-semibold truncate">
                  {col.name}
                </p>
                <p className="text-xs text-gray-400">
                  {col.item_count || 0} items
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
