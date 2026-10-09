import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../../../widgets/header';
import { Footer } from '../../../widgets/footer/ui/Footer';
import { ProductCard } from '../../../entities/product/ui/ProductCard';
import { productApi } from '../../../shared/api/productApi';
import './CategoryPage.css';

const categoriesList = [
  { id: 'all', name: 'Все товары', count: 0 },
  { id: 'futbolki', name: 'Футболки', count: 0 },
  { id: 'zipki', name: 'Зипки', count: 0 },
  { id: 'svitery', name: 'Свитеры', count: 0 },
  { id: 'shtany', name: 'Штаны', count: 0 },
  { id: 'kurtki', name: 'Куртки', count: 0 },
  { id: 'aksessuary', name: 'Аксессуары', count: 0 },
];

export const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId || 'all');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'>('popular');
  const [showSortMenu, setShowSortMenu] = useState<boolean>(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState<boolean>(false);

  const getCategoryName = (id: string) => {
    const cat = categoriesList.find(c => c.id === id);
    return cat ? cat.name : 'Все товары';
  };

  // Use React Query for caching and automatic refetching
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products', selectedCategory, sortBy],
    queryFn: async () => {
      if (selectedCategory === 'all') {
        return await productApi.getAllProducts({ sortBy });
      } else {
        const categoryMap: Record<string, string> = {
          'futbolki': 'ФУТБОЛКИ',
          'zipki': 'ЗИПКИ',
          'svitery': 'СВИТЕРЫ',
          'shtany': 'ШТАНЫ',
          'kurtki': 'КУРТКИ',
          'aksessuary': 'АКССЕСУАРЫ'
        };
        return await productApi.getProductsByCategory(categoryMap[selectedCategory], { sortBy });
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // No client-side sorting - trust backend sortBy parameter
  const displayProducts = Array.isArray(products) ? products : [];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategoryFilter(false);
    navigate(`/category/${categoryId}`);
  };


  return (
    <div className="category-page">
      <Header
        title={selectedCategory === 'all' ? 'КАТАЛОГ' : getCategoryName(selectedCategory)}
        subtitle="Все товары в одном месте"
        showOverlay={true}
      />

      <main className="category-main">
        <div className="category-products">
          <div className="category-header-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedCategory === 'all' ? 'Все товары' : getCategoryName(selectedCategory)}</h2>
            <a href="/all-brands" style={{ fontWeight: 'bold', textDecoration: 'underline', color: '#000', fontSize: '14px' }}>ВСЕ БРЕНДЫ</a>
          </div>
          <div className="category-controls">
            <div className="category-filter">
              <button
                className="filter-button"
                onClick={() => setShowCategoryFilter(!showCategoryFilter)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
                </svg>
                {selectedCategory === 'all' ? 'Все категории' : getCategoryName(selectedCategory)}
                <span className="filter-arrow">{showCategoryFilter ? '▲' : '▼'}</span>
              </button>

              {showCategoryFilter && (
                <div className="filter-dropdown">
                  {categoriesList.map(cat => (
                    <button
                      key={cat.id}
                      className={`filter-option ${selectedCategory === cat.id ? 'active' : ''}`}
                      onClick={() => handleCategorySelect(cat.id)}
                    >
                      <span>{cat.name}</span>
                      <span className="filter-option-count">{cat.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="products-count">Найдено: {displayProducts.length} товаров</div>

            <div className="sort-container">
              <button
                className="sort-button"
                onClick={() => setShowSortMenu(!showSortMenu)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L3.5 11.293V2.5z"/>
                </svg>
                Сортировка
                <span className="sort-current">
                  {sortBy === 'popular' && 'Популярные'}
                  {sortBy === 'price-asc' && 'Сначала дешевле'}
                  {sortBy === 'price-desc' && 'Сначала дороже'}
                  {sortBy === 'name-asc' && 'По названию (А-Я)'}
                  {sortBy === 'name-desc' && 'По названию (Я-А)'}
                </span>
              </button>

              {showSortMenu && (
                <div className="sort-menu">
                  <button
                    className={`sort-option ${sortBy === 'popular' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('popular');
                      setShowSortMenu(false);
                    }}
                  >
                    Популярные
                  </button>
                  <button
                    className={`sort-option ${sortBy === 'price-asc' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('price-asc');
                      setShowSortMenu(false);
                    }}
                  >
                    Сначала дешевле
                  </button>
                  <button
                    className={`sort-option ${sortBy === 'price-desc' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('price-desc');
                      setShowSortMenu(false);
                    }}
                  >
                    Сначала дороже
                  </button>
                  <button
                    className={`sort-option ${sortBy === 'name-asc' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('name-asc');
                      setShowSortMenu(false);
                    }}
                  >
                    По названию (А-Я)
                  </button>
                  <button
                    className={`sort-option ${sortBy === 'name-desc' ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy('name-desc');
                      setShowSortMenu(false);
                    }}
                  >
                    По названию (Я-А)
                  </button>
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="loading-state" style={{ padding: '40px', textAlign: 'center', width: '100%', fontSize: '1.2rem', color: '#666' }}>
              Загрузка...
            </div>
          ) : displayProducts.length > 0 ? (
            <div className="products-grid">
              {displayProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px', textAlign: 'center', width: '100%', color: '#666' }}>Нет товаров в этой категории</div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
