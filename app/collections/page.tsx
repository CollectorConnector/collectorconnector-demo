"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CollectionsGrid from "@/components/CollectionsGrid";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// 1. This component handles the search params logic
function CollectionsContent() {
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const queryUserId = searchParams.get("user");

  useEffect(() => {
    async function getUser() {
      // Priority 1: User ID from the URL (?user=...)
      if (queryUserId) {
        setTargetUserId(queryUserId);
        return;
      }

      // Priority 2: Fallback to the currently logged in user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setTargetUserId(user.id);
      }
    }

    getUser();
  }, [queryUserId]);

  if (!targetUserId) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-500">Loading collection data...</p>
      </div>
    );
  }

  return (
    <div className="mt-20 px-4 max-w-[720px] mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {queryUserId ? "User Collections" : "My Collections"}
      </h1>
      <CollectionsGrid userId={targetUserId} />
    </div>
  );
}

// 2. This is the main page that wraps everything in Suspense
export default function MyCollectionsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      {/* Next.js requires useSearchParams to be inside a Suspense boundary 
          to allow the rest of the site to build statically.
      */}
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </div>
      }>
        <CollectionsContent />
      </Suspense>

      <Footer />
    </div>
  );
}
