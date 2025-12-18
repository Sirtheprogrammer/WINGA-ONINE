import { StrictMode, useEffect, useState } from 'react';
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
import { navigateTo, navigateToAdmin, navigateToHome } from './utils/navigation';

// AdminRedirect is now handled in Router component

function Router() {
  const { loading, user, isAdmin } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // Listen for navigation events (popstate for browser back/forward, and our custom navigation)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('locationchange', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('locationchange', handleLocationChange);
    };
  }, []);
  
  // Handle redirects based on auth state
  useEffect(() => {
    if (loading) return;
    
    const path = window.location.pathname;
    
    // Redirect non-admin users away from admin page
    if (path.startsWith('/admin')) {
      if (!user || !isAdmin) {
        navigateToHome();
        setCurrentPath('/');
        return;
      }
    }
    
    // Auto-redirect admin users from home page to admin panel
    if ((path === '/' || path === '') && user && isAdmin) {
      navigateToAdmin();
      setCurrentPath('/admin');
      return;
    }
  }, [loading, user, isAdmin]);
  
  // Show loading screen during initial auth check
  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }
  
  const path = currentPath;
  
  // Handle admin routes with proper checks
  if (path.startsWith('/admin')) {
    // If not logged in or not admin, show loading (redirect handled in useEffect)
    if (!user || !isAdmin) {
      return <LoadingScreen message="Redirecting..." />;
    }
    return <AdminPanel />;
  }
  
  // Auto-redirect admin users from home page to admin panel
  if ((path === '/' || path === '') && user && isAdmin) {
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
