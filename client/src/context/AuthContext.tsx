import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserData } from '../services/authService';
import authService from '../services/authService';

export interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      const localUser = authService.getCurrentUser();
      if (localUser) {
        setUser(localUser);
        try {
          const result = await authService.getProfile();
          if (result.success && result.data) {
            const updatedUser = {
              ...localUser,
              name: result.data.name,
              email: result.data.email,
              role: result.data.role,
            };
            setUser(updatedUser);
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
          }
        } catch (err) {
          console.warn('Could not sync user profile on session restore', err);
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      if (result.success && result.data) {
        setUser(result.data);
        return true;
      } else {
        setError(result.message || 'Login failed');
        return false;
      }
    } catch (err: any) {
      setError('Login request failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      const result = await authService.register(name, email, password);
      if (result.success && result.data) {
        setUser(result.data);
        return true;
      } else {
        setError(result.message || 'Registration failed');
        return false;
      }
    } catch (err: any) {
      setError('Registration request failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
