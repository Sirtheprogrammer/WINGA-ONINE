import React, { useMemo } from 'react';
import { FilterOptions, Product } from '../types';
import * as Icons from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

interface SidebarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  isOpen: boolean;
  onClose: () => void;
  products?: Product[]; // Products to calculate counts from
}

export const Sidebar: React.FC<SidebarProps> = ({ filters, onFilterChange, isOpen, onClose, products = [] }) => {
  const { categories, loading } = useCategories();
  
  // Calculate category counts based on actual products
  const categoriesWithCounts = useMemo(() => {
    if (!products || products.length === 0) {
      return categories.map(cat => ({ ...cat, count: 0 }));
    }
    
    return categories.map(category => {
      const count = products.filter(product => product.category === category.id).length;
      return { ...category, count };
    });
  }, [categories, products]);
  
  // Calculate total products count
  const totalProductsCount = useMemo(() => {
    return products?.length || 0;
  }, [products]);
  
  const handleCategoryChange = (category: string) => {
    onFilterChange({ ...filters, category });
  };

  const sidebarContent = (
    <div className="space-y-4 sm:space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Categories</h3>
        <div className="space-y-1.5 sm:space-y-2">
          <button
            onClick={() => handleCategoryChange('')}
            className={`w-full text-left px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors duration-200 text-sm sm:text-base flex items-center justify-between ${
              filters.category === ''
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <span>All Products</span>
            <span className="text-xs sm:text-sm flex-shrink-0">({totalProductsCount})</span>
          </button>
          {loading ? (
            <div className="text-xs sm:text-sm text-gray-500 py-2">Loading categories...</div>
          ) : categoriesWithCounts.length === 0 ? (
            <div className="text-xs sm:text-sm text-gray-500 py-2">No categories available</div>
          ) : (
            categoriesWithCounts.map((category) => {
            const IconComponent = (Icons as any)[category.icon] || Icons.Package;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`w-full text-left px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 sm:space-x-3 text-sm sm:text-base ${
                  filters.category === category.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="flex-1 truncate">{category.name}</span>
                <span className="text-xs sm:text-sm flex-shrink-0">({category.count})</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 sm:w-80 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-3 sm:p-4 border-b lg:hidden">
          <h2 className="text-base sm:text-lg font-semibold">Filters</h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg"
          >
            <Icons.X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
        
        <div className="p-3 sm:p-4 overflow-y-auto h-full">
          {sidebarContent}
        </div>
      </div>
    </>
  );
};