import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/client';
import { Product } from '../types';
import { productsLogger } from './logger';

export async function fetchProductsFromFirestore(): Promise<Product[]> {
  productsLogger.info('FETCH_PRODUCTS', 'Fetching products from Firestore');
  
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    const totalDocs = snapshot.docs.length;
    productsLogger.info('FETCH_PRODUCTS', 'Products snapshot received', {
      totalDocuments: totalDocs
    });
    
    const products: Product[] = [];
    const parseErrors: Array<{ docId: string; error: string }> = [];
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      try {
        // Ensure all required fields are present with defaults
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
          inStock: Boolean(data.inStock !== false), // Default to true
          features: Array.isArray(data.features) ? data.features : [],
          brand: data.brand || '',
          ...(data.originalPrice && { originalPrice: Number(data.originalPrice) }),
          ...(data.discount && typeof data.discount === 'object' && { discount: data.discount })
        };
        
        // Only add products with valid data
        if (product.name && product.price > 0 && product.image) {
          products.push(product);
        } else {
          parseErrors.push({
            docId: doc.id,
            error: `Invalid product data: missing name, price, or image`
          });
          productsLogger.warn('FETCH_PRODUCTS', 'Product skipped due to invalid data', {
            docId: doc.id,
            hasName: !!product.name,
            hasPrice: product.price > 0,
            hasImage: !!product.image
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        parseErrors.push({
          docId: doc.id,
          error: errorMessage
        });
        productsLogger.error('FETCH_PRODUCTS', `Error parsing product ${doc.id}`, error as Error, {
          docId: doc.id
        });
      }
    });
    
    productsLogger.info('FETCH_PRODUCTS', 'Products fetched and parsed successfully', {
      totalProducts: products.length,
      totalDocuments: totalDocs,
      parseErrors: parseErrors.length,
      skippedProducts: parseErrors.length
    });
    
    if (parseErrors.length > 0) {
      productsLogger.warn('FETCH_PRODUCTS', 'Some products failed to parse', {
        errors: parseErrors
      });
    }
    
    return products;
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to fetch products. Please check your connection and try again.';
    const errorCode = error.code || 'UNKNOWN';
    
    productsLogger.error('FETCH_PRODUCTS', 'Failed to fetch products from Firestore', error, {
      errorCode,
      errorMessage
    });
    
    throw new Error(errorMessage);
  }
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<string> {
  productsLogger.info('CREATE_PRODUCT', 'Creating new product', {
    name: product.name,
    category: product.category,
    price: product.price
  });
  
  try {
    // Ensure all required fields are present
    const productData = {
      name: product.name,
      price: Number(product.price),
      image: product.image,
      images: Array.isArray(product.images) ? product.images : [],
      category: product.category,
      description: product.description || '',
      rating: Number(product.rating) || 0,
      reviews: Number(product.reviews) || 0,
      inStock: Boolean(product.inStock),
      features: Array.isArray(product.features) ? product.features : [],
      brand: product.brand || '',
      ...(product.originalPrice && { originalPrice: Number(product.originalPrice) }),
      ...(product.discount && typeof product.discount === 'object' && { discount: product.discount })
    };
    
    const ref = await addDoc(collection(db, 'products'), productData);
    
    productsLogger.info('CREATE_PRODUCT', 'Product created successfully', {
      productId: ref.id,
      name: product.name,
      price: product.price,
      category: product.category,
      hasImage: !!product.image,
      inStock: product.inStock
    });
    
    // Log the created data structure for debugging
    productsLogger.debug('CREATE_PRODUCT', 'Product data structure', {
      productId: ref.id,
      data: productData
    });
    
    return ref.id;
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to create product. Please check your permissions and try again.';
    const errorCode = error.code || 'UNKNOWN';
    
    productsLogger.error('CREATE_PRODUCT', 'Failed to create product', error, {
      errorCode,
      errorMessage,
      productName: product.name
    });
    
    throw new Error(errorMessage);
  }
}

export async function updateProduct(productId: string, updates: Partial<Omit<Product, 'id'>>): Promise<void> {
  productsLogger.info('UPDATE_PRODUCT', 'Updating product', {
    productId,
    updateFields: Object.keys(updates)
  });
  
  try {
    const ref = doc(db, 'products', productId);
    
    // Clean and validate update data
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.price !== undefined) updateData.price = Number(updates.price);
    if (updates.image !== undefined) updateData.image = updates.image;
    if (updates.images !== undefined) updateData.images = Array.isArray(updates.images) ? updates.images : [];
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.rating !== undefined) updateData.rating = Number(updates.rating);
    if (updates.reviews !== undefined) updateData.reviews = Number(updates.reviews);
    if (updates.inStock !== undefined) updateData.inStock = Boolean(updates.inStock);
    if (updates.features !== undefined) updateData.features = Array.isArray(updates.features) ? updates.features : [];
    if (updates.brand !== undefined) updateData.brand = updates.brand;
    if (updates.originalPrice !== undefined) updateData.originalPrice = updates.originalPrice ? Number(updates.originalPrice) : null;
    if (updates.discount !== undefined) updateData.discount = updates.discount;
    
    await updateDoc(ref, updateData);
    
    productsLogger.info('UPDATE_PRODUCT', 'Product updated successfully', {
      productId,
      updatedFields: Object.keys(updateData),
      updateData: updateData
    });
    
    // Log the updated data structure for debugging
    productsLogger.debug('UPDATE_PRODUCT', 'Product update data structure', {
      productId,
      data: updateData
    });
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to update product. Please check your permissions and try again.';
    const errorCode = error.code || 'UNKNOWN';
    
    productsLogger.error('UPDATE_PRODUCT', 'Failed to update product', error, {
      productId,
      errorCode,
      errorMessage,
      updateFields: Object.keys(updates)
    });
    
    throw new Error(errorMessage);
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  productsLogger.info('DELETE_PRODUCT', 'Deleting product', { productId });
  
  try {
    const ref = doc(db, 'products', productId);
    await deleteDoc(ref);
    
    productsLogger.info('DELETE_PRODUCT', 'Product deleted successfully', { productId });
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to delete product. Please check your permissions and try again.';
    const errorCode = error.code || 'UNKNOWN';
    
    productsLogger.error('DELETE_PRODUCT', 'Failed to delete product', error, {
      productId,
      errorCode,
      errorMessage
    });
    
    throw new Error(errorMessage);
  }
}


