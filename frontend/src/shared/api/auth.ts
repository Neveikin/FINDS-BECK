import { apiClient } from './apiClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
  recaptchaToken: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
  };
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ResendCodeRequest {
  email: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/api/auth/signin', data),

  register: (data: RegisterRequest) =>
    apiClient.post<void>('/api/auth/signup', data),

  logout: () =>
    apiClient.post('/api/auth/logout'),

  refresh: () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    return apiClient.post<AuthResponse>('/api/auth/refresh', {}, {
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    });
  },

  verifyEmail: (data: VerifyEmailRequest) =>
    apiClient.post<string>('/api/auth/confirm-email', data),

  resendVerificationCode: (data: ResendCodeRequest) =>
    apiClient.post<string>(`/api/auth/email-confirm/${data.email}`),
};