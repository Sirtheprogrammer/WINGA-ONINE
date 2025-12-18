import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();

  const handleCheckout = () => {
    if (!user) {
      alert('Please login to proceed with checkout');
      return;
    }
    onClose();
    window.location.href = '/checkout';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b">
            <h2 className="text-base sm:text-lg font-semibold">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">Your cart is empty</h3>
                <p className="text-sm sm:text-base text-gray-500">Add some products to get started</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex space-x-2 sm:space-x-4 bg-gray-50 p-2 sm:p-3 rounded-lg">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-md flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 text-xs sm:text-sm line-clamp-2">{item.product.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">TZS {item.product.price.toLocaleString()}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1.5 sm:space-x-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-200 rounded-md transition-colors duration-200"
                          >
                            <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                          
                          <span className="w-6 sm:w-8 text-center font-medium text-xs sm:text-sm">{item.quantity}</span>
                          
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-200 rounded-md transition-colors duration-200"
                          >
                            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors duration-200 flex-shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
            <div className="border-t p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center text-base sm:text-lg font-semibold">
                <span>Total:</span>
                <span>TZS {totalPrice.toLocaleString()}</span>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-semibold text-sm sm:text-base hover:bg-blue-700 transition-colors duration-200"
                >
                  Checkout
                </button>
                
                <button
                  onClick={clearCart}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium text-sm sm:text-base hover:bg-gray-300 transition-colors duration-200"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};