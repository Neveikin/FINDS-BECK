import { apiClient } from './apiClient';
import { Product } from '../types';

export interface ProductResponse extends Product {
  shopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'popular';
  search?: string;
}

export const productApi = {
  // Получить все товары с фильтрацией
  getAllProducts: (filters?: ProductFilters) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.brand) params.append('brand', filters.brand);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const url = queryString ? `/product/get?${queryString}` : '/product/get';
    
    return apiClient.get<Product[]>(url);
  },

  // Получить товар по ID
  getProductById: (id: string) =>
    apiClient.get<ProductResponse>(`/product/get?id=${id}`),

  // Получить товары по категории
  getProductsByCategory: (category: string, filters?: Omit<ProductFilters, 'category'>) =>
    productApi.getAllProducts({ ...filters, category }),

  // Получить популярные товары
  getPopularProducts: (limit?: number) => {
    const url = limit ? `/product/popular?limit=${limit}` : '/product/popular';
    return apiClient.get<Product[]>(url);
  },

  
  // Поиск товаров
  searchProducts: (query: string, filters?: Omit<ProductFilters, 'search'>) =>
    productApi.getAllProducts({ ...filters, search: query }),

  // Создать товар (для админа/владельца магазина)
  createProduct: (shopId: string, product: Omit<Product, 'id' | 'shopId' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<ProductResponse>(`/product/add/${shopId}`, product),

  // Обновить товар (для админа/владельца магазина)
  updateProduct: (productId: string, product: Partial<Product>) =>
    apiClient.patch(`/product/edit/${productId}`, product),

  // Удалить товар (для админа/владельца магазина)
  deleteProduct: (productId: string) =>
    apiClient.delete(`/product/delete/${productId}`),
};
