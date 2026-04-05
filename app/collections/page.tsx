"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // Added this
import { supabase } from "@/lib/supabase";
import CollectionsGrid from "@/components/CollectionsGrid";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MyCollectionsPage() {
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const queryUserId = searchParams.get("user"); // Look for ?user=...

  useEffect(() => {
    async function getUser() {
      // If there is a user ID in the URL, use that.
      if (queryUserId) {
        setTargetUserId(queryUserId);
        return;
      }

      // Otherwise, fallback to the logged in user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setTargetUserId(user.id);
      }
    }

    getUser();
  }, [queryUserId]);

  if (!targetUserId) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="mt-20 px-4 max-w-[720px] mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {queryUserId ? "User Collections" : "My Collections"}
        </h1>
        <CollectionsGrid userId={targetUserId} />
      </div>
      <Footer />
    </div>
  );
}
