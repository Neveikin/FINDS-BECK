import { apiClient } from './apiClient';
import { Order } from '../types';

export interface CreateOrderRequest {
  shippingAddress: string;
  paymentMethod: string;
}

export const orderApi = {
  getUserOrders: (userId: string) =>
    apiClient.get<Order[]>(`/order/get/${userId}`),

  createOrder: (data: CreateOrderRequest) =>
    apiClient.post<Order>('/order/create', data),

  cancelOrder: (orderId: string) =>
    apiClient.patch(`/order/setCanseled/${orderId}`),
};