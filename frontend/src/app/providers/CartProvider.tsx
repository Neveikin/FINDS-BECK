import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../../shared/types';
import { cartApi } from '../../shared/api/cart';
import { useSimpleAuth } from './SimpleAuthProvider';

interface CartContextType {
  cart: Product[];
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useSimpleAuth();
  const [cart, setCart] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        loadCart();
      } else {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      }
    }
  }, [isAuthenticated, authLoading]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await cartApi.getCart();
      if (response && response.items && Array.isArray(response.items)) {
        setCart(response.items.map(item => item.product));
      } else {
        setCart([]);
      }
    } catch (error) {
      // Don't log 401 errors as they're expected when user is not authenticated
      if (error instanceof Error && !error.message.includes('401') && !error.message.includes('Пользователь не авторизован')) {
        console.error('Failed to load cart:', error);
      }
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product) => {
    console.log('CartProvider - Adding to cart:', product.id, 'Authenticated:', isAuthenticated);
    if (isAuthenticated) {
      try {
        console.log('CartProvider - Calling API to add item:', product.id);
        await cartApi.addItem(product.id);
        console.log('CartProvider - API call successful, reloading cart');
        await loadCart();
      } catch (error) {
        console.error('Failed to add to cart:', error);
        throw error;
      }
    } else {
      console.log('CartProvider - Adding to localStorage cart');
      const newCart = [...cart, product];
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const removeFromCart = async (productId: string) => {
    if (isAuthenticated) {
      try {
        await cartApi.removeItem(productId);
        await loadCart();
      } catch (error) {
        console.error('Failed to remove from cart:', error);
      }
    } else {
      const newCart = cart.filter(item => item.id !== productId);
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        for (const item of cart) {
          await cartApi.removeItem(item.id);
        }
        await loadCart();
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    } else {
      setCart([]);
      localStorage.removeItem('cart');
    }
  };

  const cartCount = cart.length;
  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      cartCount,
      cartTotal,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
};