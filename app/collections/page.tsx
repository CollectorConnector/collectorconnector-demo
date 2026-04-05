"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CollectionsGrid from "@/components/CollectionsGrid";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function CollectionsContent() {
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const queryUserId = searchParams.get("user");

  useEffect(() => {
    async function getUser() {
      let finalId = queryUserId;

      if (!finalId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) finalId = user.id;
      }

      if (finalId) {
        setTargetUserId(finalId);
        // Fetch the username so the header looks personalized
        const { data: prof } = await supabase.from("profiles").select("username").eq("id", finalId).single();
        if (prof) setUsername(prof.username);
      }
    }
    getUser();
  }, [queryUserId]);

  if (!targetUserId) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>
        SYNCING VAULT...
      </div>
    );
  }

  return (
    /* MATCHING THE PROFILE SPACING: 100px margin top, 800px max width */
    <main style={{ marginTop: '100px', paddingBottom: '80px', maxWidth: '800px', margin: '100px auto 0', padding: '0 16px' }}>
      
      {/* HEADER SECTION - Styled like the Profile Stats */}
      <header style={{ 
        background: '#09090b', 
        border: '1px solid #27272a', 
        borderRadius: '24px', 
        padding: '24px', 
        marginBottom: '24px',
        textAlign: 'center' 
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>
          {username ? `${username}'S VAULT` : "COLLECTIONS"}
        </h1>
        <p style={{ color: '#52525b', fontSize: '12px', fontWeight: 'bold', marginTop: '4px', letterSpacing: '1px' }}>
          DIGITAL ARCHIVE
        </p>
      </header>

      {/* THE GRID */}
      <div style={{ background: '#000', borderRadius: '24px' }}>
        <CollectionsGrid userId={targetUserId} />
      </div>
    </main>
  );
}

export default function MyCollectionsPage() {
  return (
    <div className="min-h-screen bg-black text-white" style={{ background: '#000' }}>
      <Header />
      <Suspense fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontWeight: '900' }}>LOADING...</p>
        </div>
      }>
        <CollectionsContent />
      </Suspense>
      <Footer />
    </div>
  );
}
