import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/client';

export type CarouselType = 'normal' | 'christmas' | 'special-offer';

export interface OfferSettings {
  carouselType: CarouselType;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  title: string;
  description: string;
  isActive: boolean;
}

const OFFER_SETTINGS_DOC = 'offerSettings';
const DEFAULT_SETTINGS: OfferSettings = {
  carouselType: 'normal',
  startDate: new Date().toISOString(),
  endDate: new Date().toISOString(),
  title: 'Welcome to BEIPOA online',
  description: 'Shop the best deals and affordable products in Tanzania',
  isActive: false
};

/**
 * Get current offer settings from Firestore
 */
export async function getOfferSettings(): Promise<OfferSettings> {
  try {
    const docRef = doc(db, 'settings', OFFER_SETTINGS_DOC);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Check if offer is still active based on start and end dates
      const now = new Date();
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const isActive = data.isActive && now >= startDate && now <= endDate;
      
      return {
        carouselType: data.carouselType || 'normal',
        startDate: data.startDate || DEFAULT_SETTINGS.startDate,
        endDate: data.endDate || DEFAULT_SETTINGS.endDate,
        title: data.title || DEFAULT_SETTINGS.title,
        description: data.description || DEFAULT_SETTINGS.description,
        isActive
      } as OfferSettings;
    }
    
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error fetching offer settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update offer settings (admin only)
 */
export async function updateOfferSettings(settings: Partial<OfferSettings>): Promise<void> {
  try {
    const docRef = doc(db, 'settings', OFFER_SETTINGS_DOC);
    const currentSettings = await getOfferSettings();
    
    const updatedSettings: OfferSettings = {
      ...currentSettings,
      ...settings,
      // Ensure dates are valid
      startDate: settings.startDate || currentSettings.startDate,
      endDate: settings.endDate || currentSettings.endDate
    };
    
    await setDoc(docRef, updatedSettings);
  } catch (error) {
    console.error('Error updating offer settings:', error);
    throw error;
  }
}

/**
 * Subscribe to offer settings changes
 */
export function subscribeToOfferSettings(
  callback: (settings: OfferSettings) => void
): () => void {
  const docRef = doc(db, 'settings', OFFER_SETTINGS_DOC);
  
  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const now = new Date();
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        const isActive = data.isActive && now >= startDate && now <= endDate;
        
        callback({
          carouselType: data.carouselType || 'normal',
          startDate: data.startDate || DEFAULT_SETTINGS.startDate,
          endDate: data.endDate || DEFAULT_SETTINGS.endDate,
          title: data.title || DEFAULT_SETTINGS.title,
          description: data.description || DEFAULT_SETTINGS.description,
          isActive
        } as OfferSettings);
      } else {
        callback(DEFAULT_SETTINGS);
      }
    },
    (error) => {
      console.error('Error subscribing to offer settings:', error);
      callback(DEFAULT_SETTINGS);
    }
  );
  
  return unsubscribe;
}

