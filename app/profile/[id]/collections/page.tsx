import CollectionsGrid from "@/components/CollectionsGrid";

export default function ProfileCollectionsPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <h1 className="text-xl font-semibold px-4 py-4">Collections</h1>
      <CollectionsGrid userId={params.id} />
    </div>
  );
}

