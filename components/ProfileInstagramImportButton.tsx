"use client";

import { useState } from "react";
import InstagramImportModal from "./ImportInstagramModal";

export default function ProfileInstagramImportButton() {
  const [isImportOpen, setIsImportOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsImportOpen(true)}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl"
      >
        Import from Instagram
      </button>

      {isImportOpen && (
        <InstagramImportModal
          onClose={() => setIsImportOpen(false)}
        />
      )}
    </>
  );
}
