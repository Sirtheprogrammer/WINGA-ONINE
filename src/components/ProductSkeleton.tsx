import React from 'react';

export const ProductSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border animate-pulse overflow-hidden">
      {/* Image Skeleton */}
      <div className="w-full h-48 bg-gray-200"></div>
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Brand */}
        <div className="h-3 w-16 bg-gray-200 rounded"></div>
        
        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        
        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3 w-3 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-3 w-12 bg-gray-200 rounded"></div>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-24 bg-gray-200 rounded"></div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
};

