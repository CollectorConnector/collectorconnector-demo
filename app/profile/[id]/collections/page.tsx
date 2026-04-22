import CollectionsGrid from "@/components/CollectionsGrid";
import { supabase } from "@/lib/supabase";

export default async function CollectionsPage({ params }: { params: { id: string } }) {
  // 1. Fetch data directly in the Server Component
  const { data: collections } = await supabase
    .from("collections")
    .select(`*, items (image_url)`)
    .eq("user_id", params.id);

  return (
    <div className="min-h-screen bg-black text-white">
      <h1 className="text-xl font-semibold px-4 py-4">Collections</h1>
      
      {/* 2. Pass the fetched data as 'items' instead of 'userId' */}
      <CollectionsGrid items={collections} />
    </div>
  );
}
