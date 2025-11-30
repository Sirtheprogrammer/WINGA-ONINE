import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/client';
import { Product } from '../types';

export async function syncWishlistToFirebase(userId: string, products: Product[]): Promise<void> {
  try {
    await setDoc(doc(db, 'wishlists', userId), {
      productIds: products.map(p => p.id),
      products,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error syncing wishlist to Firebase:', error);
    throw error;
  }
}

export async function fetchWishlistFromFirebase(userId: string): Promise<Product[]> {
  try {
    const wishlistDoc = await getDoc(doc(db, 'wishlists', userId));
    if (wishlistDoc.exists()) {
      const data = wishlistDoc.data();
      return data.products || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching wishlist from Firebase:', error);
    return [];
  }
}

export async function clearWishlistFromFirebase(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'wishlists', userId));
  } catch (error) {
    console.error('Error clearing wishlist from Firebase:', error);
    throw error;
  }
}

