"use client";

import { useRouter } from "next/navigation";

export default function ProfileInstagramImportButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/import-instagram")}
      className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl"
    >
      Import from Instagram
    </button>
  );
}
