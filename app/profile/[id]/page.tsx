// app/profile/[id]/page.tsx
import React from "react";
import AvatarUpload from "@/app/profile/[id]/AvatarUpload"; // client wrapper
import MyVault, { VaultStats } from "@/components/MyVault";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing required Supabase env vars for server-side profile page");
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

type Props = {
  params: { id: string };
};

export default async function ProfilePage({ params }: Props) {
  const userId = params.id;
  if (!userId) return notFound();

  // Fetch profile and basic vault stats server-side
  // Adjust table/column names to match your schema
  const [profileResp, itemsCountResp, categoriesResp, rarityResp] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, full_name, avatar_url, bio").eq("id", userId).maybeSingle(),
    supabaseAdmin.from("items").select("id", { count: "exact", head: true }).eq("owner_id", userId),
    supabaseAdmin
      .from("items")
      .select("category", { count: "exact", head: true })
      .eq("owner_id", userId)
      .neq("category", null),
    // Optional: call an RPC to compute rarity if you have one; fallback to 0
    supabaseAdmin.rpc("calculate_rarity_score", { p_user_id: userId }).then((r) => r).catch(() => ({ data: null })),
  ]);

  if (profileResp.error) {
    console.error("Failed to load profile:", profileResp.error);
    return notFound();
  }

  const profile = profileResp.data ?? null;
  if (!profile) return notFound();

  const itemsCount = Number(itemsCountResp.count ?? 0);
  const categoriesCount = Number(categoriesResp.count ?? 0);
  const rarityScore = Number(rarityResp?.data?.score ?? 0);

  const initialStats: VaultStats = {
    itemsCount,
    categoriesCount,
    rarityScore,
    topCategories: undefined, // MyVault will fetch or use defaults if needed
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left column: profile card + avatar upload */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col items-center gap-4">
              {/* AvatarUpload is a client wrapper that mounts AvatarUploader */}
              <AvatarUpload />
              <h3 className="text-lg font-semibold">{profile.full_name ?? "Unnamed"}</h3>
              {profile.bio && <p className="text-sm text-gray-600 text-center">{profile.bio}</p>}
            </div>
          </div>
        </div>

        {/* Right column: MyVault */}
        <div className="md:col-span-2">
          <MyVault userId={userId} initial={initialStats} />
          {/* Additional content (items list, filters) can go here */}
        </div>
      </div>
    </main>
  );
}
