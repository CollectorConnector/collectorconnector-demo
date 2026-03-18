// app/profile/[id]/page.tsx
import React from "react";
import { notFound } from "next/navigation";

type Props = { params: { id: string } };

export default async function ProfilePage({ params }: Props) {
  const id = params?.id;
  if (!id) return notFound();

  // Minimal server-rendered page to avoid runtime errors
  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-2 text-sm text-gray-600">User id: <strong>{id}</strong></p>
        <p className="mt-4 text-sm text-gray-700">This is a minimal profile page to confirm the dynamic route works.</p>
      </div>
    </main>
  );
}
