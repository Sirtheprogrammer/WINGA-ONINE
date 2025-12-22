import React, { useState } from 'react';
import { ShoppingCart, User, Heart, Menu, X, Package, LogOut } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { SearchAutocomplete } from './SearchAutocomplete';
import { ThemeToggle } from './ThemeToggle';
import { navigateToHome, navigateToOrders } from '../utils/navigation';
import { Product } from '../types';

interface HeaderProps {
  onSearchChange: (query: string) => void;
  onCartClick: () => void;
  onAuthClick: () => void;
  onWishlistClick: () => void;
  products?: Product[]; // Products for autocomplete
  onProductClick?: (product: Product) => void; // Handler for product selection
}

export const Header: React.FC<HeaderProps> = ({
  onSearchChange,
  onCartClick,
  onAuthClick,
  onWishlistClick,
  products = [],
  onProductClick
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const handleSearchChange = (query: string) => {
    onSearchChange(query);
  };

  const handleProductSelect = (product: Product) => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const handleAuthAction = () => {
    if (user) {
      handleLogout();
    } else {
      onAuthClick();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully', 'success');
      setIsMobileMenuOpen(false);
      // Redirect to home page
      navigateToHome();
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Failed to logout', 'error');
    }
  };

  const handleMyOrders = () => {
    navigateToOrders();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">BEIPOA online</div>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4 lg:mx-8">
            <SearchAutocomplete
              products={products}
              onSearchChange={handleSearchChange}
              onProductSelect={handleProductSelect}
              placeholder="Search products..."
              className="w-full"
            />
          </div>

          {/* Mobile Icons - Visible on mobile */}
          <div className="md:hidden flex items-center space-x-1 sm:space-x-2">
            <ThemeToggle className="mr-1" />

            <button
              onClick={onWishlistClick}
              className="relative p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              title="Wishlist"
            >
              <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-semibold text-[10px] sm:text-xs">
                  {wishlistItems.length}
                </span>
              )}
            </button>

            <button
              onClick={onCartClick}
              className="relative p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              title="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-semibold text-[10px] sm:text-xs">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Navigation Icons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {user && (
              <button
                onClick={handleMyOrders}
                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                title="My Orders"
              >
                <Package className="h-6 w-6" />
              </button>
            )}

            <button
              onClick={onWishlistClick}
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              title="Wishlist"
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
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              title="Shopping Cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="flex items-center space-x-1 sm:space-x-2 px-1 sm:px-2">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
                  ) : (
                    <User className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                  )}
                  <span className="text-xs sm:text-sm font-medium text-gray-700 hidden lg:inline truncate max-w-[100px]">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Logout"
                >
                  <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleAuthAction}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}
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
        <div className="md:hidden pb-2 sm:pb-3">
          <SearchAutocomplete
            products={products}
            onSearchChange={handleSearchChange}
            onProductSelect={handleProductSelect}
            placeholder="Search products..."
            className="w-full"
          />
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user && (
              <>
                <button
                  onClick={handleMyOrders}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                >
                  <Package className="h-5 w-5 mr-3" />
                  My Orders
                </button>
                <div className="border-t my-1"></div>
              </>
            )}

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

            {user ? (
              <>
                <div className="border-t my-1"></div>
                <div className="px-3 py-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-6 w-6 rounded-full" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    <span className="font-medium">{user.name}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleAuthAction}
                className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
              >
                <User className="h-5 w-5 mr-3" />
                Login / Sign Up
              </button>
            )}

            <div className="border-t my-1"></div>
            {/* Theme Toggle moved to header */}
          </div>
        </div>
      )}
    </header>
  );
};