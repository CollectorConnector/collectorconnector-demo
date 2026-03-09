"use client";

import { useState } from "react";

interface AddItemPageProps {
  params: {
    collectionId: string;
  };
}

const AddItemPage = ({ params }: AddItemPageProps) => {
  const { collectionId } = params;

  // -----------------------------
  // Currency formatting state + logic
  // -----------------------------
  const [rawValue, setRawValue] = useState("");
  const [formattedValue, setFormattedValue] = useState("");

  const userLocale =
    typeof window !== "undefined" ? navigator.language : "en-GB";

  const currency =
    new Intl.NumberFormat(userLocale, {
      style: "currency",
      currency:
        new Intl.NumberFormat(userLocale).resolvedOptions().currency || "GBP",
    }).resolvedOptions().currency;

  const handleValueChange = (input: string) => {
    const numeric = input.replace(/[^0-9.]/g, "");
    setRawValue(numeric);

    if (!numeric) {
      setFormattedValue("");
      return;
    }

    const number = parseFloat(numeric);
    if (isNaN(number)) return;

    const formatted = new Intl.NumberFormat(userLocale, {
      style: "currency",
      currency,
    }).format(number);

    setFormattedValue(formatted);
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-xl">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">
          Add item
        </h1>

        <form className="space-y-6">
          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full rounded-md border border-neutral-300 p-2 text-sm"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Title
            </label>
            <input
              type="text"
              placeholder="e.g. Charizard VMAX"
              className="w-full rounded-md border border-neutral-300 p-2 text-sm"
            />
          </div>

          {/* Estimated value */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Estimated value
            </label>
            <input
              type="text"
              value={formattedValue}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="£0.00"
              className="w-full rounded-md border border-neutral-300 p-2 text-sm"
            />
          </div>

          {/* Submit */}
          <button
            type="button"
            className="w-full rounded-md bg-black py-2 text-white text-sm font-medium"
          >
            Save item
          </button>
        </form>
      </div>
    </main>
  );
};

export default AddItemPage;
