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

    if (itemsCountResp.error) {
      throw itemsCountResp.error;
    }
    const itemsCount = Number(itemsCountResp.count ?? 0);

    // 2) categories count (distinct categories count)
    // Use a lightweight query to fetch distinct categories (PostgREST distinct)
    const categoriesResp = await supabaseAdmin
      .from("items")
      .select("category", { count: "exact" })
      .eq("owner_id", userId)
      .neq("category", null)
      .limit(1); // we only need count metadata, not rows

    if (categoriesResp.error) {
      throw categoriesResp.error;
    }
    // PostgREST returns count of rows matching the filter; this is the number of items with non-null category.
    // To get number of distinct categories we will fetch distinct categories below.
    // 3) fetch categories list (distinct) and compute top categories in JS
    const categoriesListResp = await supabaseAdmin
      .from("items")
      .select("category")
      .eq("owner_id", userId)
      .neq("category", null)
      .limit(10000); // adjust limit if you expect >10k rows; consider a SQL GROUP BY for large datasets

    if (categoriesListResp.error) {
      throw categoriesListResp.error;
    }

    const rows = categoriesListResp.data ?? [];

    // Aggregate counts per category
    const countsMap: Record<string, number> = {};
    for (const r of rows) {
      const cat = (r as any).category ?? "Unknown";
      countsMap[cat] = (countsMap[cat] || 0) + 1;
    }

    // Sort categories by count desc and take top 4
    const topCategories = Object.entries(countsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([cat]) => cat);

    // 4) rarity score: try RPC, fallback to 0
    let rarityScore = 0;
    try {
      const rarityResp = await supabaseAdmin.rpc("calculate_rarity_score", { p_user_id: userId });
      if (!rarityResp.error && rarityResp.data && typeof (rarityResp.data as any).score !== "undefined") {
        rarityScore = Number((rarityResp.data as any).score ?? 0);
      }
    } catch {
      rarityScore = 0;
    }

    // 5) number of distinct categories
    const distinctCategoriesCount = topCategories.length;

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
