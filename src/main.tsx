import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AdminPanel } from './components/AdminPanel';
import { Checkout } from './components/Checkout';
import { MyOrders } from './components/MyOrders';
import { LoadingScreen } from './components/LoadingScreen';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { firebaseLogger } from './services/logger';

// AdminRedirect is now handled in Router component

function Router() {
  const { loading, user, isAdmin } = useAuth();
  const path = window.location.pathname;
  
  // Show loading screen during initial auth check
  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }
  
  // Handle admin routes with proper checks
  if (path.startsWith('/admin')) {
    // If not logged in or not admin, show loading then redirect
    if (!user) {
      return <LoadingScreen message="Checking access..." />;
    }
    if (!isAdmin) {
      // Redirect non-admin users away from admin page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      return <LoadingScreen message="Redirecting..." />;
    }
    return <AdminPanel />;
  }
  
  // Auto-redirect admin users from home page to admin panel
  if ((path === '/' || path === '') && user && isAdmin) {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin';
    }
    return <LoadingScreen message="Redirecting to admin panel..." />;
  }
  
  if (path.startsWith('/checkout')) {
    return <Checkout />;
  }
  
  if (path.startsWith('/orders') || path.startsWith('/my-orders')) {
    return <MyOrders />;
  }
  
  return <App />;
}

// Wrap all routes with providers at the top level to maintain state across routes
function AppWithProviders() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

// Make logger available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).firebaseLogger = firebaseLogger;
  
  // Show prominent startup message
  console.log('%c═══════════════════════════════════════════════════════════', 'color: #0066cc; font-weight: bold;');
  console.log('%c🔥 Firebase Logger Initialized!', 'color: #0066cc; font-weight: bold; font-size: 16px;');
  console.log('%c═══════════════════════════════════════════════════════════', 'color: #0066cc; font-weight: bold;');
  console.log('%cAccess logs via: window.firebaseLogger', 'color: green; font-weight: bold;');
  console.log('%cMethods: getLogs(), getErrorLogs(), getLogsByService(service), exportLogs()', 'color: gray;');
  console.log('%cAll Firebase operations will be logged below:', 'color: gray; font-style: italic;');
  console.log('');
  
  // Test log to verify logger is working
  firebaseLogger.info('APP', 'STARTUP', 'Application starting - Logger is working!', {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent.substring(0, 50) + '...'
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithProviders />
  </StrictMode>
);
