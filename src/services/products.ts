import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/client';
import { Product } from '../types';

export async function fetchProductsFromFirestore(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, 'products'));
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }));
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'products'), product);
  return ref.id;
}

export async function updateProduct(productId: string, updates: Partial<Omit<Product, 'id'>>): Promise<void> {
  const ref = doc(db, 'products', productId);
  await updateDoc(ref, updates as Record<string, unknown>);
}

export async function deleteProduct(productId: string): Promise<void> {
  const ref = doc(db, 'products', productId);
  await deleteDoc(ref);
}


