// app/api/vault-stats/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

const supabaseAdmin = hasSupabase
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId") ?? "unknown";

    if (!supabaseAdmin) {
      return NextResponse.json({
        itemsCount: 0,
        categoriesCount: 0,
        rarityScore: 0,
        topCategories: ["Cards", "Coins"],
        userId,
      });
    }

    // items count
    const itemsCountResp = await supabaseAdmin.from("items").select("id", { count: "exact", head: true }).eq("owner_id", userId);
    if (itemsCountResp.error) throw itemsCountResp.error;
    const itemsCount = Number(itemsCountResp.count ?? 0);

    // fetch categories list and aggregate in JS (safe)
    const categoriesListResp = await supabaseAdmin.from("items").select("category").eq("owner_id", userId).neq("category", null).limit(10000);
    if (categoriesListResp.error) throw categoriesListResp.error;
    const rows = categoriesListResp.data ?? [];
    const counts: Record<string, number> = {};
    for (const r of rows) {
      const cat = (r as any).category ?? "Unknown";
      counts[cat] = (counts[cat] || 0) + 1;
    }
    const topCategories = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => k);
    const distinctCategoriesCount = Object.keys(counts).length;

    // optional RPC for rarity
    let rarityScore = 0;
    try {
      const rarityResp = await supabaseAdmin.rpc("calculate_rarity_score", { p_user_id: userId });
      if (!rarityResp.error && rarityResp.data && typeof (rarityResp.data as any).score !== "undefined") {
        rarityScore = Number((rarityResp.data as any).score ?? 0);
      }
    } catch {
      rarityScore = 0;
    }

    return NextResponse.json({
      itemsCount,
      categoriesCount: distinctCategoriesCount,
      rarityScore,
      topCategories,
      userId,
    });
  } catch (err: any) {
    console.error("vault-stats error:", err);
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
