// app/api/vault-stats/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    // Example queries — adapt to your schema
    const [{ count: itemsCount }, { count: categoriesCount }, rarityResp] = await Promise.all([
      supabaseAdmin
        .from("items")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", userId),
      supabaseAdmin
        .from("items")
        .select("category", { count: "exact", head: true })
        .eq("owner_id", userId)
        .neq("category", null),
      supabaseAdmin.rpc("calculate_rarity_score", { p_user_id: userId }).then((r) => r), // optional RPC
    ]);

    // Fallback rarity if RPC not present
    const rarityScore = (rarityResp?.data && rarityResp.data.score) ?? 0;

    // Top categories sample query
    const { data: topCats } = await supabaseAdmin
      .from("items")
      .select("category, count:count")
      .eq("owner_id", userId)
      .group("category")
      .order("count", { ascending: false })
      .limit(4);

    const topCategories = (topCats ?? []).map((r: any) => r.category).filter(Boolean);

    return NextResponse.json({
      itemsCount: Number(itemsCount ?? 0),
      categoriesCount: Number(categoriesCount ?? 0),
      rarityScore: Number(rarityScore ?? 0),
      topCategories,
    });
  } catch (err: any) {
    console.error("vault-stats error:", err);
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
