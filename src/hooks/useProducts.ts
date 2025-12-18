import { useState, useMemo, useEffect } from 'react';
import { Product, FilterOptions } from '../types';
import { fetchProductsFromFirestore } from '../services/products';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/client';
import { productsLogger } from '../services/logger';

export const useProducts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    category: '',
    priceRange: [0, 999999999], // Very high max to include all products
    brand: [],
    rating: 0,
    inStock: false
  });
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | null = null;
    let isFirstSnapshot = true;

    // Set up real-time listener for product updates (primary source of truth)
    try {
      productsLogger.info('USE_PRODUCTS', 'Setting up real-time products listener');
      
      // Use simple collection query - we sort client-side anyway
      const productsCollection = collection(db, 'products');
      
      unsubscribe = onSnapshot(
        productsCollection,
        {
          // Include metadata changes to detect when writes are committed
          includeMetadataChanges: true
        },
        (snapshot) => {
          if (!mounted) {
            productsLogger.debug('USE_PRODUCTS', 'Component unmounted, skipping snapshot update');
            return;
          }
          
          // Log snapshot details
          const isFromCache = snapshot.metadata.fromCache;
          const hasPendingWrites = snapshot.metadata.hasPendingWrites;
          
          productsLogger.info('USE_PRODUCTS', 'Real-time snapshot received', {
            documentCount: snapshot.docs.length,
            hasPendingWrites,
            fromCache: isFromCache,
            isFirstSnapshot
          });
          
          // If this is the first snapshot and it's from cache, we might want to wait for server data
          // But for now, we'll use whatever we get
          if (isFirstSnapshot && isFromCache) {
            productsLogger.debug('USE_PRODUCTS', 'First snapshot is from cache, will update when server data arrives');
          }
          
          const products: Product[] = [];
          const parseErrors: Array<{ docId: string; error: string }> = [];
          
          snapshot.docs.forEach(doc => {
            const data = doc.data();
            try {
              const product: Product = {
                id: doc.id,
                name: data.name || 'Unnamed Product',
                price: Number(data.price) || 0,
                image: data.image || '',
                images: Array.isArray(data.images) ? data.images : [],
                category: data.category || '',
                description: data.description || '',
                rating: Number(data.rating) || 0,
                reviews: Number(data.reviews) || 0,
                inStock: Boolean(data.inStock !== false),
                features: Array.isArray(data.features) ? data.features : [],
                brand: data.brand || '',
                ...(data.originalPrice && { originalPrice: Number(data.originalPrice) }),
                ...(data.discount && typeof data.discount === 'object' && { discount: data.discount })
              };
              
              // More lenient validation - only require name and price
              // Image can be empty initially and added later
              if (product.name && product.name !== 'Unnamed Product' && product.price >= 0) {
                products.push(product);
              } else {
                parseErrors.push({
                  docId: doc.id,
                  error: 'Invalid product data: missing name or invalid price'
                });
                productsLogger.warn('USE_PRODUCTS', 'Product skipped in real-time update', {
                  docId: doc.id,
                  name: product.name,
                  price: product.price,
                  hasImage: !!product.image
                });
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              parseErrors.push({
                docId: doc.id,
                error: errorMessage
              });
              productsLogger.error('USE_PRODUCTS', `Error parsing product ${doc.id} in real-time update`, error as Error, {
                docId: doc.id,
                data: JSON.stringify(data)
              });
            }
          });
          
          // Update state with new products
          if (mounted) {
            setAllProducts(products);
            setLoading(false);
            setError(null);
            
            // Log detailed product information for debugging
            productsLogger.info('USE_PRODUCTS', 'Real-time products update processed', {
              productCount: products.length,
              totalDocuments: snapshot.docs.length,
              parseErrors: parseErrors.length,
              isFirstSnapshot,
              fromCache: isFromCache,
              products: products.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                hasImage: !!p.image,
                category: p.category,
                inStock: p.inStock
              }))
            });
            
            if (parseErrors.length > 0) {
              productsLogger.warn('USE_PRODUCTS', 'Some products failed to parse in real-time update', {
                errors: parseErrors
              });
            }
            
            isFirstSnapshot = false;
          }
        },
        (error) => {
          const errorMessage = error.message || 'Failed to sync products';
          const errorCode = (error as any).code || 'UNKNOWN';
          
          productsLogger.error('USE_PRODUCTS', 'Real-time snapshot error', error, {
            errorCode,
            errorMessage
          });
          
          if (mounted) {
            setError(errorMessage);
            setLoading(false);
            // Don't fallback to load() here as it might cause conflicts
            // The listener will retry automatically
            productsLogger.info('USE_PRODUCTS', 'Snapshot error occurred, listener will retry automatically');
          }
        }
      );
      
      productsLogger.info('USE_PRODUCTS', 'Real-time products listener set up successfully');
    } catch (e) {
      productsLogger.error('USE_PRODUCTS', 'Failed to set up products listener', e as Error);
      
      // Fallback: try initial load if listener setup fails
      if (mounted) {
        setLoading(true);
        setError(null);
        productsLogger.info('USE_PRODUCTS', 'Falling back to initial load due to listener setup error');
        
        fetchProductsFromFirestore()
          .then(remote => {
            if (mounted) {
              setAllProducts(remote);
              setLoading(false);
              productsLogger.info('USE_PRODUCTS', 'Fallback initial load completed', {
                productCount: remote.length
              });
            }
          })
          .catch(err => {
            if (mounted) {
              const errorMessage = err.message || 'Failed to load products';
              productsLogger.error('USE_PRODUCTS', 'Fallback initial load failed', err, {
                errorMessage
              });
              setError(errorMessage);
              setAllProducts([]);
              setLoading(false);
            }
          });
      }
    }

    return () => {
      productsLogger.debug('USE_PRODUCTS', 'Cleaning up products hook');
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
        productsLogger.debug('USE_PRODUCTS', 'Real-time listener unsubscribed');
      }
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = allProducts.filter(product => {
      // Search query - improved matching
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        const queryWords = query.split(/\s+/).filter(w => w.length > 0);
        
        // Multi-field search with word matching
        const name = (product.name || '').toLowerCase();
        const brand = (product.brand || '').toLowerCase();
        const description = (product.description || '').toLowerCase();
        const category = (product.category || '').toLowerCase();
        
        // Check if all query words match in any field
        let matches = false;
        
        // Exact phrase match (highest priority)
        if (name.includes(query) || brand.includes(query) || description.includes(query)) {
          matches = true;
        }
        // Word-by-word matching
        else if (queryWords.length > 0) {
          const allWordsMatch = queryWords.every(word => 
            name.includes(word) || 
            brand.includes(word) || 
            description.includes(word) ||
            category.includes(word)
          );
          matches = allWordsMatch;
        }
        
        if (!matches) {
          return false;
        }
      }

      // Category filter
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      // Price range filter - allow price 0 and handle edge cases
      const price = Number(product.price);
      // Handle NaN, null, undefined as 0
      const validPrice = isNaN(price) ? 0 : price;
      if (validPrice < filters.priceRange[0] || validPrice > filters.priceRange[1]) {
        productsLogger.debug('USE_PRODUCTS', 'Product filtered out by price range', {
          productId: product.id,
          productPrice: validPrice,
          priceRange: filters.priceRange
        });
        return false;
      }

      // Brand filter
      if (filters.brand.length > 0 && product.brand && !filters.brand.includes(product.brand)) {
        return false;
      }

      // Rating filter
      const rating = Number(product.rating) || 0;
      if (filters.rating > 0 && rating < filters.rating) {
        return false;
      }

      // In stock filter
      if (filters.inStock && !product.inStock) {
        return false;
      }

      return true;
    });
    
    // Log filtering results for debugging
    if (allProducts.length > 0) {
      productsLogger.debug('USE_PRODUCTS', 'Products filtering', {
        totalProducts: allProducts.length,
        filteredCount: filtered.length,
        searchQuery: searchQuery || '(none)',
        categoryFilter: filters.category || '(none)',
        priceRange: filters.priceRange,
        inStockFilter: filters.inStock
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'price':
          comparison = (Number(a.price) || 0) - (Number(b.price) || 0);
          break;
        case 'rating':
          comparison = (Number(a.rating) || 0) - (Number(b.rating) || 0);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Log final filtered results
    if (allProducts.length > 0) {
      productsLogger.info('USE_PRODUCTS', 'Filtered products result', {
        allProductsCount: allProducts.length,
        filteredCount: filtered.length,
        filteredProductIds: filtered.map(p => p.id),
        allProductIds: allProducts.map(p => p.id)
      });
    }
    
    return filtered;
  }, [allProducts, searchQuery, filters, sortBy, sortOrder]);

  // Log whenever products change
  useEffect(() => {
    if (allProducts.length > 0) {
      productsLogger.info('USE_PRODUCTS', 'Products state updated', {
        allProductsCount: allProducts.length,
        filteredProductsCount: filteredProducts.length,
        loading,
        hasError: !!error
      });
    }
  }, [allProducts, filteredProducts, loading, error]);

  return {
    products: filteredProducts,
    allProducts, // Return all products for category counts
    loading,
    error,
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
