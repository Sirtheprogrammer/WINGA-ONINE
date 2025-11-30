/**
 * Seed script to populate Firebase Firestore with initial data
 * 
 * Usage:
 * 1. Set up Firebase Admin SDK credentials
 * 2. Run: node scripts/seed-firebase.js
 * 
 * Or use the Firebase Console to manually add data
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin (requires service account key)
// For local development, you can use Application Default Credentials
// or set GOOGLE_APPLICATION_CREDENTIALS environment variable
try {
  if (getApps().length === 0) {
    // Option 1: Use service account key file
    // const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
    // initializeApp({ credential: cert(serviceAccount) });
    
    // Option 2: Use Application Default Credentials (recommended for local dev)
    initializeApp();
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  console.log('\nTo use this script, you need to:');
  console.log('1. Set up Firebase Admin SDK');
  console.log('2. Either provide serviceAccountKey.json or set GOOGLE_APPLICATION_CREDENTIALS');
  console.log('3. Or manually add data through Firebase Console or Admin Panel\n');
  process.exit(1);
}

const db = getFirestore();

// Import seed data
const { products, categories } = await import('../server/data.js');

async function seedData() {
  console.log('Starting Firebase seed...\n');

  try {
    // Seed Categories
    console.log('Seeding categories...');
    const categoriesRef = db.collection('categories');
    const categoriesSnapshot = await categoriesRef.get();
    
    if (categoriesSnapshot.empty) {
      const batch = db.batch();
      categories.forEach(category => {
        const docRef = categoriesRef.doc(category.id);
        batch.set(docRef, {
          name: category.name,
          icon: category.icon,
          count: category.count
        });
      });
      await batch.commit();
      console.log(`✓ Added ${categories.length} categories`);
    } else {
      console.log('Categories already exist, skipping...');
    }

    // Seed Products
    console.log('Seeding products...');
    const productsRef = db.collection('products');
    const productsSnapshot = await productsRef.get();
    
    if (productsSnapshot.empty) {
      const batch = db.batch();
      products.forEach(product => {
        const docRef = productsRef.doc(product.id);
        const productData = {
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice || null,
          discount: product.discount ? {
            percentage: product.discount.percentage,
            endDate: product.discount.endDate,
            isActive: product.discount.isActive
          } : null,
          image: product.image,
          images: product.images || [],
          category: product.category,
          description: product.description,
          rating: product.rating,
          reviews: product.reviews,
          inStock: product.inStock,
          features: product.features || [],
          brand: product.brand
        };
        batch.set(docRef, productData);
      });
      await batch.commit();
      console.log(`✓ Added ${products.length} products`);
    } else {
      console.log('Products already exist, skipping...');
    }

    console.log('\n✓ Seed completed successfully!');
    console.log('You can now view the data in Firebase Console or use the app.');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData().then(() => process.exit(0));

