import { apiClient } from './apiClient';
import { Product, CartLine } from '../types';

export interface CartLineRequest {
  productId: string;
  size: string;
  color: string;
}

export interface CartItemDto {
  product: Product;
  quantity: number;
  sizeCode?: string;
  color?: string;
}

export const cartApi = {
  getCart: () =>
    apiClient.get<CartItemDto[]>('/cart/get'),

  addItem: (body: CartLineRequest) =>
    apiClient.patch('/cart/add', body),

  decreaseItem: (body: CartLineRequest) =>
    apiClient.patch('/cart/decrease', body),

  removeItem: (body: CartLineRequest) =>
    apiClient.post('/cart/remove', body),
};

export const cartLineRequestFromLine = (line: CartLine): CartLineRequest => ({
  productId: line.product.id,
  size: line.size,
  color: line.color,
});