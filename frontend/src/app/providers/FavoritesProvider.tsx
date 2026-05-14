import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  refreshFavorites: () => Promise<void>;
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

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const response = await favoritesApi.getFavorites() as any;
      console.log('FavoritesProvider - Response from backend:', response);
      // Backend returns { Shops: [...], Products: [...] }
      if (response && response.Products && Array.isArray(response.Products)) {
        // Extract products from favorite items and ensure unique keys
        const products = response.Products.map((favorite: any) => ({
          ...favorite.product,
          id: favorite.product.id?.trim(), // Product ID
          favoriteId: favorite.id // Favorite record ID for deletion
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
  }, []);

  useEffect(() => {
    const syncFavorites = async () => {
      if (!authLoading) {
        if (isAuthenticated) {
          // When user logs in, sync localStorage favorites to backend
          const savedFavorites = localStorage.getItem('favorites');
          if (savedFavorites) {
            try {
              const localProducts: Product[] = JSON.parse(savedFavorites);
              console.log('FavoritesProvider - Syncing local favorites to backend:', localProducts);

              // Add each local favorite to backend
              for (const product of localProducts) {
                try {
                  await favoritesApi.addProduct(product.id);
                } catch (error) {
                  console.error('Failed to sync favorite:', product.id, error);
                }
              }

              // Clear localStorage after sync
              localStorage.removeItem('favorites');
            } catch (error) {
              console.error('Failed to parse local favorites:', error);
            }
          }

          // Load favorites from backend
          await loadFavorites();
        } else {
          // Load from localStorage for non-authenticated users
          const savedFavorites = localStorage.getItem('favorites');
          if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
          }
        }
      }
    };

    syncFavorites();
  }, [isAuthenticated, authLoading, loadFavorites]);

  const addToFavorites = async (product: Product) => {
    console.log('addToFavorites called for product:', product.id);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('Current favorites:', favorites);

    // Check if product is already in favorites
    const currentFavorites = Array.isArray(favorites) ? favorites : [];
    const isAlreadyFavorite = currentFavorites.some(fav => fav.id === product.id);

    if (isAlreadyFavorite) {
      console.log('Product already in favorites, skipping');
      return; // Don't add if already exists
    }

    if (isAuthenticated) {
      try {
        console.log('Adding to backend:', product.id);
        await favoritesApi.addProduct(product.id);
        console.log('Successfully added to backend, reloading favorites');
        await loadFavorites();
        console.log('Favorites reloaded');
      } catch (error) {
        console.error('Failed to add to favorites:', error);
      }
    } else {
      const newFavorites = [...currentFavorites, product];
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      console.log('Added to localStorage:', newFavorites);
    }
  };

  const removeFromFavorites = async (productId: string) => {
    if (isAuthenticated) {
      try {
        const currentFavorites = Array.isArray(favorites) ? favorites : [];
        const favorite = currentFavorites.find(f => f.id === productId);
        if (favorite && favorite.favoriteId) {
          // Use favoriteId (Favorite record ID) for deletion, not product ID
          await favoritesApi.removeProduct(favorite.favoriteId);
          await loadFavorites();
        }
      } catch (error) {
        console.error('Failed to remove from favorites:', error);
      }
    } else {
      const currentFavorites = Array.isArray(favorites) ? favorites : [];
      const newFavorites = currentFavorites.filter(item => item.id !== productId);
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    }
  };

  const isInFavorites = (productId: string) => {
    if (!Array.isArray(favorites)) {
      console.log('isInFavorites - favorites is not an array');
      return false;
    }
    const result = favorites.some(item => item.id === productId);
    console.log(`isInFavorites(${productId}):`, result, 'favorites:', favorites.map(f => f.id));
    return result;
  };

  const favoritesCount = Array.isArray(favorites) ? favorites.length : 0;

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      isInFavorites,
      favoritesCount,
      loading,
      refreshFavorites: loadFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};