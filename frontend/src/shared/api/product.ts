import { apiClient } from './apiClient';
import { Product } from '../types';

export interface ProductResponse extends Product {
  shopId: string;
  createdAt: string;
  updatedAt: string;
}

export const productApi = {
  getProduct: (id: string) =>
    apiClient.get<ProductResponse>(`/product/get?id=${id}`),

  addProduct: (shopId: string, product: Omit<Product, 'id' | 'category'>) =>
    apiClient.post<ProductResponse>(`/product/add/${shopId}`, product),

  updateProduct: (productId: string, product: Partial<Product>) =>
    apiClient.patch(`/product/edit/${productId}`, product),
};