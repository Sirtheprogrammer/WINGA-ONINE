import React from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { DiscountBadge } from './DiscountBadge';

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
      className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-300 cursor-pointer group overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {hasActiveDiscount && product.discount && (
          <div className="absolute top-3 left-3">
            <DiscountBadge percentage={product.discount.percentage} size="sm" variant="limited" />
          </div>
        )}
        {!product.inStock && (
          <div className="absolute top-3 right-3 bg-gray-800 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Out of Stock
          </div>
        )}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
            inWishlist 
              ? 'bg-red-500 text-white' 
              : 'bg-white/80 hover:bg-white text-gray-600 hover:text-red-500'
          } ${!product.inStock ? 'right-20' : ''}`}
        >
          <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
              product.inStock
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="h-4 w-4 inline mr-2" />
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="text-sm text-gray-500 mb-1">{product.brand}</div>
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {product.name}
        </h3>
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">
            {product.rating} ({product.reviews})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">
              TZS {product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
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