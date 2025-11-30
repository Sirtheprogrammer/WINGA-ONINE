import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/client';
import { CartItem } from '../types';

export async function syncCartToFirebase(userId: string, items: CartItem[]): Promise<void> {
  try {
    await setDoc(doc(db, 'carts', userId), {
      items: items.map(item => ({
        productId: item.product.id,
        product: item.product,
        quantity: item.quantity
      })),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error syncing cart to Firebase:', error);
    throw error;
  }
}

export async function fetchCartFromFirebase(userId: string): Promise<CartItem[]> {
  try {
    const cartDoc = await getDoc(doc(db, 'carts', userId));
    if (cartDoc.exists()) {
      const data = cartDoc.data();
      return (data.items || []).map((item: any) => ({
        product: item.product,
        quantity: item.quantity
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching cart from Firebase:', error);
    return [];
  }
}

export async function clearCartFromFirebase(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'carts', userId));
  } catch (error) {
    console.error('Error clearing cart from Firebase:', error);
    throw error;
  }
}

