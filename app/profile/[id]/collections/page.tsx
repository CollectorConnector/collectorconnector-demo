import CollectionsGrid from "@/components/CollectionsGrid";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default async function CollectionsPage({ params }: { params: { id: string } }) {
  // 1. Fetch data directly in the Server Component
  const { data: collections } = await supabase
    .from("collections")
    .select(`
      *, 
      items (image_url)
    `)
    .eq("user_id", params.id)
    .order("created_at", { ascending: false });

  // 2. Fetch profile name for the header title
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_url")
    .eq("id", params.id)
    .single();

  const title = profile?.display_url || profile?.username || "Collector";

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main style={{ marginTop: '100px', maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <Link href={`/profile/${params.id}`} style={{ color: '#52525b', textDecoration: 'none' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <h1 style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {title}'S COLLECTIONS
          </h1>
        </div>

        {collections && collections.length > 0 ? (
          /* Pass the fetched data as 'items' */
          <CollectionsGrid items={collections} />
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', border: '1px solid #27272a', borderRadius: '24px', color: '#52525b' }}>
            <p style={{ fontWeight: 'bold' }}>No collections found.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
