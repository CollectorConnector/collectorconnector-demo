// app/profile/[id]/page.tsx
import React from "react";
import MyVault from "@/components/MyVault";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

type Props = { params: { id: string } };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

const supabaseAdmin = hasSupabase
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

export default async function ProfilePage({ params }: Props) {
  const userId = params?.id;
  if (!userId) return notFound();

  // Minimal server-side profile fetch: guarded so missing env or RPC won't crash the page.
  let profile: { id: string; full_name?: string; avatar_url?: string; bio?: string } | null = null;
  let itemsCount = 0;
  let categoriesCount = 0;
  let rarityScore = 0;

  if (supabaseAdmin) {
    try {
      const [profileResp, itemsCountResp, categoriesResp] = await Promise.all([
        supabaseAdmin.from("profiles").select("id, full_name, avatar_url, bio").eq("id", userId).maybeSingle(),
        supabaseAdmin.from("items").select("id", { count: "exact", head: true }).eq("owner_id", userId),
        supabaseAdmin.from("items").select("category", { count: "exact", head: true }).eq("owner_id", userId).neq("category", null),
      ]);

      if (!profileResp.error) profile = profileResp.data ?? null;
      itemsCount = Number(itemsCountResp.count ?? 0);
      categoriesCount = Number(categoriesResp.count ?? 0);

      // RPC for rarityScore (safe)
      try {
        const rarityResp = await supabaseAdmin.rpc("calculate_rarity_score", { p_user_id: userId });
        if (!rarityResp.error && rarityResp.data && typeof (rarityResp.data as any).score !== "undefined") {
          rarityScore = Number((rarityResp.data as any).score ?? 0);
        }
      } catch {
        rarityScore = 0;
      }
    } catch (err) {
      // swallow server-side fetch errors — page will still render with fallback values
      console.warn("ProfilePage supabase fetch error:", err);
    }
  }

  // If profile not found in DB but we still want to render a page, show fallback content
  if (!profile) {
    profile = { id: userId, full_name: `User ${userId}`, bio: undefined, avatar_url: undefined };
  }

  const initialStats = {
    itemsCount,
    categoriesCount,
    rarityScore,
    topCategories: undefined,
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={`${profile.full_name ?? "User"} avatar`} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-500">No avatar</div>
              )}
            </div>

            <h3 className="text-lg font-semibold">{profile.full_name ?? "Unnamed"}</h3>
            {profile.bio && <p className="text-sm text-gray-600 text-center">{profile.bio}</p>}
            <p className="text-xs text-gray-400">ID: {profile.id}</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <MyVault userId={userId} initial={initialStats} />
        </div>
      </div>
    </main>
  );
}
