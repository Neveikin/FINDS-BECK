import { apiClient } from './apiClient';

export interface Shop {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  createdAt: string;
}

export interface ShopResponse extends Shop {
  owners?: any[];
  products?: any[];
}

export const shopApi = {
  // Получить все магазины
  getAllShops: () =>
    apiClient.get<Shop[]>('/api/shops'),

  // Получить магазин по ID
  getShopById: (id: string) =>
    apiClient.get<ShopResponse>(`/api/shops/${id}`),

  // Создать магазин (для админа)
  createShop: (shop: Omit<Shop, 'id' | 'createdAt'>) =>
    apiClient.post<ShopResponse>('/api/shops/add', shop),

  // Обновить магазин (для админа)
  updateShop: (id: string, shop: Partial<Shop>) =>
    apiClient.put(`/api/shops/update/${id}`, shop),

  // Удалить магазин (для админа)
  deleteShop: (id: string) =>
    apiClient.delete(`/api/shops/delete/${id}`),
};
