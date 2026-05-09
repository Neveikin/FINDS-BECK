import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../../widgets/header';
import { Footer } from '../../../widgets/footer/ui/Footer';
import { AddToCartButton } from '../../../features/add-to-cart/ui/AddToCartButton';
import { FavoriteButton } from '../../../features/add-to-favorites/FavoriteButton';
import { ProductCard } from '../../../entities/product';
import { brandApi } from '../../../shared/api/brand';
import { productApi } from '../../../shared/api/productApi';
import { Brand, Product } from '../../../shared/types';
import './BrandPage.css';

export const BrandPage: React.FC = () => {
  const { brandId } = useParams<{ brandId: string }>();
  const navigate = useNavigate();
  
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('popular');
  const [showSortMenu, setShowSortMenu] = useState<boolean>(false);

  // Загрузка данных бренда
  useEffect(() => {
    const loadBrandData = async () => {
      if (!brandId) {
        setError('ID бренда не указан');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Загружаем информацию о бренде
        const brandData = await brandApi.getBrandById(brandId);
        setBrand({
          id: brandData.id,
          name: brandData.name,
          description: brandData.description,
          logo: brandData.logo,
          coverImage: brandData.coverImage,
          products: brandData.products
        });

        // Загружаем товары бренда
        const productsData = await brandApi.getBrandProducts(brandId);
        setProducts(productsData);
        
      } catch (err) {
        console.error('Failed to load brand data:', err);
        setError('Не удалось загрузить информацию о бренде');
      } finally {
        setLoading(false);
      }
    };

    loadBrandData();
  }, [brandId]);

  // Сортировка товаров
  const getSortedProducts = () => {
    const sorted = [...products];
    switch(sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sorted;
    }
  };

  const sortedProducts = getSortedProducts();

  if (loading) {
    return (
      <>
        <Header />
        <main className="brand-page-loading">
          <div className="loading-spinner">Загрузка...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !brand) {
    return (
      <>
        <Header />
        <main className="brand-page-error">
          <div className="error-content">
            <h1>Бренд не найден</h1>
            <p>{error || 'Бренд с указанным ID не существует'}</p>
            <button onClick={() => navigate('/all-brands')} className="back-button">
              Вернуться к брендам
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header 
        title={brand.name} 
        subtitle={brand.description} 
        backgroundImage={brand.coverImage}
        showOverlay={true}
      />
      
      <main className="brand-page">
        <div className="brand-header">
          <div className="brand-info">
            <img 
              src={brand.logo} 
              alt={brand.name} 
              className="brand-logo"
            />
            <div className="brand-details">
              <h1>{brand.name}</h1>
              <p>{brand.description}</p>
              <div className="brand-stats">
                <span>{products.length} товаров</span>
              </div>
            </div>
          </div>
        </div>

        <div className="brand-controls">
          <div className="sort-controls">
            <button 
              className="sort-button"
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              Сортировка: {getSortLabel(sortBy)}
              <span className={`arrow ${showSortMenu ? 'up' : 'down'}`}></span>
            </button>
            
            {showSortMenu && (
              <div className="sort-menu">
                <button onClick={() => { setSortBy('popular'); setShowSortMenu(false); }}>
                  По популярности
                </button>
                <button onClick={() => { setSortBy('price-asc'); setShowSortMenu(false); }}>
                  По цене (возрастание)
                </button>
                <button onClick={() => { setSortBy('price-desc'); setShowSortMenu(false); }}>
                  По цене (убывание)
                </button>
                <button onClick={() => { setSortBy('name-asc'); setShowSortMenu(false); }}>
                  По названию (А-Я)
                </button>
                <button onClick={() => { setSortBy('name-desc'); setShowSortMenu(false); }}>
                  По названию (Я-А)
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="brand-products">
          {sortedProducts.length === 0 ? (
            <div className="empty-products">
              <h2>Товары бренда暂时 отсутствуют</h2>
              <p>Скоро здесь появятся товары бренда {brand.name}</p>
            </div>
          ) : (
            <div className="products-grid">
              {sortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
};

const getSortLabel = (sortBy: string): string => {
  switch(sortBy) {
    case 'price-asc': return 'Цена (возр.)';
    case 'price-desc': return 'Цена (убыв.)';
    case 'name-asc': return 'Название (А-Я)';
    case 'name-desc': return 'Название (Я-А)';
    default: return 'Популярные';
  }
};
