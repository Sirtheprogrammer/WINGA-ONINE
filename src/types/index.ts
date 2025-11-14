export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: {
    percentage: number;
    endDate: string;
    isActive: boolean;
  };
  image: string;
  images: string[];
  category: string;
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  features: string[];
  brand: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface FilterOptions {
  category: string;
  priceRange: [number, number];
  brand: string[];
  rating: number;
  inStock: boolean;
}