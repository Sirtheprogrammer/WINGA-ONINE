# Seeding Initial Data

This guide explains how to seed initial products and categories into Firebase.

## Overview

All products and categories are now managed through Firebase Firestore. There are no hardcoded products in the application code.

## Seeding Methods

### Method 1: Using Admin Panel (Recommended)

1. Log in as an admin user
2. Navigate to `/admin`
3. Go to the **Products** tab
4. Click **Add Product**
5. Fill in the product details and submit
6. Repeat for all products you want to add

### Method 2: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. Click on the `products` collection
5. Click **Add document**
6. Fill in the fields:
   - `name` (string)
   - `price` (number)
   - `originalPrice` (number, optional)
   - `discount` (map, optional):
     - `percentage` (number)
     - `endDate` (string, ISO date)
     - `isActive` (boolean)
   - `image` (string, URL)
   - `images` (array of strings)
   - `category` (string)
   - `description` (string)
   - `rating` (number)
   - `reviews` (number)
   - `inStock` (boolean)
   - `features` (array of strings)
   - `brand` (string)

### Method 3: Using Seed Script (Development)

The `server/data.js` file contains sample data that can be used for seeding:

1. Make sure you have Firebase Admin SDK set up
2. Run the seed script:
   ```bash
   node scripts/seed-firebase.js
   ```

**Note**: The seed script requires Firebase Admin SDK credentials. For production, use the Admin Panel or Firebase Console.

## Categories

Categories can be added through:

1. **Admin Panel** (if category management is added)
2. **Firebase Console** → `categories` collection
3. **Programmatically** using the categories service

## Important Notes

- All products must be added through Firebase
- The application will show "No products available" if the database is empty
- Admins should add products through the Admin Panel at `/admin`
- The `server/data.js` file is only for seeding/development purposes

