import React from 'react';

interface FeedCardProps {
  imageUrl: string;
  title: string;
  price: string | number;
  sellerName: string;
  createdAt: string;
}

export function FeedCard({ imageUrl, title, price, sellerName, createdAt }: FeedCardProps) {
  // Debug check: This will show in your browser console when the component renders
  console.log("FeedCard rendering with:", { title, imageUrl });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      {/* Added a fallback for the image if imageUrl is empty */}
      <img 
        src={imageUrl || '/placeholder.png'} 
        alt={title || 'Product'} 
        className="w-full rounded-xl mb-3 object-cover aspect-video bg-gray-100" 
      />
      <h3 className="font-semibold text-lg text-gray-900">{title || 'Untitled Item'}</h3>
      <p className="text-gray-600 font-medium">{price}</p>
      <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
        <span className="truncate">{sellerName}</span>
        <span>{createdAt}</span>
      </div>
    </div>
  );
}
