import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../../shared/api/apiClient';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
  city?: string;
  street?: string;
  house?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string, recaptchaToken: string) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useSimpleAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};

export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      console.log('SimpleAuthProvider - Loading user on startup...');
      const token = apiClient.getToken();
      console.log('SimpleAuthProvider - Token found:', !!token);
      
      if (token) {
        try {
          console.log('SimpleAuthProvider - Attempting to load user profile...');
          const profile = await apiClient.get<User>('/api/auth/simple-me');
          console.log('SimpleAuthProvider - Profile loaded successfully:', profile);
          setUser(profile);
        } catch (error) {
          console.error('SimpleAuthProvider - Failed to load user profile:', error);
          console.log('SimpleAuthProvider - Attempting to refresh token...');
          
          // Try to refresh token
          try {
            const refreshResponse = await apiClient.post<{token: string, refreshToken: string, user: User}>('/api/auth/simple-refresh', {}, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            console.log('SimpleAuthProvider - Token refreshed successfully:', refreshResponse);
            apiClient.setToken(refreshResponse.token);
            setUser(refreshResponse.user);
          } catch (refreshError) {
            console.error('SimpleAuthProvider - Failed to refresh token:', refreshError);
            console.log('SimpleAuthProvider - Clearing invalid tokens...');
            // Clear invalid tokens
            apiClient.clearToken();
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
          }
        }
      } else {
        console.log('SimpleAuthProvider - No token found, user not authenticated');
        setUser(null);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.post<{token: string, refreshToken: string, user: User}>('/api/auth/signin', { email, password });
      console.log('SimpleAuthProvider - Login response:', response);
      apiClient.setToken(response.token);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      setUser(response.user);
      return true;
    } catch (error) {
      console.error('SimpleAuthProvider - Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/api/auth/simple-logout');
    } catch (error) {
      console.error('SimpleAuthProvider - Logout error:', error);
    } finally {
      apiClient.clearToken();
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword: string, recaptchaToken: string): Promise<boolean> => {
    try {
      console.log('SimpleAuthProvider - Starting registration for:', email);

      // Call the original auth signup endpoint
      await apiClient.post('/api/auth/signup', { name, email, password, confirmPassword, recaptchaToken });
      console.log('SimpleAuthProvider - Signup successful');

      // After successful registration, send confirmation code
      await apiClient.post(`/api/auth/email-confirm/${email}`);
      console.log('SimpleAuthProvider - Confirmation code sent');

      return true;
    } catch (error) {
      console.error('SimpleAuthProvider - Registration failed:', error);
      return false;
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Загрузка...</div>;
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      login,
      logout,
      register,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
