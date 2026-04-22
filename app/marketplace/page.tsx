import { supabase } from '@/lib/supabase';
import CollectionsGrid from '@/components/CollectionsGrid';

export default async function MarketplacePage() {
  // Fetch collections that have at least one item where for_sale is true
  const { data: collections } = await supabase
    .from('collections')
    .select(`
      *, 
      items!inner (
        image_url, 
        for_sale, 
        price
      )
    `)
    .eq('items.for_sale', true);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Marketplace</h1>
      {/* Pass the collections to the grid */}
      <CollectionsGrid items={collections} />
    </div>
  );
}
