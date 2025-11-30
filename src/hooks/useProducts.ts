import { useState, useMemo, useEffect } from 'react';
import { Product, FilterOptions } from '../types';
import { products as localProducts } from '../data/products';
import { fetchProductsFromFirestore } from '../services/products';

export const useProducts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    category: '',
    priceRange: [0, 9999],
    brand: [],
    rating: 0,
    inStock: false
  });
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [allProducts, setAllProducts] = useState<Product[]>(localProducts as Product[]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const remote = await fetchProductsFromFirestore();
        if (mounted && remote.length > 0) {
          setAllProducts(remote);
        } else if (mounted) {
          // Keep local products if Firebase is empty
          setAllProducts(localProducts as Product[]);
        }
      } catch (e) {
        // Fallback to local data silently
        if (mounted) {
          setAllProducts(localProducts as Product[]);
        }
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = allProducts.filter(product => {
      // Search query
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !product.brand.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !product.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      // Price range filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }

      // Brand filter
      if (filters.brand.length > 0 && !filters.brand.includes(product.brand)) {
        return false;
      }

      // Rating filter
      if (filters.rating > 0 && product.rating < filters.rating) {
        return false;
      }

      // In stock filter
      if (filters.inStock && !product.inStock) {
        return false;
      }

      return true;
    });

    // Sort products
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [searchQuery, filters, sortBy, sortOrder]);

  return {
    products: filteredProducts,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
  };
};