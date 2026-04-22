import { supabase } from '@/lib/supabase'; // Adjust import path
import CollectionsGrid from '@/components/CollectionsGrid';

export default async function MarketplacePage() {
  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('for_sale', true);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Marketplace</h1>
      <CollectionsGrid items={items} />
    </div>
  );
}
