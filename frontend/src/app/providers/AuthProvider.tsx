import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../../shared/api/auth';
import { userApi } from '../../shared/api/user';
import { apiClient } from '../../shared/api/apiClient';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      console.log('AuthProvider - Loading user on startup...');
      const token = apiClient.getToken();
      console.log('AuthProvider - Token found:', !!token);
      
      if (token) {
        try {
          console.log('AuthProvider - Attempting to load user profile...');
          const profile = await userApi.getProfile();
          console.log('AuthProvider - Profile loaded successfully:', profile);
          setUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            roles: profile.roles,
            avatar: '/images/default-avatar.jpg'
          });
        } catch (error) {
          console.error('AuthProvider - Failed to load user profile:', error);
          console.log('AuthProvider - Attempting to refresh token...');
          
          // Try to refresh the token
          try {
            const refreshResponse = await authApi.refresh();
            console.log('AuthProvider - Token refreshed successfully:', refreshResponse);
            apiClient.setToken(refreshResponse.token);
            setUser({
              id: refreshResponse.user.id,
              name: refreshResponse.user.name,
              email: refreshResponse.user.email,
              roles: refreshResponse.user.roles,
              avatar: '/images/default-avatar.jpg'
            });
          } catch (refreshError) {
            console.error('AuthProvider - Failed to refresh token:', refreshError);
            console.log('AuthProvider - Clearing invalid tokens...');
            // Clear invalid tokens
            apiClient.clearToken();
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
          }
        }
      } else {
        console.log('AuthProvider - No token found, user not authenticated');
        setUser(null);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login({ email, password });
      console.log('Login response:', response);
      apiClient.setToken(response.token);
      // Save refresh token if available
      if (response.refreshToken) {
        apiClient.setRefreshToken(response.refreshToken);
      }
      setUser({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        roles: response.user.roles,
        avatar: '/images/default-avatar.jpg'
      });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiClient.clearToken();
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword: string): Promise<boolean> => {
    try {
      await authApi.register({ name, email, password, confirmPassword });
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
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
      register
    }}>
      {children}
    </AuthContext.Provider>
  );
};