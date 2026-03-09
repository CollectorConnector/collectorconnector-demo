// app/collections/[collectionId]/add-item/page.tsx
import { type FC } from "react";

interface AddItemPageProps {
  params: {
    collectionId: string;
  };
}

const AddItemPage: FC<AddItemPageProps> = ({ params }) => {
  const { collectionId } = params;

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-xl">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight">
          Add item
        </h1>
        <p className="mb-2 text-sm text-neutral-500">
          Collection ID: <span className="font-mono text-neutral-700">{collectionId}</span>
        </p>

        <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
          This is the Add Item page shell. Next, we’ll wire up:
          <ul className="mt-2 list-disc pl-5">
            <li>Image upload</li>
            <li>Auto-suggested title</li>
            <li>Formatted value input</li>
            <li>Save to Supabase</li>
          </ul>
        </div>
      </div>
    </main>
  );
};

export default AddItemPage;
