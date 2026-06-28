import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Cart } from '../types/cart';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

export interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = async (): Promise<void> => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await cartService.getCart();
      if (result.success && result.data) {
        setCart(result.data);
      } else {
        setError(result.message || 'Failed to load cart');
      }
    } catch (err: any) {
      setError('An unexpected error occurred while loading cart');
    } finally {
      setLoading(false);
    }
  };

  // Sync cart with authentication state
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setCart(null);
      setError(null);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addToCart = async (productId: string, quantity: number = 1): Promise<boolean> => {
    if (!isAuthenticated) {
      setError('You must be logged in to add items to the cart');
      return false;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await cartService.addToCart(productId, quantity);
      if (result.success && result.data) {
        setCart(result.data);
        return true;
      } else {
        setError(result.message || 'Failed to add item to cart');
        return false;
      }
    } catch (err) {
      setError('Error adding item to cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number): Promise<boolean> => {
    if (!isAuthenticated) return false;
    setError(null);
    setLoading(true);
    try {
      const result = await cartService.updateCartItemQuantity(productId, quantity);
      if (result.success && result.data) {
        setCart(result.data);
        return true;
      } else {
        setError(result.message || 'Failed to update quantity');
        return false;
      }
    } catch (err) {
      setError('Error updating quantity');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    setError(null);
    setLoading(true);
    try {
      const result = await cartService.removeCartItem(productId);
      if (result.success && result.data) {
        setCart(result.data);
        return true;
      } else {
        setError(result.message || 'Failed to remove item');
        return false;
      }
    } catch (err) {
      setError('Error removing item from cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async (): Promise<boolean> => {
    if (!isAuthenticated) return false;
    setError(null);
    setLoading(true);
    try {
      const result = await cartService.clearCart();
      if (result.success && result.data) {
        setCart(result.data);
        return true;
      } else {
        setError(result.message || 'Failed to clear cart');
        return false;
      }
    } catch (err) {
      setError('Error clearing cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
