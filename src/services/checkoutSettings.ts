import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/client';
import { CartItem } from '../types';

export interface CheckoutSettings {
  whatsappNumber: string;
  storeName: string;
  customGreeting?: string;
  enableWhatsAppCheckout: boolean;
  enableCashOnDelivery: boolean;
  updatedAt?: string;
}

export interface DeliveryInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
  notes?: string;
}

const CHECKOUT_SETTINGS_DOC = 'checkoutSettings';

export const DEFAULT_CHECKOUT_SETTINGS: CheckoutSettings = {
  whatsappNumber: '255712345678',
  storeName: 'BEIPOA online',
  customGreeting: 'Hello Admin! I would like to confirm my order from the website.',
  enableWhatsAppCheckout: true,
  enableCashOnDelivery: true,
};

/**
 * Clean phone number to ensure proper WhatsApp international format
 * Converts '0712345678' -> '255712345678'
 * Strips '+', spaces, dashes, brackets
 */
export function cleanWhatsAppNumber(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '255' + cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Fetch checkout settings from Firestore
 */
export async function getCheckoutSettings(): Promise<CheckoutSettings> {
  try {
    const docRef = doc(db, 'settings', CHECKOUT_SETTINGS_DOC);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        whatsappNumber: data.whatsappNumber || DEFAULT_CHECKOUT_SETTINGS.whatsappNumber,
        storeName: data.storeName || DEFAULT_CHECKOUT_SETTINGS.storeName,
        customGreeting: data.customGreeting !== undefined ? data.customGreeting : DEFAULT_CHECKOUT_SETTINGS.customGreeting,
        enableWhatsAppCheckout: data.enableWhatsAppCheckout !== undefined ? data.enableWhatsAppCheckout : true,
        enableCashOnDelivery: data.enableCashOnDelivery !== undefined ? data.enableCashOnDelivery : true,
        updatedAt: data.updatedAt,
      };
    }

    return DEFAULT_CHECKOUT_SETTINGS;
  } catch (error) {
    console.error('Error fetching checkout settings:', error);
    return DEFAULT_CHECKOUT_SETTINGS;
  }
}

/**
 * Update checkout settings in Firestore (admin only)
 */
export async function updateCheckoutSettings(settings: Partial<CheckoutSettings>): Promise<void> {
  try {
    const docRef = doc(db, 'settings', CHECKOUT_SETTINGS_DOC);
    const current = await getCheckoutSettings();

    const updated: CheckoutSettings = {
      ...current,
      ...settings,
      whatsappNumber: settings.whatsappNumber ? cleanWhatsAppNumber(settings.whatsappNumber) : current.whatsappNumber,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(docRef, updated);
  } catch (error) {
    console.error('Error updating checkout settings:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time checkout settings
 */
export function subscribeToCheckoutSettings(
  callback: (settings: CheckoutSettings) => void
): () => void {
  const docRef = doc(db, 'settings', CHECKOUT_SETTINGS_DOC);

  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({
          whatsappNumber: data.whatsappNumber || DEFAULT_CHECKOUT_SETTINGS.whatsappNumber,
          storeName: data.storeName || DEFAULT_CHECKOUT_SETTINGS.storeName,
          customGreeting: data.customGreeting !== undefined ? data.customGreeting : DEFAULT_CHECKOUT_SETTINGS.customGreeting,
          enableWhatsAppCheckout: data.enableWhatsAppCheckout !== undefined ? data.enableWhatsAppCheckout : true,
          enableCashOnDelivery: data.enableCashOnDelivery !== undefined ? data.enableCashOnDelivery : true,
          updatedAt: data.updatedAt,
        });
      } else {
        callback(DEFAULT_CHECKOUT_SETTINGS);
      }
    },
    (error) => {
      console.error('Error subscribing to checkout settings:', error);
      callback(DEFAULT_CHECKOUT_SETTINGS);
    }
  );

  return unsubscribe;
}

/**
 * Format currency in TZS
 */
function formatTZS(amount: number): string {
  return `TZS ${amount.toLocaleString('en-US')}`;
}

/**
 * Build the full WhatsApp order message with all cart items and customer delivery info
 */
export function buildWhatsAppOrderMessage(params: {
  orderId: string;
  items: CartItem[];
  totalPrice: number;
  deliveryInfo: DeliveryInfo;
  paymentMethod: 'whatsapp' | 'cash' | 'mobile-money';
  storeName?: string;
}): string {
  const { orderId, items, totalPrice, deliveryInfo, paymentMethod, storeName = 'BEIPOA online' } = params;
  const shortId = orderId ? orderId.substring(0, 8).toUpperCase() : 'NEW';

  let message = `🛒 *AGIZO JIPYA / NEW ORDER*\n`;
  message += `🏢 *${storeName}*\n`;
  message += `🔖 *Namba ya Agizo / Order ID:* #${shortId}\n`;
  message += `──────────────────\n\n`;

  message += `👤 *TAARIFA ZA MTEJA / CUSTOMER:*\n`;
  message += `• *Jina / Name:* ${deliveryInfo.fullName}\n`;
  message += `• *Simu / Phone:* ${deliveryInfo.phone}\n`;
  if (deliveryInfo.email) {
    message += `• *Barua Pepe / Email:* ${deliveryInfo.email}\n`;
  }
  message += `• *Mtaa / Address:* ${deliveryInfo.address}\n`;
  message += `• *Mji / City:* ${deliveryInfo.city}\n`;
  if (deliveryInfo.postalCode) {
    message += `• *Postal Code:* ${deliveryInfo.postalCode}\n`;
  }
  if (deliveryInfo.notes) {
    message += `• *Maelezo / Notes:* ${deliveryInfo.notes}\n`;
  }

  message += `\n📦 *BIDHAA ZILIZOCHAGULIWA / CART ITEMS (${items.length}):*\n`;
  items.forEach((item, index) => {
    const itemSubtotal = item.product.price * item.quantity;
    message += `${index + 1}. *${item.product.name}*\n`;
    message += `   • Idadi / Qty: ${item.quantity}\n`;
    message += `   • Bei / Price: ${formatTZS(item.product.price)}\n`;
    message += `   • Jumla / Subtotal: ${formatTZS(itemSubtotal)}\n`;
  });

  message += `\n💰 *MUHTASARI WA MALIPO / SUMMARY:*\n`;
  message += `• *Jumla Kuu / Total:* *${formatTZS(totalPrice)}*\n`;
  message += `• *Usafirishaji / Delivery:* Bure / Free\n`;
  message += `• *Njia ya Malipo / Method:* ${paymentMethod === 'whatsapp' ? 'WhatsApp / Mobile Money (M-Pesa, Tigo Pesa, Airtel Money)' : 'Cash on Delivery'}\n`;
  message += `──────────────────\n`;
  message += `Habari Admin! Nimekamilisha agizo hili kutoka website. Naomba uthibitisho wa agizo na namba ya malipo (Lipa Namba). Asante!`;

  return message;
}

/**
 * Generate the WhatsApp URL to open WhatsApp with the prefilled message
 */
export function generateWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanPhone = cleanWhatsAppNumber(phoneNumber);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
