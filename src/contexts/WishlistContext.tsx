import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { useAuth } from './AuthContext';
import { syncWishlistToFirebase, fetchWishlistFromFirebase, clearWishlistFromFirebase } from '../services/wishlist';

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Product[]>([]);
  const { user } = useAuth();
  const isInitialLoad = useRef(true);
  const isSyncing = useRef(false);

  // Load wishlist on mount or when user changes
  useEffect(() => {
    const loadWishlist = async () => {
      isInitialLoad.current = true;
      
      if (user) {
        // Load from Firebase if user is logged in
        try {
          const firebaseWishlist = await fetchWishlistFromFirebase(user.id);
          setItems(firebaseWishlist);
          isInitialLoad.current = false;
          return;
        } catch (error) {
          console.error('Error loading wishlist from Firebase:', error);
        }
      }
      
      // Fallback to localStorage
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        setItems(JSON.parse(savedWishlist));
      }
      
      isInitialLoad.current = false;
    };
    
    loadWishlist();
  }, [user]);

  // Sync to Firebase when items change and user is logged in (but not on initial load)
  useEffect(() => {
    if (isInitialLoad.current || isSyncing.current) {
      return;
    }

    if (user) {
      isSyncing.current = true;
      syncWishlistToFirebase(user.id, items)
        .catch(error => {
          console.error('Error syncing wishlist to Firebase:', error);
        })
        .finally(() => {
          isSyncing.current = false;
        });
    } else {
      // Save to localStorage if not logged in
      localStorage.setItem('wishlist', JSON.stringify(items));
    }
  }, [items, user]);

  const addToWishlist = (product: Product) => {
    setItems(currentItems => {
      if (currentItems.find(item => item.id === product.id)) {
        return currentItems;
      }
      return [...currentItems, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.id === productId);
  };

  const clearWishlist = async () => {
    setItems([]);
    if (user) {
      try {
        await clearWishlistFromFirebase(user.id);
      } catch (error) {
        console.error('Error clearing wishlist from Firebase:', error);
      }
    }
  };

  return (
    <WishlistContext.Provider value={{
      items,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};