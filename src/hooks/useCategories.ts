import { useState, useEffect } from 'react';
import { Category } from '../types';
import { fetchCategoriesFromFirestore } from '../services/categories';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const remote = await fetchCategoriesFromFirestore();
        if (mounted) {
          setCategories(remote);
        }
      } catch (e) {
        console.error('Error loading categories from Firebase:', e);
        if (mounted) {
          setCategories([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return { categories, loading };
};

