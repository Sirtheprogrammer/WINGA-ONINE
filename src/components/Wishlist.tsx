import React from 'react';
import { X, ShoppingCart, Trash2, Heart } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';

interface WishlistProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Wishlist: React.FC<WishlistProps> = ({ isOpen, onClose }) => {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!isOpen) return null;

  const handleAddToCart = (product: any) => {
    if (product.inStock) {
      addToCart(product);
      removeFromWishlist(product.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Wishlist</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Wishlist Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Heart className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-500">Save products you love for later</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((product) => (
                  <div key={product.id} className="flex space-x-4 bg-gray-50 p-3 rounded-lg">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-sm">{product.name}</h4>
                      <p className="text-sm text-gray-500">${product.price}</p>
                      <p className="text-xs text-gray-400 mt-1">{product.brand}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.inStock}
                          className={`text-xs px-3 py-1 rounded-md font-medium transition-colors duration-200 ${
                            product.inStock
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {product.inStock ? (
                            <>
                              <ShoppingCart className="h-3 w-3 inline mr-1" />
                              Add to Cart
                            </>
                          ) : (
                            'Out of Stock'
                          )}
                        </button>
                        
                        <button
                          onClick={() => removeFromWishlist(product.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-4">
              <button
                onClick={clearWishlist}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
              >
                Clear Wishlist
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};