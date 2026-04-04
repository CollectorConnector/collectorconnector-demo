"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import CollectionsGrid from "@/components/CollectionsGrid";

export default function MyCollectionsPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
      }
    }

    getUser();
  }, []);

  if (!userId) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <h1 className="text-xl font-semibold px-4 py-4">My Collections</h1>
      <CollectionsGrid userId={userId} />
    </div>
  );
}

