import { useState, useEffect, useCallback } from 'react';
import { CheckoutSettings, getCheckoutSettings, subscribeToCheckoutSettings, DEFAULT_CHECKOUT_SETTINGS } from '../services/checkoutSettings';

export const useCheckoutSettings = () => {
  const [settings, setSettings] = useState<CheckoutSettings>(DEFAULT_CHECKOUT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getCheckoutSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to refresh checkout settings:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Initial load
    getCheckoutSettings().then((data) => {
      if (isMounted) {
        setSettings(data);
        setLoading(false);
      }
    });

    // Subscribe to real-time updates
    const unsubscribe = subscribeToCheckoutSettings((data) => {
      if (isMounted) {
        setSettings(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { settings, loading, refresh };
};
