import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartLine, cartLineKey } from '../../shared/types';
import { cartApi, cartLineRequestFromLine } from '../../shared/api/cart';
import { useSimpleAuth } from './SimpleAuthProvider';

function normalizeProduct(p: any): Product {
  const priceRaw = p?.price;
  const price =
    typeof priceRaw === 'number' ? priceRaw : parseFloat(String(priceRaw ?? '0')) || 0;
  const shop = p?.shop;
  const brandName =
    typeof p?.brand === 'string'
      ? p.brand
      : shop?.name != null
        ? String(shop.name)
        : '';
  return {
    id: String(p?.id ?? ''),
    name: String(p?.name ?? ''),
    brand: brandName,
    brandId: p?.brandId ?? shop?.id,
    price,
    image: String(p?.image ?? p?.imageUrl ?? ''),
    description: String(p?.description ?? ''),
    category: String(p?.category ?? p?.categoryId ?? ''),
    shopId: p?.shopId ?? shop?.id,
    createdAt: p?.createdAt,
    updatedAt: p?.updatedAt,
  };
}

function mapDtoToLine(raw: any): CartLine | null {
  if (!raw?.product?.id) return null;
  return {
    product: normalizeProduct(raw.product),
    quantity: Math.max(1, Number(raw.quantity) || 1),
    size: String(raw.sizeCode ?? raw.size ?? ''),
    color: String(raw.color ?? ''),
  };
}

interface CartContextType {
  cart: CartLine[];
  addToCart: (product: Product, variant: { size: string; color: string }) => Promise<void>;
  increaseQuantity: (line: CartLine) => Promise<void>;
  decreaseQuantity: (line: CartLine) => Promise<void>;
  removeFromCart: (line: CartLine) => Promise<void>;
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
  const [cart, setCart] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        loadCart();
      } else {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            const parsed = JSON.parse(savedCart);
            if (Array.isArray(parsed)) {
              if (parsed.length === 0) {
                setCart([]);
              } else if (parsed[0] && typeof parsed[0] === 'object' && 'product' in parsed[0]) {
                setCart(
                  (parsed as CartLine[]).filter(
                    (l) => l?.product?.id && typeof l.quantity === 'number' && l.quantity > 0
                  )
                );
              } else {
                const legacy = parsed as Product[];
                setCart(
                  legacy.map((p) => ({
                    product: p,
                    quantity: 1,
                    size: '',
                    color: '',
                  }))
                );
              }
            }
          } catch {
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
      const list = Array.isArray(response) ? response : [];
      const lines = list
        .map(mapDtoToLine)
        .filter((l): l is CartLine => l != null);
      setCart(lines);
    } catch (error) {
      if (
        error instanceof Error &&
        !error.message.includes('401') &&
        !error.message.includes('Пользователь не авторизован')
      ) {
        console.error('Failed to load cart:', error);
      }
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const mergeGuestLine = (
    lines: CartLine[],
    product: Product,
    size: string,
    color: string,
    delta: number
  ): CartLine[] => {
    const s = size?.trim() ?? '';
    const c = color?.trim() ?? '';
    const idx = lines.findIndex(
      (l) => l.product.id === product.id && l.size === s && l.color === c
    );
    if (idx >= 0) {
      const next = [...lines];
      const q = next[idx].quantity + delta;
      if (q <= 0) next.splice(idx, 1);
      else next[idx] = { ...next[idx], quantity: q };
      return next;
    }
    if (delta > 0) {
      return [...lines, { product, quantity: delta, size: s, color: c }];
    }
    return lines;
  };

  const addToCart = async (product: Product, variant: { size: string; color: string }) => {
    const size = variant.size?.trim() ?? '';
    const color = variant.color?.trim() ?? '';
    console.log('CartProvider - Adding to cart:', product.id, size, color, 'auth:', isAuthenticated);
    if (isAuthenticated) {
      try {
        await cartApi.addItem({ productId: product.id, size, color });
        await loadCart();
      } catch (error) {
        console.error('Failed to add to cart:', error);
        throw error;
      }
    } else {
      setCart((prev) => {
        const next = mergeGuestLine(prev, product, size, color, 1);
        localStorage.setItem('cart', JSON.stringify(next));
        return next;
      });
    }
  };

  const increaseQuantity = async (line: CartLine) => {
    if (isAuthenticated) {
      try {
        await cartApi.addItem(cartLineRequestFromLine(line));
        await loadCart();
      } catch (error) {
        console.error('Failed to increase quantity:', error);
        throw error;
      }
    } else {
      setCart((prev) => {
        const next = mergeGuestLine(prev, line.product, line.size, line.color, 1);
        localStorage.setItem('cart', JSON.stringify(next));
        return next;
      });
    }
  };

  const decreaseQuantity = async (line: CartLine) => {
    if (isAuthenticated) {
      try {
        await cartApi.decreaseItem(cartLineRequestFromLine(line));
        await loadCart();
      } catch (error) {
        console.error('Failed to decrease quantity:', error);
        throw error;
      }
    } else {
      setCart((prev) => {
        const next = mergeGuestLine(prev, line.product, line.size, line.color, -1);
        localStorage.setItem('cart', JSON.stringify(next));
        return next;
      });
    }
  };

  const removeFromCart = async (line: CartLine) => {
    if (isAuthenticated) {
      try {
        await cartApi.removeItem(cartLineRequestFromLine(line));
        await loadCart();
      } catch (error) {
        console.error('Failed to remove from cart:', error);
      }
    } else {
      setCart((prev) => {
        const next = prev.filter((l) => cartLineKey(l) !== cartLineKey(line));
        localStorage.setItem('cart', JSON.stringify(next));
        return next;
      });
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        const snapshot = [...cart];
        for (const line of snapshot) {
          await cartApi.removeItem(cartLineRequestFromLine(line));
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

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const cartTotal = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
