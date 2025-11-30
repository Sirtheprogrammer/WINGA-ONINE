import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { createTransaction, checkTransactionStatus } from '../services/payment';
import { useToast } from '../contexts/ToastContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: (transactionId: string) => void;
  onFailure: () => void;
}

type PaymentState = 'form' | 'processing' | 'waiting' | 'success' | 'failed';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  onSuccess,
  onFailure,
}) => {
  const [state, setState] = useState<PaymentState>('form');
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [transactionId, setTransactionId] = useState<string>('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const { showToast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const formatTZS = (amount: number) => {
    return `TZS ${amount.toLocaleString('en-US')}`;
  };

  // Format phone number (remove spaces, ensure it starts with country code)
  const formatPhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/\s+/g, '');
    // If doesn't start with 255, add it (Tanzania country code)
    if (!cleaned.startsWith('255')) {
      if (cleaned.startsWith('0')) {
        cleaned = '255' + cleaned.substring(1);
      } else {
        cleaned = '255' + cleaned;
      }
    }
    return cleaned;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const cleaned = formData.phone.replace(/\s+/g, '');
      if (cleaned.length < 9) {
        newErrors.phone = 'Phone number is too short';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setState('processing');

    try {
      const formattedPhone = formatPhoneNumber(formData.phone);
      const response = await createTransaction(formattedPhone, amount, formData.name);
      
      if (response.status === 'success' && response.data.tranID) {
        setTransactionId(response.data.tranID);
        setState('waiting');
        startTimeRef.current = Date.now();
        startPolling(response.data.tranID);
      } else {
        throw new Error(response.message || 'Failed to initiate payment');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      showToast(error.message || 'Failed to initiate payment. Please try again.', 'error');
      setState('failed');
      onFailure();
    }
  };

  const startPolling = (tranid: string) => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Poll every 5 seconds
    intervalRef.current = setInterval(async () => {
      try {
        const response = await checkTransactionStatus(tranid);
        
        if (response.status === 'success' && response.data) {
          const paymentStatus = response.data.payment_status;
          
          if (paymentStatus === 'COMPLETED') {
            // Payment successful
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            setState('success');
            showToast('Payment completed successfully!', 'success');
            setTimeout(() => {
              onSuccess(tranid);
            }, 1500);
          } else if (paymentStatus === 'PENDING') {
            // Check if 2 minutes have passed
            const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setTimeElapsed(elapsed);
            
            if (elapsed >= 120) {
              // 2 minutes passed, mark as failed
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
              }
              setState('failed');
              showToast('Payment timeout. Please try again.', 'error');
              onFailure();
            }
          } else {
            // Payment failed
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            setState('failed');
            showToast('Payment failed. Please try again.', 'error');
            onFailure();
          }
        }
      } catch (error: any) {
        console.error('Status check error:', error);
        // Don't stop polling on error, just log it
      }
    }, 5000); // Poll every 5 seconds
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setState('form');
      setFormData({ name: '', phone: '' });
      setErrors({});
      setTransactionId('');
      setTimeElapsed(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={state === 'form' ? onClose : undefined} />
        
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Mobile Money Payment</h2>
            {state === 'form' && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Form State */}
          {state === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Amount to pay:</strong> {formatTZS(amount)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0695123456 or 255695123456"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Enter your M-Pesa, Tigo Pesa, or Airtel Money number
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Pay {formatTZS(amount)}
              </button>
            </form>
          )}

          {/* Processing State */}
          {state === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-700">Initiating payment...</p>
            </div>
          )}

          {/* Waiting State */}
          {state === 'waiting' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Waiting for Payment Confirmation
              </h3>
              <p className="text-gray-600 mb-4">
                Please complete the payment on your phone. Do not close this page.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center space-x-2 text-yellow-800">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">
                    Time elapsed: {formatTime(timeElapsed)} / 2:00
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Transaction ID: <span className="font-mono">{transactionId}</span>
              </p>
            </div>
          )}

          {/* Success State */}
          {state === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Payment Successful!
              </h3>
              <p className="text-gray-600">
                Your payment has been confirmed. Processing your order...
              </p>
            </div>
          )}

          {/* Failed State */}
          {state === 'failed' && (
            <div className="text-center py-8">
              <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Payment Failed
              </h3>
              <p className="text-gray-600 mb-6">
                {timeElapsed >= 120
                  ? 'Payment timeout. Please try again.'
                  : 'Payment could not be completed. Please try again.'}
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setState('form');
                    setFormData({ name: '', phone: '' });
                    setErrors({});
                    setTimeElapsed(0);
                  }}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

