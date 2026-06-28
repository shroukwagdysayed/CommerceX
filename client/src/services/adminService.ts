import apiClient from '../api/client';
import type { Product } from '../types/product';
import type { Order } from '../types/order';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductsResponse {
  success: boolean;
  count: number;
  data?: Product[];
  message?: string;
}

export interface AdminProductResponse {
  success: boolean;
  data?: Product;
  message?: string;
}

export interface AdminOrdersResponse {
  success: boolean;
  count: number;
  data?: (Order & { user?: { name: string; email: string } })[];
  message?: string;
}

export interface AdminOrderResponse {
  success: boolean;
  data?: Order;
  message?: string;
}

export interface AdminUsersResponse {
  success: boolean;
  count: number;
  data?: AdminUser[];
  message?: string;
}

export interface AdminUserResponse {
  success: boolean;
  data?: Omit<AdminUser, 'createdAt' | 'updatedAt'>;
  message?: string;
}

export const adminService = {
  // Products
  getProducts: async (): Promise<AdminProductsResponse> => {
    try {
      const response = await apiClient.get<AdminProductsResponse>('/admin/products');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        count: 0,
        message: error.response?.data?.message || 'Failed to fetch admin products',
      };
    }
  },

  createProduct: async (productData: Omit<Product, '_id' | 'rating'>): Promise<AdminProductResponse> => {
    try {
      const response = await apiClient.post<AdminProductResponse>('/admin/products', productData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create product',
      };
    }
  },

  updateProduct: async (id: string, productData: Partial<Product>): Promise<AdminProductResponse> => {
    try {
      const response = await apiClient.put<AdminProductResponse>(`/admin/products/${id}`, productData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update product',
      };
    }
  },

  deleteProduct: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiClient.delete<{ success: boolean; message?: string }>(`/admin/products/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete product',
      };
    }
  },

  // Orders
  getOrders: async (): Promise<AdminOrdersResponse> => {
    try {
      const response = await apiClient.get<AdminOrdersResponse>('/admin/orders');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        count: 0,
        message: error.response?.data?.message || 'Failed to fetch admin orders',
      };
    }
  },

  updateOrderStatus: async (id: string, status: string): Promise<AdminOrderResponse> => {
    try {
      const response = await apiClient.put<AdminOrderResponse>(`/admin/orders/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update order status',
      };
    }
  },

  // Users
  getUsers: async (): Promise<AdminUsersResponse> => {
    try {
      const response = await apiClient.get<AdminUsersResponse>('/admin/users');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        count: 0,
        message: error.response?.data?.message || 'Failed to fetch users list',
      };
    }
  },

  updateUserRole: async (id: string, role: 'user' | 'admin'): Promise<AdminUserResponse> => {
    try {
      const response = await apiClient.put<AdminUserResponse>(`/admin/users/${id}/role`, { role });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update user role',
      };
    }
  },
};

export default adminService;
