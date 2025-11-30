import { useState, useEffect } from 'react';
import { Category } from '../types';
import { categories as localCategories } from '../data/products';
import { fetchCategoriesFromFirestore } from '../services/categories';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>(localCategories);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const remote = await fetchCategoriesFromFirestore();
        if (mounted && remote.length > 0) {
          setCategories(remote);
        }
      } catch (e) {
        // Fallback to local data silently
        console.error('Error loading categories from Firebase:', e);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return categories;
};

