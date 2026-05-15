import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../../shared/types';
import { cartApi } from '../../shared/api/cart';
import { useSimpleAuth } from './SimpleAuthProvider';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size?: string, color?: string) => Promise<void>;
  removeFromCart: (productId: string, size?: string, color?: string) => Promise<void>;
  updateQuantity: (productId: string, delta: number, size?: string, color?: string) => Promise<void>;
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        loadCart();
      } else {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            // Migrate old cart data if necessary (if it's an array of products instead of cart items)
            const migratedCart = Array.isArray(parsedCart) ? parsedCart.map(item => {
              if (item && !item.product && item.price !== undefined) {
                // This is old product data, wrap it in CartItem
                return {
                  id: `${item.id}--`,
                  product: item,
                  quantity: 1
                };
              }
              return item;
            }).filter(item => item && item.product) : [];
            
            setCart(migratedCart);
            if (JSON.stringify(migratedCart) !== savedCart) {
              localStorage.setItem('cart', JSON.stringify(migratedCart));
            }
          } catch (e) {
            console.error('Failed to parse cart from localStorage:', e);
            setCart([]);
          }
        }
      }
    }
  }, [isAuthenticated, authLoading]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await cartApi.getCart();
      let itemsArray: any[] = [];
      if (Array.isArray(response)) {
        itemsArray = response;
      } else if (response && response.items && Array.isArray(response.items)) {
        itemsArray = response.items;
      }

      if (itemsArray.length > 0) {
        setCart(itemsArray.map((item: any) => ({
          id: `${item.product?.id}-${item.size || ''}-${item.color || ''}`,
          product: item.product,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })));
      } else {
        setCart([]);
      }
    } catch (error) {
      if (error instanceof Error && !error.message.includes('401') && !error.message.includes('Пользователь не авторизован')) {
        console.error('Failed to load cart:', error);
      }
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, size?: string, color?: string) => {
    console.log('CartProvider - Adding to cart:', product.id, 'Size:', size, 'Color:', color);
    if (isAuthenticated) {
      try {
        await cartApi.addItem(product.id, size, color);
        await loadCart();
      } catch (error) {
        console.error('Failed to add to cart:', error);
        throw error;
      }
    } else {
      const itemId = `${product.id}-${size || ''}-${color || ''}`;
      const existingItemIndex = cart.findIndex(item => item.id === itemId);
      
      let newCart;
      if (existingItemIndex > -1) {
        newCart = [...cart];
        newCart[existingItemIndex].quantity += 1;
      } else {
        newCart = [...cart, {
          id: itemId,
          product,
          quantity: 1,
          size,
          color
        }];
      }
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const updateQuantity = async (productId: string, delta: number, size?: string, color?: string) => {
    if (isAuthenticated) {
      try {
        if (delta > 0) {
          await cartApi.addItem(productId, size, color);
        } else {
          await cartApi.decreaseItem(productId, size, color);
        }
        await loadCart();
      } catch (error) {
        console.error('Failed to update quantity:', error);
      }
    } else {
      const itemId = `${productId}-${size || ''}-${color || ''}`;
      const newCart = cart.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter((item): item is CartItem => item !== null);
      
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const removeFromCart = async (productId: string, size?: string, color?: string) => {
    if (isAuthenticated) {
      try {
        await cartApi.removeItem(productId, size, color);
        await loadCart();
      } catch (error) {
        console.error('Failed to remove from cart:', error);
      }
    } else {
      const itemId = `${productId}-${size || ''}-${color || ''}`;
      const newCart = cart.filter(item => item.id !== itemId);
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        for (const item of cart) {
          await cartApi.removeItem(item.product.id, item.size, item.color);
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

  const cartCount = cart.reduce((sum, item) => sum + (item?.quantity || 0), 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item?.product?.price || 0) * (item?.quantity || 0), 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
};