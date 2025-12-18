import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, TrendingUp, Package } from 'lucide-react';
import { Product } from '../types';
import { searchProducts, getSearchSuggestions } from '../services/search';

interface SearchAutocompleteProps {
  products: Product[];
  onSearchChange: (query: string) => void;
  onProductSelect?: (product: Product) => void;
  placeholder?: string;
  className?: string;
}

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  products,
  onSearchChange,
  onProductSelect,
  placeholder = 'Search products...',
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get search results and suggestions
  const searchResults = useMemo(() => {
    if (!query || query.trim().length < 2) {
      return [];
    }
    return searchProducts(query, products, 5);
  }, [query, products]);

  const suggestions = useMemo(() => {
    if (!query || query.trim().length < 1) {
      return [];
    }
    return getSearchSuggestions(query, products, 5);
  }, [query, products]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearchChange(value);
    setIsOpen(value.length > 0);
    setFocusedIndex(-1);
  };

  // Handle suggestion/product selection
  const handleSelect = (product?: Product, suggestion?: string) => {
    if (product) {
      setQuery(product.name);
      onSearchChange(product.name);
      setIsOpen(false);
      if (onProductSelect) {
        onProductSelect(product);
      }
    } else if (suggestion) {
      setQuery(suggestion);
      onSearchChange(suggestion);
      setIsOpen(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalItems = searchResults.length + suggestions.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
      setIsOpen(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0) {
        if (focusedIndex < searchResults.length) {
          handleSelect(searchResults[focusedIndex].product);
        } else {
          const suggestionIndex = focusedIndex - searchResults.length;
          handleSelect(undefined, suggestions[suggestionIndex]);
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    onSearchChange('');
    setIsOpen(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const hasResults = searchResults.length > 0 || suggestions.length > 0;
  const showDropdown = isOpen && query.length > 0 && hasResults;

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(query.length > 0 && hasResults)}
          placeholder={placeholder}
          className="block w-full pl-9 sm:pl-10 pr-20 sm:pr-24 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-10 sm:right-12 pr-2 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {/* Search Results (Products) */}
          {searchResults.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Top Results
              </div>
              {searchResults.map((result, index) => (
                <button
                  key={result.product.id}
                  onClick={() => handleSelect(result.product)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left ${
                    focusedIndex === index
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {result.product.image ? (
                    <img
                      src={result.product.image}
                      alt={result.product.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base text-gray-900 truncate">
                      {result.product.name}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">
                      {result.product.brand && `${result.product.brand} • `}
                      TZS {result.product.price.toLocaleString()}
                    </div>
                  </div>
                  {result.matchType === 'exact' && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex-shrink-0">
                      Match
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="border-t border-gray-200 p-2">
              <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
                <Search className="h-3 w-3 mr-1" />
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  onClick={() => handleSelect(undefined, suggestion)}
                  onMouseEnter={() => setFocusedIndex(searchResults.length + index)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-left ${
                    focusedIndex === searchResults.length + index
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-gray-700 truncate">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

