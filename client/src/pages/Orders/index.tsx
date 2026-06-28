import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import type { Order } from '../../types/order';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getMyOrders();
        if (response.success && response.data) {
          setOrders(response.data);
        } else {
          setError(response.message || 'Failed to load your orders');
        }
      } catch (err: any) {
        setError('An unexpected error occurred while fetching orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">Your Orders</h1>
        <p className="text-slate-400">Track and review your order history.</p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="gradient-text text-xl font-bold animate-pulse">Loading orders...</div>
        </div>
      ) : error ? (
        <div className="glass-card p-12 text-center rounded-2xl max-w-lg mx-auto">
          <h3 className="text-red-400 text-lg font-bold mb-2">Unable to retrieve orders</h3>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card p-16 text-center rounded-2xl max-w-lg mx-auto">
          <h2 className="text-xl font-bold mb-3">No orders placed yet</h2>
          <p className="text-slate-400 mb-8">You haven't placed any orders with Galaxy yet.</p>
          <Link to="/products" className="btn-primary px-6 py-3">Explore Products</Link>
        </div>
      ) : (
        /* Orders list table / grid */
        <div className="glass-card rounded-2xl overflow-hidden border border-white/8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/8 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Total Price</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4 text-sm text-slate-300">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-slate-400">
                      {order._id}
                    </td>
                    <td className="py-4 px-6 font-medium">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColorClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-extrabold text-slate-200">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/orders/${order._id}`}
                        className="btn-secondary px-4 py-1.5 text-xs inline-flex items-center"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
