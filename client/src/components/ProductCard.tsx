import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../types/product';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';

interface ProductCardProps {
  product: Product;
}

const DEBOUNCE_MS = 600;

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { _id, title, price, category, images, rating, stock } = product;
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { debounce, cancel, isPending } = useDebounce();

  // ── Server-confirmed quantity (source of truth from context) ──────────────
  const serverQty = cart?.items.find((item) => item.product?._id === _id)?.quantity ?? 0;

  // ── Optimistic local quantity shown instantly in the UI ───────────────────
  const [optimisticQty, setOptimisticQty] = useState(serverQty);

  // ── True only while the actual API request is in-flight ───────────────────
  const [isSyncing, setIsSyncing] = useState(false);

  // ── Inline error shown briefly on failure ─────────────────────────────────
  const [flashError, setFlashError] = useState<string | null>(null);

  // Track the qty at the START of each debounce session for rollback
  const sessionStartRef = useRef(serverQty);
  // Track the LATEST desired qty so the debounced callback always uses it
  const targetQtyRef = useRef(serverQty);

  // Keep optimistic qty in sync with server when no interaction is in-flight
  useEffect(() => {
    if (!isPending() && !isSyncing) {
      setOptimisticQty(serverQty);
    }
  }, [serverQty, isSyncing, isPending]);

  // Cleanup debounce on unmount so we don't fire after navigation
  useEffect(() => () => cancel(), [cancel]);

  // ── Core commit: fires once the user stops tapping ────────────────────────
  const commit = useCallback(async () => {
    const finalQty = targetQtyRef.current;
    const rollbackQty = sessionStartRef.current;

    setIsSyncing(true);
    setFlashError(null);

    let success: boolean;
    try {
      if (finalQty === 0) {
        success = await removeFromCart(_id);
      } else if (rollbackQty === 0) {
        // Was not in cart → use addToCart with exact quantity
        success = await addToCart(_id, finalQty);
      } else {
        success = await updateQuantity(_id, finalQty);
      }
    } catch {
      success = false;
    }

    setIsSyncing(false);

    if (!success) {
      // Revert to the server-confirmed value before this session started
      setOptimisticQty(rollbackQty);
      setFlashError('Could not update cart — please try again.');
      setTimeout(() => setFlashError(null), 3000);
    }
  }, [_id, addToCart, updateQuantity, removeFromCart]);

  // ── Single handler for both + and − ──────────────────────────────────────
  const handleChange = useCallback(
    (delta: number) => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      const next = Math.max(0, optimisticQty + delta);

      // Capture session start only when beginning a new debounce session
      if (!isPending()) {
        sessionStartRef.current = serverQty;
      }

      targetQtyRef.current = next;
      setOptimisticQty(next);

      debounce(commit, DEBOUNCE_MS);
    },
    [isAuthenticated, navigate, optimisticQty, isPending, serverQty, debounce, commit],
  );

  const imageUrl =
    images && images.length > 0
      ? images[0]
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';

  // ── Derived display state ─────────────────────────────────────────────────
  // Show qty-control as soon as optimisticQty > 0 so the UI responds instantly
  const showQtyControl = optimisticQty > 0;

  return (
    <div className="glass-card flex flex-col h-full rounded-2xl overflow-hidden">
      {/* Image Showcase */}
      <div className="relative h-[220px] overflow-hidden bg-black/20">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <span className="absolute top-3 left-3 bg-brand-dark border border-white/8 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
          {category}
        </span>
      </div>

      {/* Info Body */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold mb-1 leading-snug line-clamp-1 hover:text-indigo-400 transition-colors">
          <Link to={`/products/${_id}`}>{title}</Link>
        </h3>

        <div className="flex items-center gap-1 text-sm text-amber-400">
          ★ <span className="text-xs text-slate-400 font-medium">({rating.toFixed(1)})</span>
        </div>

        {/* Inline error — slides in when something goes wrong */}
        <div className={`qty-error${flashError ? ' qty-error--visible' : ''}`}>
          {flashError}
        </div>

        <div className="mt-auto flex justify-between items-center gap-2">
          <span className="text-xl font-bold text-slate-100">${price.toFixed(2)}</span>

          <div className="flex gap-2 items-center">
            <Link to={`/products/${_id}`} className="btn-secondary px-3.5 py-2 text-xs">
              Details
            </Link>

            {/* ── Out of Stock ── */}
            {stock === 0 ? (
              <button
                disabled
                className="btn-primary px-3.5 py-2 text-xs opacity-50 cursor-not-allowed"
              >
                Out of Stock
              </button>

            /* ── Quantity Control (optimistic) ── */
            ) : showQtyControl ? (
              <div className={`qty-control${isSyncing ? ' qty-control--syncing' : ''}`}>
                <button
                  onClick={() => handleChange(-1)}
                  disabled={isSyncing}
                  className="qty-btn qty-btn-minus"
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span className="qty-value" aria-live="polite" aria-atomic="true">
                  {isSyncing
                    ? <span className="qty-spinner" aria-hidden="true" />
                    : optimisticQty}
                </span>

                <button
                  onClick={() => handleChange(1)}
                  disabled={isSyncing}
                  className="qty-btn qty-btn-plus"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

            /* ── Add to Cart ── */
            ) : (
              <button
                onClick={() => handleChange(1)}
                disabled={isSyncing}
                className="btn-primary px-3.5 py-2 text-xs disabled:opacity-50 cursor-pointer"
              >
                {isSyncing ? 'Adding…' : 'Add to Cart'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
