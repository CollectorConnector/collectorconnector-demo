"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Correct import

export default function ProfilePage() {
  const { username } = useParams();

  // FIXED TYPESCRIPT ERRORS
  const [userData, setUserData] = useState<any>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("collections");

  // Load profile + collections + activity
  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      setUserData(data);
    }

    async function loadCollections() {
      const { data } = await supabase
        .from("collections")
        .select("*")
        .eq("username", username);

      setCollections(data || []);
    }

    async function loadActivity() {
      const { data } = await supabase
        .from("activity")
        .select("*")
        .eq("username", username);

      setActivity(data || []);
    }

    loadProfile();
    loadCollections();
    loadActivity();
  }, [username]);

  if (!userData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // Tier badge styling
  const tierColors = {
    FOUNDER: "text-cyan-300 bg-cyan-900/30",
    GOLD: "text-yellow-400 bg-yellow-900/30",
    SILVER: "text-gray-300 bg-gray-700/40",
    BRONZE: "text-orange-400 bg-orange-900/30",
    STANDARD: "text-gray-500 bg-gray-800"
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">

      {/* LOGO / NAV */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-md" />
          <h1 className="text-xl font-bold">CollectorConnector</h1>
        </div>

        <div className="flex items-center gap-4">
          <button>Search</button>
          <button>Messages</button>
        </div>
      </header>

      {/* PROFILE HEADER */}
      <section className="flex items-start gap-4 mb-6">
        <img
          src={userData.avatar_url || "/default-avatar.png"}
          className="w-20 h-20 rounded-full object-cover"
        />

        <div className="flex-1">
          <h2 className="text-2xl font-bold">{userData.full_name}</h2>

          <div
            className={`mt-1 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${tierColors[userData.tier]}`}
          >
            💎 {userData.tier}
          </div>

          <p className="text-gray-300 mt-2">{userData.bio}</p>
          <p className="text-gray-500 text-sm mt-1">{userData.location}</p>

          <div className="flex gap-3 mt-4">
            <button className="px-4 py-2 bg-white text-black rounded-lg font-semibold">
              Follow
            </button>
            <button className="px-4 py-2 border border-gray-600 rounded-lg font-semibold">
              Message
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-4 text-center mb-6">
        <div>
          <p className="text-xl font-bold">{userData.item_count}</p>
          <p className="text-gray-400 text-sm">Items</p>
        </div>
        <div>
          <p className="text-xl font-bold">{userData.category_count}</p>
          <p className="text-gray-400 text-sm">Categories</p>
        </div>
        <div>
          <p className="text-xl font-bold">{userData.rarity_score}</p>
          <p className="text-gray-400 text-sm">Rarity</p>
        </div>
        <div>
          <p className="text-xl font-bold">{userData.years_collecting}</p>
          <p className="text-gray-400 text-sm">Years</p>
        </div>
      </section>

      {/* TABS */}
      <div className="flex gap-6 border-b border-gray-800 mb-6">
        <button
          onClick={() => setActiveTab("collections")}
          className={`pb-3 font-semibold ${
            activeTab === "collections"
              ? "border-b-2 border-green-500 text-green-400"
              : "text-gray-400"
          }`}
        >
          Collections
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`pb-3 font-semibold ${
            activeTab === "activity"
              ? "border-b-2 border-green-500 text-green-400"
              : "text-gray-400"
          }`}
        >
          Activity
        </button>
      </div>

      {/* COLLECTIONS */}
      {activeTab === "collections" && (
        <section>
          <div className="grid grid-cols-3 gap-3">
            {collections.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800 h-40 rounded-lg overflow-hidden"
              >
                <img
                  src={item.image_url}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ACTIVITY */}
      {activeTab === "activity" && (
        <section className="mt-6">
          {activity.map((post) => (
            <div
              key={post.id}
              className="bg-gray-900 p-4 rounded-lg mb-4"
            >
              <p className="text-sm text-gray-400 mb-2">
                {new Date(post.created_at).toLocaleString()}
              </p>
              <p className="mb-3">{post.text}</p>

              {post.image_url && (
                <img
                  src={post.image_url}
                  className="w-full h-40 object-cover rounded-lg"
                />
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
