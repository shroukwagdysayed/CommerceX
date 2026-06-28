import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Cart: React.FC = () => {
  const { cart, loading, error, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const items = cart?.items || [];

  const handleUpdateQty = async (productId: string, currentQty: number, delta: number) => {
    const nextQty = currentQty + delta;
    if (nextQty < 1) {
      await removeFromCart(productId);
      return;
    }
    await updateQuantity(productId, nextQty);
  };

  const handleRemoveItem = async (productId: string) => {
    await removeFromCart(productId);
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  const subtotal = items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
  const shipping = subtotal > 300 || subtotal === 0 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div>
      <div className="mb-12 flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">Your Cart</h1>
          <p className="text-slate-400">Review your items and complete your purchase.</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClearCart}
            disabled={loading}
            className="text-red-400 text-sm font-bold hover:text-red-300 disabled:opacity-50 transition-colors cursor-pointer border border-red-400/20 px-4 py-2 rounded-xl bg-red-400/5 hover:bg-red-400/10"
          >
            Clear Cart
          </button>
        )}
      </div>

      {error && (
        <div className="glass-card border-red-500/20 p-4 mb-6 text-red-400 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="glass-card p-16 text-center rounded-2xl max-w-lg mx-auto">
          <h2 className="text-xl font-bold mb-3">Your cart is empty</h2>
          <p className="text-slate-400 mb-8">Looks like you haven't added any products to your cart yet.</p>
          <Link to="/products" className="btn-primary px-6 py-3">Start Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
          
          {/* Cart Items List */}
          <div className="flex flex-col gap-6">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null; // Handle potential deleted product references gracefully

              const primaryImage = product.images && product.images.length > 0
                ? product.images[0]
                : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';

              return (
                <div key={product._id} className="glass-card flex flex-col sm:flex-row gap-6 p-6 items-center rounded-2xl">
                  <img 
                    src={primaryImage} 
                    alt={product.title} 
                    className="w-24 h-24 object-cover rounded-xl shadow-md bg-black/10"
                  />
                  <div className="flex-grow text-center sm:text-left">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                      {product.category}
                    </span>
                    <h3 className="text-lg font-bold mb-3 hover:text-indigo-400 transition-colors line-clamp-1">
                      <Link to={`/products/${product._id}`}>{product.title}</Link>
                    </h3>
                    <button 
                      onClick={() => handleRemoveItem(product._id)}
                      disabled={loading}
                      className="text-red-400 text-xs font-bold hover:text-red-300 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="flex items-center border border-white/8 rounded-lg overflow-hidden bg-white/[0.01]">
                    <button 
                      onClick={() => handleUpdateQty(product._id, item.quantity, -1)}
                      disabled={loading}
                      className="px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.08] active:bg-white/[0.02] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3.5 py-1.5 font-bold min-w-[36px] text-center text-sm">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => handleUpdateQty(product._id, item.quantity, 1)}
                      disabled={loading}
                      className="px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.08] active:bg-white/[0.02] disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="text-right min-w-[100px]">
                    <span className="text-xl font-extrabold text-slate-100">
                      ${(product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary */}
          <aside className="glass-card p-8 rounded-2xl w-full lg:sticky lg:top-[90px]">
            <h3 className="text-xl font-extrabold mb-6 pb-3 border-b border-white/8">
              Order Summary
            </h3>
            
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Total Items</span>
                <span className="text-slate-100 font-semibold">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-100 font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400">
                <span>Estimated Shipping</span>
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

            <button 
              onClick={() => navigate('/checkout')}
              disabled={loading || items.length === 0}
              className="btn-primary w-full py-3.5 text-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </aside>

        </div>
      )}
    </div>
  );
};

export default Cart;
