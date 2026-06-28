import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import type { Order } from '../../types/order';

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return;
      try {
        const response = await orderService.getOrderById(id);
        if (response.success && response.data) {
          setOrder(response.data);
        } else {
          setError(response.message || 'Failed to load order details');
        }
      } catch (err: any) {
        setError('An unexpected error occurred while fetching order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Shipped':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Processing':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Pending':
      default:
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="gradient-text text-xl font-bold animate-pulse">Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-red-400 text-xl font-bold mb-4">Order Not Found</h2>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          {error || 'The order you are trying to view does not exist or you do not have permission to view it.'}
        </p>
        <Link to="/orders" className="btn-primary">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <Link to="/orders" className="inline-flex items-center gap-2 mb-3 text-slate-400 font-medium hover:text-indigo-400 transition-colors">
            &larr; Back to my orders
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Order <span className="font-mono text-slate-400 text-lg md:text-xl">#{order._id}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div>
          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColorClass(order.status)}`}>
            Status: {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
        
        {/* Main Details Area */}
        <div className="flex flex-col gap-8">
          
          {/* Shipping Address Container */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-bold mb-4 pb-2 border-b border-white/8 text-slate-200">Shipping Information</h3>
            <div className="text-sm text-slate-300 flex flex-col gap-1 capitalize">
              <p className="font-semibold text-slate-100">{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
              <p className="text-slate-400">{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Payment Status Container */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-bold mb-4 pb-2 border-b border-white/8 text-slate-200">Payment Details</h3>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                order.isPaid 
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                  : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
              }`}>
                {order.isPaid ? 'Paid' : 'Unpaid'}
              </span>
              {order.isPaid && order.paidAt && (
                <span className="text-xs text-slate-400">
                  on {formatDate(order.paidAt)}
                </span>
              )}
            </div>
          </div>

          {/* Items Purchased List */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-bold mb-4 pb-2 border-b border-white/8 text-slate-200">Order Items</h3>
            <div className="flex flex-col gap-6">
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex gap-4 items-center">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded-xl bg-black/10"
                    />
                    <div>
                      <h4 className="font-bold text-slate-100 line-clamp-1">
                        <Link to={`/products/${item.product}`} className="hover:text-indigo-400 transition-colors">
                          {item.name}
                        </Link>
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        ${item.price.toFixed(2)} &times; {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right sm:min-w-[100px]">
                    <span className="text-base font-extrabold text-slate-200">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Sidebar Summary */}
        <aside className="glass-card p-8 rounded-2xl w-full">
          <h3 className="text-xl font-extrabold mb-6 pb-3 border-b border-white/8 text-slate-100">
            Payment Summary
          </h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Items Total</span>
              <span className="text-slate-100 font-semibold">${order.itemsPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>Shipping Fee</span>
              <span className="text-slate-100 font-semibold">
                {order.shippingPrice === 0 ? 'Free' : `$${order.shippingPrice.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>Tax (8%)</span>
              <span className="text-slate-100 font-semibold">${order.taxPrice.toFixed(2)}</span>
            </div>
            <div className="h-px bg-white/8 my-2"></div>
            <div className="flex justify-between text-lg font-black">
              <span>Grand Total</span>
              <span className="gradient-text">${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default OrderDetails;
