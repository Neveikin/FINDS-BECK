import { apiClient } from './apiClient';
import { Product } from '../types';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartResponse {
  id: string;
  items: CartItem[];
  total: number;
}

export const cartApi = {
  getCart: () =>
    apiClient.get<CartResponse>('/cart/get'),

  addItem: (productId: string, size?: string, color?: string) => {
    const params = new URLSearchParams();
    if (size) params.append('size', size);
    if (color) params.append('color', color);
    const queryString = params.toString();
    return apiClient.patch(`/cart/addItems/${productId}${queryString ? `?${queryString}` : ''}`);
  },

  decreaseItem: (productId: string, size?: string, color?: string) => {
    const params = new URLSearchParams();
    if (size) params.append('size', size);
    if (color) params.append('color', color);
    const queryString = params.toString();
    return apiClient.patch(`/cart/decrease/${productId}${queryString ? `?${queryString}` : ''}`);
  },

  removeItem: (productId: string, size?: string, color?: string) => {
    const params = new URLSearchParams();
    if (size) params.append('size', size);
    if (color) params.append('color', color);
    const queryString = params.toString();
    return apiClient.delete(`/cart/delete/${productId}${queryString ? `?${queryString}` : ''}`);
  },
};