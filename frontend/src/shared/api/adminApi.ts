import { apiClient } from './apiClient';
import { Product } from '../types';

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}

export const adminApi = {
  // Получить все товары бренда (для brand_admin - только свои, для admin - все)
  getProducts: () =>
    apiClient.get<Product[]>('/product/get'),

  // Получить товар по ID
  getProductById: (id: string) =>
    apiClient.get<Product>(`/product/get?id=${id}`),

  // Добавить товар
  addProduct: (shopId: string, data: CreateProductRequest) =>
    apiClient.post<Product>(`/product/add/${shopId}`, data),

  // Редактировать товар
  updateProduct: (productId: string, data: UpdateProductRequest) =>
    apiClient.patch(`/product/edit/${productId}`, data),

  // Удалить товар (через редактирование статуса или отдельный эндпоинт)
  deleteProduct: (productId: string) =>
    apiClient.delete(`/product/delete/${productId}`),

  // Получить товары по магазину
  getProductsByShop: (shopId: string) =>
    apiClient.get<Product[]>(`/product/get?shopId=${shopId}`),

  // Магазины
  getShops: () =>
    apiClient.get<any[]>('/api/shops'),

  addShop: (data: any) =>
    apiClient.post('/api/shops/add', data),

  updateShop: (shopId: string, data: any) =>
    apiClient.put(`/api/shops/update/${shopId}`, data),

  addShopOwner: (shopId: string, email: string) =>
    apiClient.post(`/api/shops/${shopId}/add-owner`, { email }),

  // Пользователи
  getUsers: () =>
    apiClient.get<any[]>('/api/lk/me/admin/users'),

  searchUsers: (email: string) =>
    apiClient.get<any>(`/api/lk/me/admin/users/search?email=${email}`),

  updateUserRole: (userId: string, role: string) =>
    apiClient.patch(`/api/lk/me/admin/users/${userId}/role`, { role }),
};