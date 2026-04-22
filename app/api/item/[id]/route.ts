import { supabase } from "@/lib/supabase";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const itemId = params.id;

  // Fetch item + seller's Stripe account ID
  const { data: item, error } = await supabase
    .from("items")
    .select("*, profiles(stripe_account_id)")
    .eq("id", itemId)
    .single();

  if (error || !item) {
    return new Response(JSON.stringify({ error: "Item not found" }), { status: 404 });
  }

  return new Response(JSON.stringify(item), { status: 200 });
}

