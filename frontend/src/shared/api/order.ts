import { apiClient } from './apiClient';
import { Order } from '../types';

export interface OrderItemRequest {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  orderItems: OrderItemRequest[];
  adress: string;
  userEmail: string;
}

export const orderApi = {
  getUserOrders: (userId: string) =>
    apiClient.get<Order[]>(`/order/get/${userId}`),

  createOrder: (data: CreateOrderRequest) =>
    apiClient.post<Order>('/order/create', data),

  cancelOrder: (orderId: string) =>
    apiClient.patch(`/order/cancel/${orderId}`),

  getShopOrders: (email: string) =>
    apiClient.get<Order[]>(`/order/shop-orders/${email}`),

  updateAddress: (orderId: string, address: string) =>
    apiClient.patch(`/order/update-address/${orderId}`, address),

  updateStatus: (orderId: string, status: string) =>
    apiClient.patch(`/order/update-status/${orderId}`, status),
};