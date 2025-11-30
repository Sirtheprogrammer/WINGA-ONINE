import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CartItem, Product } from '../types';
import { useAuth } from './AuthContext';
import { syncCartToFirebase, fetchCartFromFirebase, clearCartFromFirebase } from '../services/cart';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const isInitialLoad = useRef(true);
  const isSyncing = useRef(false);

  // Load cart on mount or when user changes
  useEffect(() => {
    const loadCart = async () => {
      isInitialLoad.current = true;
      
      if (user) {
        // Load from Firebase if user is logged in
        try {
          const firebaseCart = await fetchCartFromFirebase(user.id);
          setItems(firebaseCart);
          isInitialLoad.current = false;
          return;
        } catch (error) {
          console.error('Error loading cart from Firebase:', error);
        }
      }
      
      // Fallback to localStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      
      isInitialLoad.current = false;
    };
    
    loadCart();
  }, [user]);

  // Sync to Firebase when items change and user is logged in (but not on initial load)
  useEffect(() => {
    if (isInitialLoad.current || isSyncing.current) {
      return;
    }

    if (user) {
      isSyncing.current = true;
      syncCartToFirebase(user.id, items)
        .catch(error => {
          console.error('Error syncing cart to Firebase:', error);
        })
        .finally(() => {
          isSyncing.current = false;
        });
    } else {
      // Save to localStorage if not logged in
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, user]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return currentItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...currentItems, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setItems(currentItems =>
      currentItems.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = async () => {
    setItems([]);
    if (user) {
      try {
        await clearCartFromFirebase(user.id);
      } catch (error) {
        console.error('Error clearing cart from Firebase:', error);
      }
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};