import { createClient } from "@/utils/supabase/server";
import TierBadge from "@/components/TierBadge";

export default async function ProfilePage({ params }) {
  const supabase = createClient();

  // 1. Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .single();

  // 2. Fetch collections
  const { data: collections } = await supabase
    .from("collections")
    .select("*")
    .eq("user_id", params.id);

  // 3. Stats
  const totalItems = collections?.reduce(
    (sum, col) => sum + (col.item_count || 0),
    0
  );

  // ⭐ 4. REAL BADGE LOGIC
  const STACY_UUID = "YOUR-UUID-HERE"; // replace this once you grab your UUID

  const isStacy = profile?.id === STACY_UUID;
  const tier = isStacy ? "DIAMOND" : profile?.tier;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

      {/* 1. Profile Hero */}
      <section className="flex flex-col items-center text-center space-y-3">
        <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-md">
          <img
            src={profile?.avatar_url || "/default-avatar.png"}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <h1 className="text-2xl font-semibold">{profile?.name}</h1>
          <p className="text-sm text-gray-500">@{profile?.username}</p>
        </div>

        {/* Tier Badge */}
        <div className="flex items-center justify-center">
          <TierBadge tier={tier} />
        </div>

        {/* Collector Niche */}
        {profile?.niche && (
          <p className="text-sm text-gray-600">{profile.niche}</p>
        )}
      </section>

      {/* 2. Stats Row */}
      <section className="grid grid-cols-4 text-center py-4 border-y border-gray-200">
        <div>
          <p className="font-semibold">{collections?.length || 0}</p>
          <p className="text-xs text-gray-500">Collections</p>
        </div>
        <div>
          <p className="font-semibold">{totalItems || 0}</p>
          <p className="text-xs text-gray-500">Items</p>
        </div>
        <div>
          <p className="font-semibold">{profile?.followers || 0}</p>
          <p className="text-xs text-gray-500">Followers</p>
        </div>
        <div>
          <p className="font-semibold">{profile?.following || 0}</p>
          <p className="text-xs text-gray-500">Following</p>
        </div>
      </section>

      {/* 3. Social Actions */}
      <section className="flex gap-3 justify-center">
        <button className="px-5 py-2 rounded-full bg-black text-white font-medium shadow-sm">
          Message
        </button>
        <button className="px-5 py-2 rounded-full bg-gray-100 text-gray-800 font-medium shadow-sm">
          Follow
        </button>
      </section>

      {/* 4. Collections Grid */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Collections</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {collections?.map((col) => (
            <div
              key={col.id}
              className="rounded-xl overflow-hidden shadow-sm bg-white"
            >
              <img
                src={col.cover_image || "/placeholder-collection.jpg"}
                className="w-full h-32 object-cover"
              />
              <div className="p-3">
                <p className="font-medium">{col.title}</p>
                <p className="text-xs text-gray-500">
                  {col.item_count || 0} items
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Activity Feed */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Activity</h2>

        <div className="space-y-2">
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            {profile?.name} added new items recently
          </div>
        </div>
      </section>

      {/* 6. About Section */}
      {profile?.bio && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">About</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {profile.bio}
          </p>
        </section>
      )}
    </div>
  );
}
