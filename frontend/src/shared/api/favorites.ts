import { apiClient } from './apiClient';
import { Product } from '../types';

export const favoritesApi = {
  getFavorites: () =>
    apiClient.get<Product[]>('/favorites/get'),

  addProduct: (productId: string) =>
    apiClient.post(`/favorites/add/product/${productId}`),

  removeProduct: (favoriteId: string) =>
    apiClient.delete(`/favorites/product/${favoriteId}`),
};