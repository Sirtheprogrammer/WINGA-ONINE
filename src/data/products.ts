import { Product, Category } from '../types';

export const categories: Category[] = [
  { id: 'electronics', name: 'Electronics', icon: 'Smartphone', count: 156 },
  { id: 'clothing', name: 'Fashion', icon: 'Shirt', count: 234 },
  { id: 'home', name: 'Home & Garden', icon: 'Home', count: 89 },
  { id: 'books', name: 'Books', icon: 'Book', count: 145 },
  { id: 'sports', name: 'Sports', icon: 'Dumbbell', count: 67 },
  { id: 'beauty', name: 'Beauty', icon: 'Sparkles', count: 123 },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 299,
    originalPrice: 399,
    discount: {
      percentage: 25,
      endDate: '2025-02-15T23:59:59Z',
      isActive: true
    },
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
    images: [
      'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
      'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg'
    ],
    category: 'electronics',
    description: 'Experience crystal-clear audio with our premium wireless headphones featuring active noise cancellation and 30-hour battery life.',
    rating: 4.8,
    reviews: 1247,
    inStock: true,
    features: ['Active Noise Cancellation', '30hr Battery', 'Wireless Charging', 'Hi-Res Audio'],
    brand: 'AudioTech'
  },
  {
    id: '7',
    name: 'Smartphone Pro 5G',
    price: 1200000,
    originalPrice: 1450000,
    discount: {
      percentage: 17,
      endDate: '2025-12-31T23:59:59Z',
      isActive: true
    },
    image: 'https://images.pexels.com/photos/6078129/pexels-photo-6078129.jpeg',
    images: [
      'https://images.pexels.com/photos/6078129/pexels-photo-6078129.jpeg',
      'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg',
      'https://images.pexels.com/photos/265658/pexels-photo-265658.jpeg',
      'https://images.pexels.com/photos/132700/pexels-photo-132700.jpeg',
      'https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg',
      'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg'
    ],
    category: 'electronics',
    description: '6.7" AMOLED, 5G, 256GB storage, 5000mAh battery – fast and reliable.',
    rating: 4.7,
    reviews: 1024,
    inStock: true,
    features: ['5G', 'AMOLED', '5000mAh', '256GB', '48MP'],
    brand: 'TechPro'
  },
  {
    id: '8',
    name: 'UltraBook 14" Laptop',
    price: 2500000,
    originalPrice: 2890000,
    discount: {
      percentage: 13,
      endDate: '2025-11-30T23:59:59Z',
      isActive: true
    },
    image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg',
    images: [
      'https://images.pexels.com/photos/18105/pexels-photo.jpg',
      'https://images.pexels.com/photos/374074/pexels-photo-374074.jpeg',
      'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg',
      'https://images.pexels.com/photos/18104/pexels-photo.jpg',
      'https://images.pexels.com/photos/196646/pexels-photo-196646.jpeg',
      'https://images.pexels.com/photos/114907/pexels-photo-114907.jpeg'
    ],
    category: 'electronics',
    description: 'Lightweight 14" laptop with 16GB RAM, 512GB SSD and 10+ hr battery.',
    rating: 4.6,
    reviews: 512,
    inStock: true,
    features: ['14" Display', '16GB RAM', '512GB SSD', 'Backlit Keyboard'],
    brand: 'ComputeX'
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    price: 249,
    image: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg',
    images: [
      'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg',
      'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg'
    ],
    category: 'electronics',
    description: 'Track your fitness goals with this advanced smartwatch featuring heart rate monitoring, GPS, and 7-day battery life.',
    rating: 4.6,
    reviews: 892,
    inStock: true,
    features: ['Heart Rate Monitor', 'GPS Tracking', '7-Day Battery', 'Waterproof'],
    brand: 'FitTech'
  },
  {
    id: '3',
    name: 'Designer Leather Jacket',
    price: 189,
    originalPrice: 289,
    discount: {
      percentage: 35,
      endDate: '2025-02-20T23:59:59Z',
      isActive: true
    },
    image: 'https://images.pexels.com/photos/1040427/pexels-photo-1040427.jpeg',
    images: [
      'https://images.pexels.com/photos/1040427/pexels-photo-1040427.jpeg'
    ],
    category: 'clothing',
    description: 'Premium genuine leather jacket with modern cut and superior craftsmanship. Perfect for any season.',
    rating: 4.7,
    reviews: 456,
    inStock: true,
    features: ['Genuine Leather', 'Modern Cut', 'Premium Quality', 'Versatile Style'],
    brand: 'StyleCraft'
  },
  {
    id: '4',
    name: 'Modern Coffee Table',
    price: 349,
    image: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
    images: [
      'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'
    ],
    category: 'home',
    description: 'Elegant modern coffee table crafted from sustainable oak wood with minimalist design.',
    rating: 4.9,
    reviews: 234,
    inStock: true,
    features: ['Sustainable Oak', 'Minimalist Design', 'Handcrafted', 'Easy Assembly'],
    brand: 'HomeDesign'
  },
  {
    id: '5',
    name: 'Professional Camera',
    price: 899,
    originalPrice: 1199,
    discount: {
      percentage: 25,
      endDate: '2025-02-10T23:59:59Z',
      isActive: true
    },
    image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg',
    images: [
      'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'
    ],
    category: 'electronics',
    description: 'Professional-grade DSLR camera with 24MP sensor and 4K video recording capabilities.',
    rating: 4.8,
    reviews: 678,
    inStock: false,
    features: ['24MP Sensor', '4K Video', 'Weather Sealed', 'Dual Card Slots'],
    brand: 'PhotoPro'
  },
  {
    id: '6',
    name: 'Organic Skincare Set',
    price: 79,
    image: 'https://images.pexels.com/photos/3685175/pexels-photo-3685175.jpeg',
    images: [
      'https://images.pexels.com/photos/3685175/pexels-photo-3685175.jpeg'
    ],
    category: 'beauty',
    description: 'Complete organic skincare routine with cleanser, toner, serum, and moisturizer.',
    rating: 4.5,
    reviews: 329,
    inStock: true,
    features: ['100% Organic', 'Cruelty Free', 'All Skin Types', 'Dermatologist Tested'],
    brand: 'PureSkin'
  }
];