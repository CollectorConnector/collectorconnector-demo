import AddItemForm from "@/components/AddItemForm";
import { supabase } from "@/lib/supabase";

export default async function CollectionPage({ params }: any) {
  const { id } = params;

  const { data: items } = await supabase
    .from("items")
    .select("*")
    .eq("collection_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Collection</h1>

      <AddItemForm collectionId={id} />

      <div className="grid grid-cols-2 gap-4 mt-6">
        {items?.map((item) => (
          <div key={item.id} className="border p-2 rounded">
            <img src={item.image_url} className="w-full rounded" />
            <h2 className="font-semibold mt-2">{item.title}</h2>
            <p className="text-sm text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
