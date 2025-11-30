# Firebase Setup Guide

This project uses Firebase for authentication, database (Firestore), and data storage.

## Prerequisites

1. A Firebase project created at [Firebase Console](https://console.firebase.google.com/)
2. Firebase Authentication enabled
3. Firestore Database enabled

## Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard
4. Enable Google Analytics (optional)

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider
3. Save changes

### 3. Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Start in **test mode** (we'll update rules later)
4. Choose a location for your database

### 4. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (`</>`) to add a web app
4. Register your app and copy the configuration object

### 5. Set Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 6. Deploy Firestore Security Rules

1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init firestore
   ```
   - Select your Firebase project
   - Use the existing `firestore.rules` file
   - Use the existing `firestore.indexes.json` file

4. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### 7. Seed Initial Data (Optional)

Run the seed script to populate initial products and categories:

```bash
npm run seed
```

Or manually add data through the Firebase Console or Admin Panel at `/admin`.

## Firestore Collections

The app uses the following collections:

- **products**: Product catalog (readable by all, writable by authenticated users)
- **categories**: Product categories (readable by all, writable by authenticated users)
- **users**: User profiles (users can only access their own data)
- **carts**: Shopping carts (users can only access their own cart)
- **wishlists**: User wishlists (users can only access their own wishlist)

## Security Rules

Security rules are defined in `firestore.rules`. Key points:

- **Products & Categories**: Readable by everyone, writable by authenticated users
- **Users**: Users can only read/write their own data
- **Carts & Wishlists**: Users can only access their own data

## Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
3. Try creating an account and adding products to cart/wishlist
4. Check Firebase Console to see data being created

## Admin Panel

Access the admin panel at `/admin` to manage products directly in Firebase.

