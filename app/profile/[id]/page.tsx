export default function ProfilePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

      {/* 1. Profile Hero */}
      <section className="flex flex-col items-center text-center space-y-3">
        <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-md">
          {/* Profile Photo */}
          <img src="/default-avatar.png" alt="Profile" className="w-full h-full object-cover" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold">Stacy Pearce</h1>
          <p className="text-sm text-gray-500">@stacy</p>
        </div>

        {/* Tier Badge */}
        <div className="flex items-center justify-center">
          <img src="/diamond.png" alt="Diamond Badge" className="w-8 h-8" />
        </div>

        {/* Collector Niche */}
        <p className="text-sm text-gray-600">
          Vintage Watches • Pokémon • Pub Tokens
        </p>
      </section>

      {/* 2. Stats Row */}
      <section className="grid grid-cols-4 text-center py-4 border-y border-gray-200">
        <div>
          <p className="font-semibold">12</p>
          <p className="text-xs text-gray-500">Collections</p>
        </div>
        <div>
          <p className="font-semibold">248</p>
          <p className="text-xs text-gray-500">Items</p>
        </div>
        <div>
          <p className="font-semibold">134</p>
          <p className="text-xs text-gray-500">Followers</p>
        </div>
        <div>
          <p className="font-semibold">89</p>
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
          {/* Example Collection Card */}
          <div className="rounded-xl overflow-hidden shadow-sm bg-white">
            <img src="/placeholder-collection.jpg" className="w-full h-32 object-cover" />
            <div className="p-3">
              <p className="font-medium">Vintage Watches</p>
              <p className="text-xs text-gray-500">18 items</p>
            </div>
          </div>

          {/* Duplicate this card for more collections */}
        </div>
      </section>

      {/* 5. Activity Feed (Optional) */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Activity</h2>

        <div className="space-y-2">
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            Stacy added 3 new items to <span className="font-medium">Vintage Watches</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            Stacy created a new collection: <span className="font-medium">Pub Tokens</span>
          </div>
        </div>
      </section>

      {/* 6. About Section */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">About</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Collector of stories, history, and beautiful objects. Passionate about
          vintage watches, rare Pokémon cards, and the hidden world of pub tokens.
        </p>
      </section>

    </div>
  );
}
