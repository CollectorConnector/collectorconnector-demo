// app/api/vault-stats/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing required Supabase env vars");
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    // 1) items count (exact)
    const itemsCountResp = await supabaseAdmin
      .from("items")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userId);

    if (itemsCountResp.error) throw itemsCountResp.error;
    const itemsCount = Number(itemsCountResp.count ?? 0);

    // 2) fetch categories list (non-null) and aggregate in JS
    //    limit set to 10000 to avoid unbounded memory use; for larger datasets use SQL GROUP BY (see note).
    const categoriesListResp = await supabaseAdmin
      .from("items")
      .select("category")
      .eq("owner_id", userId)
      .neq("category", null)
      .limit(10000);

    if (categoriesListResp.error) throw categoriesListResp.error;
    const rows = categoriesListResp.data ?? [];

    const countsMap: Record<string, number> = {};
    for (const r of rows) {
      const cat = (r as any).category ?? "Unknown";
      countsMap[cat] = (countsMap[cat] || 0) + 1;
    }

    const topCategories = Object.entries(countsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([cat]) => cat);

    const distinctCategoriesCount = Object.keys(countsMap).length;

    // 3) rarity score via RPC if available
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
    });
  } catch (err: any) {
    console.error("vault-stats error:", err);
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
