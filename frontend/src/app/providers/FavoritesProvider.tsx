import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../../shared/types';
import { favoritesApi } from '../../shared/api/favorites';
import { useSimpleAuth } from './SimpleAuthProvider';

interface FavoritesContextType {
  favorites: Product[];
  addToFavorites: (product: Product) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  isInFavorites: (productId: string) => boolean;
  favoritesCount: number;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useSimpleAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        loadFavorites();
      } else {
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      }
    }
  }, [isAuthenticated, authLoading]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await favoritesApi.getFavorites() as any;
      console.log('FavoritesProvider - Response from backend:', response);
      // Backend returns { Shops: [...], Products: [...] }
      if (response && response.Products && Array.isArray(response.Products)) {
        // Extract products from favorite items and ensure unique keys
        const products = response.Products.map((favorite: any) => ({
          ...favorite.product,
          id: favorite.product.id?.trim() // Ensure no trailing spaces in ID
        }));
        
        // Remove duplicates by ID
        const uniqueProducts = products.filter((product: Product, index: number, self: Product[]) =>
          index === self.findIndex((p: Product) => p.id === product.id)
        );
        
        setFavorites(uniqueProducts);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      // Don't log 401 errors as they're expected when user is not authenticated
      if (error instanceof Error && !error.message.includes('401') && !error.message.includes('Пользователь не авторизован')) {
        console.error('Failed to load favorites:', error);
      }
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (product: Product) => {
    // Check if product is already in favorites
    const cleanProductId = product.id?.trim();
    const currentFavorites = Array.isArray(favorites) ? favorites : [];
    const isAlreadyFavorite = currentFavorites.some(fav => fav.id?.trim() === cleanProductId);
    
    if (isAlreadyFavorite) {
      return; // Don't add if already exists
    }
    
    if (isAuthenticated) {
      try {
        await favoritesApi.addProduct(cleanProductId);
        await loadFavorites();
      } catch (error) {
        console.error('Failed to add to favorites:', error);
      }
    } else {
      const newFavorites = [...currentFavorites, { ...product, id: cleanProductId }];
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    }
  };

  const removeFromFavorites = async (productId: string) => {
    const cleanProductId = productId?.trim();
    if (isAuthenticated) {
      try {
        const currentFavorites = Array.isArray(favorites) ? favorites : [];
        const favorite = currentFavorites.find(f => f.id?.trim() === cleanProductId);
        if (favorite) {
          await favoritesApi.removeProduct(favorite.id);
          await loadFavorites();
        }
      } catch (error) {
        console.error('Failed to remove from favorites:', error);
      }
    } else {
      const currentFavorites = Array.isArray(favorites) ? favorites : [];
      const newFavorites = currentFavorites.filter(item => item.id?.trim() !== cleanProductId);
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    }
  };

  const isInFavorites = (productId: string) => {
    if (!Array.isArray(favorites)) {
      return false;
    }
    const cleanProductId = productId?.trim();
    return favorites.some(item => item.id?.trim() === cleanProductId);
  };

  const favoritesCount = Array.isArray(favorites) ? favorites.length : 0;

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      isInFavorites,
      favoritesCount,
      loading
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};