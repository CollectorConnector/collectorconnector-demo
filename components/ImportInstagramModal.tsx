"use client";

import { useInstagramImport } from "@/hooks/useInstagramImport";

export default function ImportInstagramModal({ onClose }) {
  const {
    username,
    setUsername,
    posts,
    selected,
    toggleSelect,
    fetchPosts,
    importSelected,
    loading,
    importing,
    progress,
  } = useInstagramImport();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6">
      <div className="bg-zinc-900 p-8 rounded-2xl w-full max-w-3xl">
        <h2 className="text-3xl font-bold mb-6">Import from Instagram</h2>

        {!posts.length ? (
          <>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Instagram username"
              className="w-full p-4 rounded bg-zinc-800 border border-zinc-700 mb-4"
            />

            <button
              onClick={fetchPosts}
              className="w-full py-4 bg-indigo-600 rounded-lg text-xl"
            >
              {loading ? "Fetching..." : "Fetch Posts"}
            </button>
          </>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
              {posts.map((p) => (
                <div
                  key={p.id}
                  className={`relative cursor-pointer border ${
                    selected.includes(p.id)
                      ? "border-indigo-500"
                      : "border-zinc-700"
                  }`}
                  onClick={() => toggleSelect(p.id)}
                >
                  <img src={p.imageUrl} className="w-full h-full object-cover" />
                  {selected.includes(p.id) && (
                    <div className="absolute inset-0 bg-indigo-500/40" />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={importSelected}
              className="w-full py-4 bg-green-600 rounded-lg text-xl mt-6"
            >
              {importing
                ? `Importing ${progress.current}/${progress.total}...`
                : "Import Selected"}
            </button>
          </>
        )}

        <button
          onClick={onClose}
          className="mt-4 text-gray-400 hover:text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}
