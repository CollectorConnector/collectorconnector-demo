import React from 'react';

export function FeedCard({ imageUrl, title, price, sellerName, createdAt }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <img src={imageUrl} alt={title} className="w-full rounded-xl mb-3 object-cover aspect-video" />
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="font-bold text-emerald-600">£{price}</span>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <span>by {sellerName}</span>
          {/* Example of adding your custom SVG icon for verified sellers */}
          <svg className="w-3 h-3 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </div>
        <span>{new Date(createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
