import apiClient from '../api/client';

export interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  token: string;
}

export interface UserAuthResponse {
  success: boolean;
  data?: UserData;
  message?: string;
}

export interface UserProfileResponse {
  success: boolean;
  data?: Omit<UserData, 'token'>;
  message?: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<UserAuthResponse> => {
    try {
      const response = await apiClient.post<UserAuthResponse>('/users/login', { email, password });
      if (response.data.success && response.data.data) {
        localStorage.setItem('userInfo', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  },

  register: async (name: string, email: string, password: string): Promise<UserAuthResponse> => {
    try {
      const response = await apiClient.post<UserAuthResponse>('/users/register', { name, email, password });
      if (response.data.success && response.data.data) {
        localStorage.setItem('userInfo', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  },

  getProfile: async (): Promise<UserProfileResponse> => {
    try {
      const response = await apiClient.get<UserProfileResponse>('/users/profile');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user profile',
      };
    }
  },

  logout: (): void => {
    localStorage.removeItem('userInfo');
  },

  getCurrentUser: (): UserData | null => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return null;
    try {
      return JSON.parse(userInfo) as UserData;
    } catch {
      return null;
    }
  }
};

export default authService;
