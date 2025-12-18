import { useState, useEffect } from 'react';
import { OfferSettings, getOfferSettings, subscribeToOfferSettings } from '../services/offerSettings';

export const useOfferSettings = () => {
  const [settings, setSettings] = useState<OfferSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load
    getOfferSettings().then(data => {
      setSettings(data);
      setLoading(false);
    });

    // Subscribe to real-time updates
    const unsubscribe = subscribeToOfferSettings((data) => {
      setSettings(data);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { settings, loading };
};

