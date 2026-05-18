import { apiClient } from './apiClient';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  roles: string[];
  createdAt: string;
}

export const userApi = {
  getProfile: () =>
    apiClient.get<UserProfile>('/api/lk/me'),

  updateName: (newName: string) =>
    apiClient.patch('/api/lk/me/name', { newName }),

  updateEmail: (newEmail: string) =>
    apiClient.patch('/api/lk/me/email', { newEmail }),

  updatePassword: (currentPassword: string, newPassword: string) =>
    apiClient.patch('/api/lk/me/password', { currentPassword, newPassword }),
};