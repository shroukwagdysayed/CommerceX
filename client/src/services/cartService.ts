import apiClient from '../api/client';
import type { CartResponse } from '../types/cart';

export const cartService = {
  getCart: async (): Promise<CartResponse> => {
    try {
      const response = await apiClient.get<CartResponse>('/cart');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch cart',
      };
    }
  },

  addToCart: async (productId: string, quantity: number = 1): Promise<CartResponse> => {
    try {
      const response = await apiClient.post<CartResponse>('/cart/add', { productId, quantity });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add item to cart',
      };
    }
  },

  updateCartItemQuantity: async (productId: string, quantity: number): Promise<CartResponse> => {
    try {
      const response = await apiClient.put<CartResponse>(`/cart/${productId}`, { quantity });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update item quantity',
      };
    }
  },

  removeCartItem: async (productId: string): Promise<CartResponse> => {
    try {
      const response = await apiClient.delete<CartResponse>(`/cart/${productId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove item from cart',
      };
    }
  },

  clearCart: async (): Promise<CartResponse> => {
    try {
      const response = await apiClient.delete<CartResponse>('/cart');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to clear cart',
      };
    }
  },
};

export default cartService;
