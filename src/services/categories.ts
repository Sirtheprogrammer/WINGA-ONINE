import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/client';
import { Category } from '../types';

export async function fetchCategoriesFromFirestore(): Promise<Category[]> {
  const snapshot = await getDocs(collection(db, 'categories'));
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Category, 'id'>) }));
}

export async function createCategory(category: Omit<Category, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'categories'), category);
  return ref.id;
}

export async function updateCategory(categoryId: string, updates: Partial<Omit<Category, 'id'>>): Promise<void> {
  const ref = doc(db, 'categories', categoryId);
  await updateDoc(ref, updates as Record<string, unknown>);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const ref = doc(db, 'categories', categoryId);
  await deleteDoc(ref);
}

