import apiClient from '../api/client';
import type { ShippingAddress, OrderResponse, OrderListResponse } from '../types/order';

export const orderService = {
  createOrder: async (shippingAddress: ShippingAddress): Promise<OrderResponse> => {
    try {
      const response = await apiClient.post<OrderResponse>('/orders', { shippingAddress });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to place order',
      };
    }
  },

  getMyOrders: async (): Promise<OrderListResponse> => {
    try {
      const response = await apiClient.get<OrderListResponse>('/orders/my-orders');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        count: 0,
        message: error.response?.data?.message || 'Failed to fetch your orders',
      };
    }
  },

  getOrderById: async (id: string): Promise<OrderResponse> => {
    try {
      const response = await apiClient.get<OrderResponse>(`/orders/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch order details',
      };
    }
  },
};

export default orderService;
