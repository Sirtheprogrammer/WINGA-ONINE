import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AdminPanel } from './components/AdminPanel';
import { Checkout } from './components/Checkout';
import { MyOrders } from './components/MyOrders';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';

// Component to handle admin auto-redirect
function AdminRedirect() {
  const { user, isAdmin, loading } = useAuth();
  const path = window.location.pathname;

  useEffect(() => {
    // Only redirect if:
    // 1. Auth is loaded (not loading)
    // 2. User is admin
    // 3. On root path (home page)
    // 4. Not already on admin, checkout, or orders pages
    if (!loading && isAdmin && user && (path === '/' || path === '')) {
      window.location.href = '/admin';
    }
  }, [loading, isAdmin, user, path]);

  return null;
}

function Router() {
  const path = window.location.pathname;
  
  if (path.startsWith('/admin')) {
    return (
      <ToastProvider>
        <AuthProvider>
          <AdminPanel />
        </AuthProvider>
      </ToastProvider>
    );
  }
  
  if (path.startsWith('/checkout')) {
    return <Checkout />;
  }
  
  if (path.startsWith('/orders') || path.startsWith('/my-orders')) {
    return <MyOrders />;
  }
  
  return (
    <>
      <AdminRedirect />
      <App />
    </>
  );
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithProviders />
  </StrictMode>
);
