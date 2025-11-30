import React from 'react';
import { FilterOptions } from '../types';
import * as Icons from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

interface SidebarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ filters, onFilterChange, isOpen, onClose }) => {
  const categories = useCategories();
  
  const handleCategoryChange = (category: string) => {
    onFilterChange({ ...filters, category });
  };

  const sidebarContent = (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Categories</h3>
        <div className="space-y-2">
          <button
            onClick={() => handleCategoryChange('')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
              filters.category === ''
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            All Products
          </button>
          {categories.map((category) => {
            const IconComponent = (Icons as any)[category.icon] || Icons.Package;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-3 ${
                  filters.category === category.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <IconComponent className="h-5 w-5" />
                <span className="flex-1">{category.name}</span>
                <span className="text-sm">({category.count})</span>
              </button>
            );
          })}
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
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-4 border-b lg:hidden">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Icons.X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto h-full">
          {sidebarContent}
        </div>
      </div>
    </>
  );
};