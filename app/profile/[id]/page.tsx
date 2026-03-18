// app/profile/[id]/page.tsx
import React from "react";
import MyVault from "@/components/MyVault";
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

  // Server-side fetch: profile + counts
  const [profileResp, itemsCountResp, categoriesResp] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, full_name, avatar_url, bio").eq("id", userId).maybeSingle(),
    supabaseAdmin.from("items").select("id", { count: "exact", head: true }).eq("owner_id", userId),
    // count of items with non-null category (not distinct categories)
    supabaseAdmin.from("items").select("category", { count: "exact", head: true }).eq("owner_id", userId).neq("category", null),
  ]);

  if (profileResp.error) {
    console.error("Failed to load profile:", profileResp.error);
    return notFound();
  }

  const profile = profileResp.data ?? null;
  if (!profile) return notFound();

  const itemsCount = Number(itemsCountResp.count ?? 0);
  const categoriesCount = Number(categoriesResp.count ?? 0);

  // Optional RPC for rarityScore (safe try/catch)
  let rarityScore = 0;
  try {
    const rarityResp = await supabaseAdmin.rpc("calculate_rarity_score", { p_user_id: userId });
    if (!rarityResp.error && rarityResp.data && typeof (rarityResp.data as any).score !== "undefined") {
      rarityScore = Number((rarityResp.data as any).score ?? 0);
    }
  } catch (err) {
    rarityScore = 0;
  }

  const initialStats = {
    itemsCount,
    categoriesCount,
    rarityScore,
    topCategories: undefined,
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center gap-4">
            {/* Placeholder avatar area — replace with your AvatarUpload client component if present */}
            <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                // server-rendered image tag; if your avatar URLs are private, replace with client preview logic
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={`${profile.full_name ?? "User"} avatar`} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-500">No avatar</div>
              )}
            </div>

            <h3 className="text-lg font-semibold">{profile.full_name ?? "Unnamed"}</h3>
            {profile.bio && <p className="text-sm text-gray-600 text-center">{profile.bio}</p>}
          </div>
        </div>

        <div className="md:col-span-2">
          <MyVault userId={userId} initial={initialStats} />
        </div>
      </div>
    </main>
  );
}
