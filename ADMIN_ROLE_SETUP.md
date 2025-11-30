# Admin Role Setup Guide

This guide explains how to assign admin roles to users in the application.

## Overview

The application uses a role-based access control system with two roles:
- **user** (default) - Regular users who can shop and place orders
- **admin** - Administrators who can manage products, orders, and users

## How to Assign Admin Role

### Method 1: Using Firebase Console (Recommended for First Admin)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`shop-4bd19`)
3. Navigate to **Firestore Database**
4. Open the `users` collection
5. Find the user document you want to make admin (by their user ID)
6. Click on the document to edit it
7. Add a new field:
   - **Field name**: `role`
   - **Field type**: `string`
   - **Field value**: `admin`
8. Save the document

### Method 2: Using Admin Panel (After First Admin is Set)

1. Log in as an existing admin user
2. Navigate to `/admin`
3. Go to the **Users** tab
4. Find the user you want to make admin
5. Use the **Role** dropdown next to their name
6. Select **Admin** from the dropdown
7. The role will be updated immediately

### Method 3: Using Firebase CLI

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set admin role for a user (replace USER_ID with actual user ID)
firebase firestore:set users/USER_ID '{ "role": "admin" }' --merge
```

### Method 4: Programmatically (For Development)

You can also set admin role programmatically using the Firebase Admin SDK or through the app's admin panel.

## First Admin Setup

Since the admin panel requires admin access, you need to set the first admin through Firebase Console:

1. Create a user account through the app (sign up)
2. Note the user's UID (found in Firebase Console → Authentication)
3. Go to Firestore Database → `users` collection
4. Find the document with that UID
5. Add `role: "admin"` field
6. That user can now access `/admin` and assign roles to other users

## Verifying Admin Access

1. Log in as the user you assigned admin role to
2. Navigate to `/admin`
3. If you see "Access Denied - You need admin privileges", the role wasn't set correctly
4. If you see the admin panel, the role is working correctly

## Security Notes

- Only users with `role: "admin"` can access the admin panel
- Admins can:
  - Manage all products (CRUD)
  - View and update all orders
  - View, edit, and delete all users
  - Assign admin roles to other users
- Regular users can only:
  - View products
  - Place orders
  - View their own orders
  - Manage their own profile

## Firestore Security Rules

The security rules check for admin role:
- Products: Only admins can create/update/delete
- Categories: Only admins can create/update/delete
- Orders: Admins can read/update all, users can only read/update their own
- Users: Admins can read/update/delete all, users can only read/update their own

## Troubleshooting

**Problem**: "Access Denied" even after setting role
- **Solution**: 
  1. Make sure you saved the `role` field in Firestore
  2. Log out and log back in to refresh the user session
  3. Check that the field is exactly `role` (lowercase) with value `admin` (lowercase)

**Problem**: Can't see users in admin panel
- **Solution**: Make sure you're logged in as an admin and the Firestore rules allow reading users

**Problem**: Can't update user roles
- **Solution**: Check Firestore rules allow admin updates to users collection

## Best Practices

1. **Limit Admin Access**: Only assign admin role to trusted users
2. **First Admin**: Always set the first admin through Firebase Console for security
3. **Regular Audits**: Periodically review who has admin access
4. **Role Verification**: Test admin access after assigning roles
5. **Backup Admin**: Always have at least 2 admin users in case one account is locked

