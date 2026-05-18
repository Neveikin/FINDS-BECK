import { apiClient } from './apiClient';
import { Brand, Product } from '../types';

export interface BrandResponse extends Brand {
  createdAt: string;
  updatedAt: string;
}

export const brandApi = {
  // Получить все бренды
  getAllBrands: () =>
    apiClient.get<Brand[]>('/brands/get'),

  // Получить бренд по ID
  getBrandById: (id: string) =>
    apiClient.get<BrandResponse>(`/brands/get?id=${id}`),

  // Получить товары бренда
  getBrandProducts: (brandId: string) =>
    apiClient.get<Product[]>(`/brands/${brandId}/products`),

  // Создать бренд (для админа)
  createBrand: (brand: Omit<Brand, 'id' | 'products'>) =>
    apiClient.post<BrandResponse>('/brands/create', brand),

  // Обновить бренд (для админа)
  updateBrand: (id: string, brand: Partial<Brand>) =>
    apiClient.patch(`/brands/edit/${id}`, brand),

  // Удалить бренд (для админа)
  deleteBrand: (id: string) =>
    apiClient.delete(`/brands/delete/${id}`),
};
