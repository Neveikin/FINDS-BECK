import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order } from '../../shared/types';
import { orderApi } from '../../shared/api/order';
import { useSimpleAuth } from './SimpleAuthProvider';

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date'>) => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  loading: boolean;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useSimpleAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      loadOrders();
    } else if (!authLoading && !isAuthenticated) {
      const savedOrders = localStorage.getItem('orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    }
  }, [isAuthenticated, authLoading, user]);

  const loadOrders = async () => {
    if (!user || !user.id) {
      console.log('OrdersProvider - No user or user.id found');
      return;
    }
    try {
      setLoading(true);
      console.log('OrdersProvider - Loading orders for user:', user.id);
      const response = await orderApi.getUserOrders(user.id);
      setOrders(Array.isArray(response) ? response : []);
    } catch (error) {
      // Don't log 401 errors as they're expected when user is not authenticated
      if (error instanceof Error && !error.message.includes('401') && !error.message.includes('Пользователь не авторизован')) {
        console.error('Failed to load orders:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'date'>) => {
    if (isAuthenticated && user) {
      try {
        await orderApi.createOrder({
          orderItems: orderData.items.map(item => ({
            productId: item.product.id.trim(),
            quantity: item.quantity
          })),
          adress: orderData.address,
          userEmail: user.email
        });
        await loadOrders();
      } catch (error) {
        console.error('Failed to create order:', error);
        throw error;
      }
    } else {
      const newOrder: Order = {
        ...orderData,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      };
      const newOrders = [newOrder, ...orders];
      setOrders(newOrders);
      localStorage.setItem('orders', JSON.stringify(newOrders));
    }
  };

  const getOrderById = (id: string) => {
    return orders.find(order => order.id === id);
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder, getOrderById, loading }}>
      {children}
    </OrdersContext.Provider>
  );
};