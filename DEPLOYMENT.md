# Production Deployment Guide

This guide explains how to deploy the application to production and fix common issues.

## Common Production Issues

### 1. 404 Errors on Routes (Orders, Checkout, Admin)

**Problem**: When navigating to routes like `/orders`, `/checkout`, or `/admin`, you get 404 errors.

**Solution**: The app uses client-side routing. The server needs to be configured to serve `index.html` for all routes.

#### For Netlify

Create `public/_redirects` file (already included):
```
/*    /index.html   200
```

#### For Vercel

Create `vercel.json` file (already included):
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### For Apache

Create `.htaccess` in the `dist` folder:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### For Nginx

Add to your nginx config:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

#### For Express/Node.js Server

```javascript
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

### 2. Slow Session Loading

**Problem**: Authentication state takes too long to load.

**Solutions Implemented**:
- Firebase Auth persistence enabled (localStorage)
- Timeout for Firestore queries (3 seconds)
- Fallback to Firebase Auth data if Firestore is slow
- Optimized auth state listener

### 3. Environment Variables

Make sure all environment variables are set in your hosting platform:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Build and Deploy

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting platform

3. **Configure server** to serve `index.html` for all routes (see above)

4. **Set environment variables** in your hosting platform

5. **Test all routes**:
   - `/` - Home page
   - `/orders` - My Orders
   - `/checkout` - Checkout
   - `/admin` - Admin Panel

## Performance Optimization

- Firebase Auth persistence is enabled for faster session restoration
- Firestore queries have timeout protection
- Auth state listener is optimized with cleanup

## Troubleshooting

### Routes still return 404

1. Check that redirect/rewrite rules are in place
2. Verify `index.html` is in the root of your `dist` folder
3. Check server logs for routing issues
4. Clear browser cache and try again

### Session still loading slowly

1. Check Firebase connection in browser console
2. Verify Firestore rules allow reading user data
3. Check network tab for slow requests
4. Consider using Firebase Auth only (without Firestore role check) for initial load

