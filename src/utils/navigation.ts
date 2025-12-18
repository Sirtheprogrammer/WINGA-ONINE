/**
 * Client-side navigation utility
 * Prevents full page reloads by using history API
 */

export function navigateTo(path: string) {
  if (typeof window !== 'undefined') {
    // Only navigate if we're not already on that path
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      // Dispatch a custom event to trigger re-render
      window.dispatchEvent(new PopStateEvent('popstate'));
      // Also trigger a custom event for our Router to catch
      window.dispatchEvent(new Event('locationchange'));
    }
  }
}

export function navigateToAdmin() {
  navigateTo('/admin');
}

export function navigateToHome() {
  navigateTo('/');
}

export function navigateToOrders() {
  navigateTo('/orders');
}

export function navigateToCheckout() {
  navigateTo('/checkout');
}

