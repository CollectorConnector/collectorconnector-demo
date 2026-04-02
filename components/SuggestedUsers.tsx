"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type SuggestedUser = {
  id: string;
  display_url: string | null;
  username: string | null;
};

export default function SuggestedUsers() {
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function loadUsers() {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_url, username")
        .limit(5);

      if (data) setUsers(data);
    }

    loadUsers();
  }, []);

  if (users.length === 0) return null;

  return (
    <div className="mt-10 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
      <h2 className="text-2xl font-bold mb-4">Suggested Collectors</h2>

      <div className="space-y-3">
        {users.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-800 transition"
            onClick={() => router.push(`/profile/${u.id}`)}
          >
            <div>
              <p className="font-semibold">
                {u.display_url || u.username}
              </p>
              <p className="text-zinc-400 text-sm">
                @{u.username || "collector"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
``
