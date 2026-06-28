import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import orderService from '../../services/orderService';
import type { ShippingAddress } from '../../types/order';

const Checkout: React.FC = () => {
  const { cart, loading: cartLoading, refreshCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const items = cart?.items || [];

  // Redirect if cart is empty after initial loading
  useEffect(() => {
    if (!cartLoading && items.length === 0) {
      navigate('/cart');
    }
  }, [cartLoading, items, navigate]);

  const subtotal = items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
  const shipping = subtotal > 300 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !city || !postalCode || !country) {
      setError('Please fill in all shipping fields');
      return;
    }

    setLoading(true);
    setError('');

    const shippingDetails: ShippingAddress = {
      address,
      city,
      postalCode,
      country,
    };

    try {
      const response = await orderService.createOrder(shippingDetails);
      if (response.success && response.data) {
        // Refresh cart context to clear cart status in header count
        await refreshCart();
        navigate('/orders');
      } else {
        setError(response.message || 'Failed to place order. Please try again.');
      }
    } catch (err: any) {
      setError('An unexpected error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="text-center py-20">
        <div className="gradient-text text-xl font-bold animate-pulse">Loading checkout details...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">Checkout</h1>
        <p className="text-slate-400">Enter your shipping details and place your order.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-lg text-sm mb-6 max-w-5xl">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 items-start">
        {/* Shipping Form */}
        <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl flex flex-col gap-6">
          <h2 className="text-xl font-bold pb-3 border-b border-white/8 text-slate-100">Shipping Details</h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="address">
              Street Address
            </label>
            <input
              id="address"
              type="text"
              required
              placeholder="123 Galaxy St"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={loading}
              className="form-control text-sm py-2.5 px-3.5"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="city">
                City
              </label>
              <input
                id="city"
                type="text"
                required
                placeholder="Nebula City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={loading}
                className="form-control text-sm py-2.5 px-3.5"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="postalCode">
                Postal Code
              </label>
              <input
                id="postalCode"
                type="text"
                required
                placeholder="10001"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                disabled={loading}
                className="form-control text-sm py-2.5 px-3.5"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="country">
                Country
              </label>
              <input
                id="country"
                type="text"
                required
                placeholder="Milky Way"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={loading}
                className="form-control text-sm py-2.5 px-3.5"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-4">
            <Link to="/cart" className="btn-secondary py-3 text-sm flex-grow">
              Return to Cart
            </Link>
            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="btn-primary py-3 text-sm flex-grow cursor-pointer"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </form>

        {/* Order Summary */}
        <aside className="glass-card p-8 rounded-2xl w-full">
          <h3 className="text-xl font-extrabold mb-6 pb-3 border-b border-white/8 text-slate-100">Order Summary</h3>

          {/* Cart Items List */}
          <div className="flex flex-col gap-4 mb-6 max-h-[250px] overflow-y-auto pr-2 border-b border-white/8 pb-6">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;
              const primaryImage = product.images && product.images.length > 0
                ? product.images[0]
                : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';

              return (
                <div key={product._id} className="flex gap-4 items-center">
                  <img
                    src={primaryImage}
                    alt={product.title}
                    className="w-12 h-12 object-cover rounded-lg bg-black/10"
                  />
                  <div className="flex-grow min-w-0">
                    <h4 className="text-sm font-bold text-slate-200 truncate">{product.title}</h4>
                    <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-extrabold text-slate-200">
                    ${(product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pricing Totals */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Subtotal</span>
              <span className="text-slate-100 font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>Shipping</span>
              <span className="text-slate-100 font-semibold">
                {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>Estimated Tax (8%)</span>
              <span className="text-slate-100 font-semibold">${tax.toFixed(2)}</span>
            </div>
            <div className="h-px bg-white/8 my-2"></div>
            <div className="flex justify-between text-lg font-black">
              <span>Total</span>
              <span className="gradient-text">${total.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
