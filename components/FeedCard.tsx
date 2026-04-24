import React from 'react';

interface FeedCardProps {
  imageUrl: string;
  title: string;
  price: string | number;
  sellerName: string;
  createdAt: string;
}

export function FeedCard({ imageUrl, title, price, sellerName, createdAt }: FeedCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <img src={imageUrl} alt={title} className="w-full rounded-xl mb-3 object-cover aspect-video" />
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-gray-600">{price}</p>
      <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
        <span>{sellerName}</span>
        <span>{createdAt}</span>
      </div>
    </div>
  );
}
