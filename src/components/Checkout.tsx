import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Phone, Mail, Wallet, CheckCircle, ExternalLink, MessageCircle, AlertCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { LoadingScreen } from './LoadingScreen';
import { createOrder } from '../services/orders';
import { useCheckoutSettings } from '../hooks/useCheckoutSettings';
import { buildWhatsAppOrderMessage, generateWhatsAppUrl, cleanWhatsAppNumber } from '../services/checkoutSettings';
import { navigateToHome, navigateToOrders } from '../utils/navigation';

type PaymentMethod = 'whatsapp' | 'cash';

interface OrderSuccessState {
  orderId: string;
  whatsappUrl: string;
  paymentMethod: PaymentMethod;
}

// WhatsApp brand SVG icon
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);

export const Checkout: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { settings: checkoutSettings } = useCheckoutSettings();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('whatsapp');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<OrderSuccessState | null>(null);

  // Update form data when user loads
  useEffect(() => {
    if (user && !authLoading) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email
      }));
    }
  }, [user, authLoading]);

  const formatTZS = (amount: number) => {
    return `TZS ${amount.toLocaleString('en-US')}`;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Delivery address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    if (items.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    if (!user) {
      showToast('Please login to place an order', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create order record in Firestore
      const orderData = {
        userId: user.id,
        items,
        totalAmount: totalPrice,
        paymentMethod: paymentMethod,
        paymentStatus: 'pending' as const,
        deliveryInfo: {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          postalCode: formData.postalCode.trim() || undefined,
          notes: formData.notes.trim() || undefined,
        },
        orderStatus: 'pending' as const,
      };

      const orderId = await createOrder(orderData);

      // 2. Build WhatsApp message with all cart items and delivery details
      const adminWhatsAppNumber = checkoutSettings.whatsappNumber || '255712345678';
      const whatsappMessage = buildWhatsAppOrderMessage({
        orderId,
        items,
        totalPrice,
        deliveryInfo: orderData.deliveryInfo,
        paymentMethod,
        storeName: checkoutSettings.storeName || 'BEIPOA online',
      });

      const whatsappUrl = generateWhatsAppUrl(adminWhatsAppNumber, whatsappMessage);

      // 3. Clear cart
      clearCart();

      // 4. Update state to show order confirmation view
      setOrderSuccess({
        orderId,
        whatsappUrl,
        paymentMethod,
      });

      showToast('Order placed successfully!', 'success');

      // 5. If WhatsApp checkout, redirect user directly to WhatsApp
      if (paymentMethod === 'whatsapp') {
        // Small delay to ensure user sees transition and state is registered
        setTimeout(() => {
          window.location.href = whatsappUrl;
        }, 800);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      showToast('Failed to place order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      navigateToHome();
    }
  };

  // Show loading screen while auth is loading
  if (authLoading) {
    return <LoadingScreen message="Loading checkout..." />;
  }

  // Order Confirmed / Redirect View
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>

          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
            Agizo Limefanikiwa / Order Placed
          </span>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order #{orderSuccess.orderId.substring(0, 8).toUpperCase()}
          </h2>

          {orderSuccess.paymentMethod === 'whatsapp' ? (
            <div className="space-y-4 mb-6">
              <p className="text-gray-600 text-sm sm:text-base">
                Asante! Agizo lako limerekodiwa. Sasa unaelekezwa kwenye WhatsApp ya Admin ili kuthibitisha na kukamilisha malipo (M-Pesa, Tigo Pesa, Airtel Money).
              </p>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-left text-sm text-emerald-800 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <WhatsAppIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  Kama WhatsApp haijafunguka moja kwa moja:
                </p>
                <p className="text-xs text-emerald-700">
                  Bonyeza kitufe cha kijani hapa chini kufungua WhatsApp na kutuma maelezo ya agizo lako kwa admin.
                </p>
              </div>

              <a
                href={orderSuccess.whatsappUrl}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba57] text-white font-semibold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-95"
              >
                <WhatsAppIcon className="w-5 h-5" />
                <span>Fungua WhatsApp (Chat with Admin)</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              <p className="text-gray-600 text-sm sm:text-base">
                Agizo lako la <strong>Cash on Delivery</strong> limerekodiwa. Utalipa fedha taslimu pindi mzigo wako utakapoletwa.
              </p>
              <p className="text-xs text-gray-500">
                Unaweza pia kumjulisha admin kupitia WhatsApp kwa mawasiliano ya haraka zaidi:
              </p>
              <a
                href={orderSuccess.whatsappUrl}
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Tuma Taarifa WhatsApp (Optional)</span>
              </a>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => navigateToOrders()}
              className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold rounded-xl transition-colors"
            >
              Maagizo Yangu (My Orders)
            </button>
            <button
              onClick={() => navigateToHome()}
              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Rudi Dukani (Shop More)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Cart empty view
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to checkout</p>
          <button
            onClick={handleBack}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back to Shopping</span>
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3">
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <span className="text-xs sm:text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-medium mt-1 sm:mt-0 inline-flex items-center gap-1.5 w-fit">
              <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
              WhatsApp Checkout & Processing
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Information */}
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Delivery Information (Taarifa za Uwasilishaji)
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name (Jina Kamili) *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                      errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="e.g. John Doe"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address (Barua Pepe) *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <Phone className="h-4 w-4 mr-1 text-gray-500" />
                      Phone Number (Namba ya Simu) *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                        errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="+255 712 345 678"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address (Mtaa / Sehemu ya Kuletewa) *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                      errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Street address, house number, nearby landmark"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City / Region (Mkoa / Wilaya) *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                        errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="e.g. Dar es Salaam, Arusha, Mwanza"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code (Optional)
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="Postal code (optional)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Notes / Instructions (Maelekezo ya Ziada)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Any special instructions for delivery or order..."
                  />
                </div>
              </div>
            </div>

            {/* Payment & Processing Method */}
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 flex items-center">
                <Wallet className="h-5 w-5 mr-2 text-blue-600" />
                Payment & Order Method (Njia ya Malipo na Agizo)
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mb-4">
                Chagua namna unavyopenda kuthibitisha agizo na kulipia:
              </p>

              <div className="space-y-3">
                {/* Option 1: WhatsApp Checkout */}
                <label
                  className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'whatsapp'
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="whatsapp"
                    checked={paymentMethod === 'whatsapp'}
                    onChange={() => setPaymentMethod('whatsapp')}
                    className="sr-only"
                  />
                  <div className="mr-3 mt-0.5 text-emerald-600">
                    <WhatsAppIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">
                        WhatsApp Checkout & Mobile Money
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      M-Pesa, Tigo Pesa, Airtel Money, Halopesa
                    </p>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                      Ukibonyeza <strong>Place Order</strong>, agizo lako litarekodiwa na utaelekezwa moja kwa moja kwenye WhatsApp ya Admin ukiwa na orodha yote ya bidhaa zako (whole cart) kwa ajili ya kuthibitishiwa na kupewa maelekezo ya malipo.
                    </p>
                  </div>
                  <div className="ml-2 flex items-center h-full pt-1">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'whatsapp' ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'whatsapp' && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </label>

                {/* Option 2: Cash on Delivery */}
                <label
                  className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                    className="sr-only"
                  />
                  <div className="mr-3 mt-0.5 text-blue-600">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">
                      Cash on Delivery (Lipa Ukipokea Mzigo)
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Lipa pesa taslimu wakati mzigo unapokabidhiwa kwako.
                    </p>
                  </div>
                  <div className="ml-2 flex items-center h-full pt-1">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'cash' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'cash' && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </label>
              </div>

              {/* Informational notification */}
              <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2.5">
                <WhatsAppIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-800 leading-relaxed">
                  <strong>Haraka & Salama:</strong> Baada ya kuthibitisha agizo lako, utaunganishwa na muuzaji moja kwa moja kupitia WhatsApp ya namba <strong>+{cleanWhatsAppNumber(checkoutSettings.whatsappNumber || '255712345678')}</strong> ili kushughulikia oda yako mara moja.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1 mt-6 lg:mt-0">
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 sticky top-24">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
              </h2>

              {/* Cart Items List */}
              <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-1 divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.product.id} className="pt-3 first:pt-0 flex space-x-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 object-cover rounded-lg flex-shrink-0 border"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs sm:text-sm text-gray-800 line-clamp-2">
                        {item.product.name}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                        <span>Qty: {item.quantity}</span>
                        <span className="font-semibold text-gray-900">
                          {formatTZS(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Calculations */}
              <div className="border-t pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatTZS(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="text-emerald-600 font-medium">Bure / Free</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-base sm:text-lg font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-blue-600">{formatTZS(totalPrice)}</span>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full mt-6 py-3.5 px-4 rounded-xl font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                  paymentMethod === 'whatsapp'
                    ? 'bg-[#25D366] hover:bg-[#20ba57] active:scale-[0.98]'
                    : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <span>Processing Order...</span>
                ) : paymentMethod === 'whatsapp' ? (
                  <>
                    <WhatsAppIcon className="w-5 h-5 text-white" />
                    <span>Confirm & Order via WhatsApp</span>
                  </>
                ) : (
                  <span>Place Order - {formatTZS(totalPrice)}</span>
                )}
              </button>

              <p className="text-[11px] text-gray-500 text-center mt-3">
                Kwa kukamilisha agizo hili, unakubaliana na sera na vigezo vya {checkoutSettings.storeName || 'BEIPOA online'}.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
