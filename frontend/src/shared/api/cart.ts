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

  addItem: (productId: string) =>
    apiClient.patch(`/cart/addItems/${productId}`),

  decreaseItem: (productId: string) =>
    apiClient.patch(`/cart/decrease/${productId}`),

  removeItem: (productId: string) =>
    apiClient.delete(`/cart/delete/${productId}`),
};