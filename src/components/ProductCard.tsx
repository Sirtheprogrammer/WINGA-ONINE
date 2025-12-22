import React from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { DiscountBadge } from './DiscountBadge';
import { productsLogger } from '../services/logger';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  const hasActiveDiscount = product.discount?.isActive && new Date(product.discount.endDate) > new Date();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.inStock) {
      addToCart(product);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div
      onClick={() => onProductClick(product)}
      className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border dark:border-gray-700 hover:shadow-md transition-all duration-300 cursor-pointer group overflow-hidden h-full flex flex-col"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gray-100">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              productsLogger.error('RENDER_PRODUCT', 'Failed to load product image', new Error('Image load error'), {
                productId: product.id,
                productName: product.name,
                imageUrl: product.image
              });
              // Show placeholder instead of hiding
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="w-full h-40 sm:h-48 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
            <span className="text-gray-400 dark:text-gray-500 text-sm">No Image</span>
          </div>
        )}
        {hasActiveDiscount && product.discount && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
            <DiscountBadge percentage={product.discount.percentage} size="sm" variant="limited" />
          </div>
        )}
        {!product.inStock && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gray-800 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold">
            Out of Stock
          </div>
        )}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full transition-all duration-200 ${inWishlist
            ? 'bg-red-500 text-white'
            : 'bg-white/80 hover:bg-white text-gray-600 hover:text-red-500'
            } ${!product.inStock ? 'right-16 sm:right-20' : ''}`}
        >
          <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>
        <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`w-full py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${product.inStock
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 inline mr-1.5 sm:mr-2" />
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 truncate">{product.brand}</div>
        <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 flex-1">
          {product.name}
        </h3>
        <div className="flex items-center mb-2 flex-wrap gap-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 sm:h-4 sm:w-4 ${i < Math.floor(product.rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
                  }`}
              />
            ))}
          </div>
          <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2">
            {product.rating} ({product.reviews})
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 mt-auto">
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              TZS {product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-xs sm:text-sm text-gray-500 line-through">
                TZS {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          {hasActiveDiscount && product.discount && (
            <span className="text-xs text-green-600 font-semibold">
              Save TZS {(product.originalPrice! - product.price).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};