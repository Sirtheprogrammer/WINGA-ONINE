import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ProductGrid } from './components/ProductGrid';
import { ProductGridSkeleton } from './components/ProductSkeleton';
import { Cart } from './components/Cart';
import { AuthModal } from './components/AuthModal';
import { ProductDetail } from './components/ProductDetail';
import { Wishlist } from './components/Wishlist';
import { Footer } from './components/Footer';
import { OfferCarousel } from './components/OfferCarousel';
import { SnowEffect } from './components/SnowEffect';
import { SEO } from './components/SEO';
import { useProducts } from './hooks/useProducts';
import { useCategories } from './hooks/useCategories';
import { useOfferSettings } from './hooks/useOfferSettings';
import { Product } from './types';

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);

  const {
    products,
    allProducts, // All products for category counts
    loading: productsLoading,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
  } = useProducts();

  const { categories } = useCategories();
  const { settings: offerSettings, loading: offerLoading } = useOfferSettings();

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDetailOpen(true);
  };

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-') as [typeof sortBy, typeof sortOrder];
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SEO
        title="BEIPOA online - Best Cheap Prices & Affordable Products Tanzania"
        description="BEIPOA online offers the best cheap prices on electronics, fashion, home goods, and more. Find affordable products with fast delivery across Tanzania. Compare prices and save money today!"
        keywords="cheap prices Tanzania, affordable products Tanzania, online shopping Tanzania, best prices Tanzania, discount products Tanzania, cheap electronics Tanzania, affordable fashion Tanzania, online store Tanzania, shopping Tanzania, deals Tanzania"
        url={typeof window !== 'undefined' ? window.location.href : 'https://beipoa.online/'}
      />
      <Header
        onSearchChange={setSearchQuery}
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => setIsAuthModalOpen(true)}
        onWishlistClick={() => setIsWishlistOpen(true)}
        products={allProducts}
        onProductClick={handleProductClick}
      />

      <div className="flex-1 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 w-full">
        <div className="flex gap-4 lg:gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block flex-shrink-0">
            <div className="w-72 xl:w-80">
              <Sidebar
                filters={filters}
                onFilterChange={setFilters}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                products={allProducts}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Snow Effect - Show when Christmas carousel is active */}
            {!offerLoading && offerSettings && offerSettings.carouselType === 'christmas' && offerSettings.isActive && (
              <SnowEffect />
            )}

            {/* Offer Carousel */}
            {!offerLoading && offerSettings && (
              <OfferCarousel settings={offerSettings} />
            )}

            {/* Mobile Filter Toggle and Sort */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              {/* Mobile Category Select */}
              <div className="lg:hidden relative">
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="appearance-none w-full bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 pr-8 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                  {products.length} product{products.length !== 1 ? 's' : ''}
                </span>

                <div className="relative flex-shrink-0">
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 pr-7 sm:pr-8 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating-desc">Rating: High to Low</option>
                    <option value="rating-asc">Rating: Low to High</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <ProductGridSkeleton count={8} />
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                <div className="text-5xl sm:text-6xl mb-4">📦</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 text-center">No products available</h3>
                <p className="text-sm sm:text-base text-gray-500 text-center max-w-md">
                  There are no products in the catalog yet. Check back soon or contact the administrator.
                </p>
              </div>
            ) : (
              <ProductGrid products={products} onProductClick={handleProductClick} />
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Mobile Sidebar removed to avoid duplicate filters at bottom */}

      {/* Modals */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <Wishlist isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
      <ProductDetail
        product={selectedProduct}
        isOpen={isProductDetailOpen}
        onClose={() => setIsProductDetailOpen(false)}
      />
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;