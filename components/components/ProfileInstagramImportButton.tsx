"use client";

import { useState } from "react";
import ImportInstagramModal from "@/components/ImportInstagramModal";

export default function ProfileInstagramImportButton() {
  const [isImportOpen, setIsImportOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsImportOpen(true)}
        className="bg-black text-white px-4 py-2 rounded mt-4 w-full"
      >
        Import from Instagram
      </button>

      <ImportInstagramModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </>
  );
}
