import React, { useState } from 'react';
import { Search, ShoppingCart, User, Heart, Menu, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onSearchChange: (query: string) => void;
  onCartClick: () => void;
  onAuthClick: () => void;
  onWishlistClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onSearchChange, 
  onCartClick, 
  onAuthClick,
  onWishlistClick 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, logout } = useAuth();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearchChange(query);
  };

  const handleAuthAction = () => {
    if (user) {
      logout();
    } else {
      onAuthClick();
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-blue-600">ShopHub</div>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search products..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Navigation Icons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onWishlistClick}
              className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              <Heart className="h-6 w-6" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </button>

            <button
              onClick={onCartClick}
              className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={handleAuthAction}
              className="flex items-center space-x-2 p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
              ) : (
                <User className="h-6 w-6" />
              )}
              {user && <span className="text-sm font-medium">{user.name}</span>}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={() => {
                onWishlistClick();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
            >
              <Heart className="h-5 w-5 mr-3" />
              Wishlist ({wishlistItems.length})
            </button>
            
            <button
              onClick={() => {
                onCartClick();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
            >
              <ShoppingCart className="h-5 w-5 mr-3" />
              Cart ({totalItems})
            </button>
            
            <button
              onClick={handleAuthAction}
              className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
            >
              <User className="h-5 w-5 mr-3" />
              {user ? `Logout (${user.name})` : 'Login / Sign Up'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};