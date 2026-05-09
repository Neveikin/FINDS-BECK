import React, { useState, useEffect } from 'react';
import { Header } from '../../../widgets/header';
import { Footer } from '../../../widgets/footer/ui/Footer';
import { CategoryCard } from '../../../entities/category';
import { BrandCard } from '../../../entities/brand/ui/BrandCard';
import { ProductCard } from '../../../entities/product';
import { useNavigate } from 'react-router-dom';
import { Brand, Category } from '../../../shared/types';
import { brandApi } from '../../../shared/api/brand';
import { productApi } from '../../../shared/api/productApi';
import './MainPage.css';

const categories: Category[] = [
  { id: '1', name: 'ФУТБОЛКИ', image: '/images-main/clothes3.png' },
  { id: '2', name: 'ЗИПКИ', image: '/images-main/clothes5.png' },
  { id: '3', name: 'СВИТЕРЫ', image: '/images-main/clothes2.png' },
  { id: '4', name: 'ШТАНЫ', image: '/images-main/clothes6.png' },
  { id: '5', name: 'КУРТКИ', image: '/images-main/clothes1.png' },
  { id: '6', name: 'АКССЕСУАРЫ', image: '/images-main/clothes4.png' }
];

export const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [popularProducts, setPopularProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Загрузка данных для главной страницы
  useEffect(() => {
    const loadMainPageData = async () => {
      try {
        setLoading(true);
        
        // Загружаем бренды
        const brandsData = await brandApi.getAllBrands();
        // Убедимся что это массив
        const brandsArray = Array.isArray(brandsData) ? brandsData : [];
        setBrands(brandsArray.slice(0, 6)); // Показываем первые 6 брендов

        // Загружаем популярные товары
        const productsData = await productApi.getPopularProducts(8);
        // Убедимся что это массив
        setPopularProducts(Array.isArray(productsData) ? productsData : []);
        
      } catch (err) {
        console.error('Failed to load main page data:', err);
        setBrands([]);
        setPopularProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadMainPageData();
  }, []);

  const handleCategoryClick = (category: Category) => {
    let categorySlug = '';
    switch(category.name) {
      case 'ФУТБОЛКИ':
        categorySlug = 'futbolki';
        break;
      case 'ЗИПКИ':
        categorySlug = 'zipki';
        break;
      case 'СВИТЕРЫ':
        categorySlug = 'svitery';
        break;
      case 'ШТАНЫ':
        categorySlug = 'shtany';
        break;
      case 'КУРТКИ':
        categorySlug = 'kurtki';
        break;
      case 'АКССЕСУАРЫ':
        categorySlug = 'aksessuary';
        break;
      default:
        categorySlug = category.name.toLowerCase();
    }
    navigate(`/category/${categorySlug}`);
  };

  const handleBrandClick = (brand: Brand) => {
    navigate(`/brand/${brand.id}`);
  };

  return (
    <>
      <Header />
      
      <main className="main-content">
        <h1 className="section-title">КАТЕГОРИИ ТОВАРОВ</h1>
        <div className="categories-grid">
          {categories.map(category => (
            <CategoryCard 
              key={category.id} 
              category={category} 
              onClick={() => handleCategoryClick(category)}
            />
          ))}
        </div>

        <section className="brands-section">
          <h2 className="section-title">Популярные бренды</h2>
          <div className="brands-header">
            <a 
              href="/all-brands" 
              className="all-brands-link" 
              onClick={(e) => { 
                e.preventDefault(); 
                navigate('/all-brands'); 
              }}
            >
              все бренды →
            </a>
          </div>
          <div className="brands-grid">
            {brands.map(brand => (
              <BrandCard 
                key={brand.id} 
                brand={brand} 
                onClick={() => handleBrandClick(brand)}
              />
            ))}
          </div>
        </section>

        {/* BrandsSlider будет добавлен когда бренды будут загружаться с API */}

        <section className="popular-items-section">
          <h2 className="section-title">ПОПУЛЯРНЫЕ ПОЗИЦИИ</h2>
          <div className="products-grid">
            {loading ? (
              <div className="loading-placeholder">Загрузка популярных товаров...</div>
            ) : popularProducts.length === 0 ? (
              <div className="loading-placeholder">Популярные товары暂时 отсутствуют</div>
            ) : (
              popularProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
            <a 
              href="/category/all" 
              className="more-card" 
              onClick={(e) => { 
                e.preventDefault(); 
                navigate('/category/all'); 
              }}
            >
              <div className="more-content">
                <span className="more-word">ЕЩЕ</span>
                <span className="more-arrow">→</span>
              </div>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};