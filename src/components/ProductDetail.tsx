import React, { useState } from 'react';
import { X, Star, ShoppingCart, Heart, Minus, Plus } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { DiscountBadge } from './DiscountBadge';
import { CountdownTimer } from './CountdownTimer';
import { productsLogger } from '../services/logger';
import { SEO } from './SEO';

interface ProductDetailProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, isOpen, onClose }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const hasActiveDiscount = product?.discount?.isActive && new Date(product.discount.endDate) > new Date();

  if (!isOpen || !product) return null;

  const inWishlist = isInWishlist(product.id);

  // SEO for product page
  const productUrl = typeof window !== 'undefined' ? window.location.href : `https://beipoa.online/product/${product.id}`;
  const productImage = product.images[0] || product.image || '/og-image.jpg';
  const productDescription = product.description || `${product.name} - Best price in Tanzania. ${product.brand ? `Brand: ${product.brand}. ` : ''}${product.inStock ? 'In stock now!' : 'Check availability.'}`;
  const productKeywords = `${product.name}, ${product.brand || ''}, cheap ${product.name} Tanzania, affordable ${product.name}, ${product.category}, best price Tanzania`.trim();

  const handleAddToCart = () => {
    if (product.inStock) {
      addToCart(product, quantity);
      onClose();
    }
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <>
      <SEO
        title={`${product.name} - Best Price TZS ${product.price.toLocaleString()} | Beipoa Online`}
        description={productDescription}
        keywords={productKeywords}
        image={productImage}
        url={productUrl}
        product={product}
        type="product"
      />
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
        <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Product Details</h2>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={product.images[selectedImageIndex] || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const imageUrl = product.images[selectedImageIndex] || product.image;
                    productsLogger.error('RENDER_PRODUCT', 'Failed to load product detail image', new Error('Image load error'), {
                      productId: product.id,
                      productName: product.name,
                      imageUrl,
                      imageIndex: selectedImageIndex
                    });
                    // Fallback to main product image
                    if (product.images[selectedImageIndex] && product.image) {
                      (e.target as HTMLImageElement).src = product.image;
                    }
                  }}
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-colors duration-200 ${
                        selectedImageIndex === index
                          ? 'border-blue-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          productsLogger.error('RENDER_PRODUCT', 'Failed to load product thumbnail image', new Error('Image load error'), {
                            productId: product.id,
                            productName: product.name,
                            imageUrl: image,
                            imageIndex: index
                          });
                          // Hide broken thumbnail
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">{product.brand}</div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm sm:text-base text-gray-600">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                    TZS {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="text-lg sm:text-xl text-gray-500 line-through">
                        TZS {product.originalPrice.toLocaleString()}
                      </span>
                      {hasActiveDiscount && product.discount && (
                        <DiscountBadge 
                          percentage={product.discount.percentage}
                          size="lg"
                          variant="flash"
                        />
                      )}
                    </>
                  )}
                </div>

                {/* Discount Timer */}
                {hasActiveDiscount && product.discount && (
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-red-800">🔥 Limited Time Offer!</h3>
                      <DiscountBadge 
                        percentage={product.discount.percentage}
                        size="md"
                        variant="flash"
                      />
                    </div>
                    <p className="text-red-700 text-xs sm:text-sm mb-2 sm:mb-3">
                      Save TZS {(product.originalPrice! - product.price).toLocaleString()} on this amazing product!
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="text-xs sm:text-sm text-red-700 font-semibold">Offer ends in:</span>
                      <CountdownTimer 
                        endDate={product.discount.endDate}
                        className="text-red-700"
                      />
                    </div>
                  </div>
                )}

                {/* Stock Status */}
                <div className="mb-4 sm:mb-6">
                  {product.inStock ? (
                    <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800">
                      ✓ In Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-800">
                      ✗ Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Key Features</h3>
                <ul className="space-y-1.5 sm:space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm sm:text-base text-gray-600">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-2 sm:mr-3 mt-1.5 sm:mt-2 flex-shrink-0"></span>
                      <span className="flex-1">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quantity and Actions */}
              <div className="border-t pt-4 sm:pt-6">
                {product.inStock && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4">
                    <span className="text-sm sm:text-base text-gray-700 font-medium">Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg w-full sm:w-auto">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 font-medium text-sm sm:text-base min-w-[3rem] text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition-colors duration-200 flex items-center justify-center space-x-2 ${
                      product.inStock
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                  </button>

                  <button
                    onClick={handleWishlistToggle}
                    className={`p-2.5 sm:p-3 rounded-lg border-2 transition-colors duration-200 flex items-center justify-center ${
                      inWishlist
                        ? 'border-red-500 bg-red-50 text-red-600'
                        : 'border-gray-300 hover:border-red-300 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${inWishlist ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};