'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

type Item = {
  id: string;
  name: string;
  description?: string;
  image?: string;
};

type Collection = {
  id: string;
  title: string;
  description?: string;
  items: Item[];
};

export default function CollectionPage() {
  const { collectionId } = useParams();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollection = async () => {
      if (!collectionId) return;

      try {
        const response = await fetch(`/api/collections/${collectionId}`);
        if (response.ok) {
          const data = await response.json();
          setCollection(data);
        } else {
          console.error('Failed to fetch collection');
        }
      } catch (error) {
        console.error('Error fetching collection:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCollection();
  }, [collectionId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Loading...
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Collection not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4">{collection.title}</h1>
          <p className="text-gray-400 text-lg">{collection.description}</p>
        </header>

        {/* ITEMS */}
        <main>
          <h2 className="text-2xl font-semibold mb-8">Items</h2>

          {collection.items && collection.items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {collection.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                  )}

                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{item.name}</h3>

                    {item.description && (
                      <p className="text-gray-400 text-sm mt-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No items in this collection yet.</p>
          )}
        </main>
      </div>
    </div>
  );
}
