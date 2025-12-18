import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle, MapPin, Phone, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserOrders } from '../services/orders';
import { Order } from '../services/orders';
import { useToast } from '../contexts/ToastContext';
import { LoadingScreen } from './LoadingScreen';

export const MyOrders: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userOrders = await fetchUserOrders(user.id);
      setOrders(userOrders);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatTZS = (amount: number) => {
    return `TZS ${amount.toLocaleString('en-US')}`;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: Order['orderStatus']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Order['orderStatus']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: Order['orderStatus']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleBack = () => {
    window.history.back();
  };

  if (loading) {
    return <LoadingScreen message="Loading your orders..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your orders</p>
          <button
            onClick={handleBack}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go Back
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
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <button
              onClick={handleBack}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Order #{order.id?.substring(0, 8).toUpperCase()}
                        </h3>
                        <span
                          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            order.orderStatus
                          )}`}
                        >
                          {getStatusIcon(order.orderStatus)}
                          <span>{getStatusLabel(order.orderStatus)}</span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatTZS(order.totalAmount)}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {order.paymentMethod.replace('-', ' ')} • {order.paymentStatus}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Items ({order.items.length})</h4>
                    <div className="space-y-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800 line-clamp-1">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity} × {formatTZS(item.product.price)}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatTZS(item.product.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-gray-500 text-center pt-2">
                          +{order.items.length - 3} more item(s)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Delivery Address
                      </h4>
                      <p className="text-sm text-gray-600">
                        {order.deliveryInfo.address}
                        <br />
                        {order.deliveryInfo.city}
                        {order.deliveryInfo.postalCode && `, ${order.deliveryInfo.postalCode}`}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        Contact
                      </h4>
                      <p className="text-sm text-gray-600">
                        {order.deliveryInfo.fullName}
                        <br />
                        {order.deliveryInfo.phone}
                        <br />
                        {order.deliveryInfo.email}
                      </p>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    className="mt-4 w-full md:w-auto text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {selectedOrder?.id === order.id ? 'Hide Details' : 'View Full Details'}
                  </button>

                  {/* Expanded Details */}
                  {selectedOrder?.id === order.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      {/* All Items */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">All Items</h4>
                        <div className="space-y-3">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg">
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-16 h-16 object-cover rounded-md"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">{item.product.name}</p>
                                <p className="text-sm text-gray-500">{item.product.brand}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  Quantity: {item.quantity} × {formatTZS(item.product.price)} = {formatTZS(item.product.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Order Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">{formatTZS(order.totalAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Delivery Fee</span>
                            <span className="text-green-600 font-medium">Free</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between">
                            <span className="font-semibold text-gray-800">Total</span>
                            <span className="font-bold text-gray-900">{formatTZS(order.totalAmount)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Info */}
                      {order.transactionId && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="text-sm font-semibold text-blue-800 mb-2">Payment Transaction</h4>
                          <p className="text-sm text-blue-700 font-mono">{order.transactionId}</p>
                        </div>
                      )}

                      {/* Notes */}
                      {order.deliveryInfo.notes && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Delivery Notes</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {order.deliveryInfo.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

