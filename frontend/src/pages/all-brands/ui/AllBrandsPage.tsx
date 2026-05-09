import React, { useState, useEffect } from 'react';
import { Header } from '../../../widgets/header';
import { Footer } from '../../../widgets/footer/ui/Footer';
import { BrandCard } from '../../../entities/brand/ui/BrandCard';
import { useNavigate } from 'react-router-dom';
import { Brand } from '../../../shared/types';
import { brandApi } from '../../../shared/api/brand';
import './AllBrandsPage.css'

export const AllBrandsPage: React.FC = () => {
  const navigate = useNavigate();
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка брендов
  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoading(true);
        const brandsData = await brandApi.getAllBrands();
        setAllBrands(brandsData);
      } catch (err) {
        console.error('Failed to load brands:', err);
        setError('Не удалось загрузить бренды');
        setAllBrands([]);
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, []);

  const handleBrandClick = (brand: Brand) => {
    navigate(`/brand/${brand.id}`);
  };

  return (
    <>
      <Header title="БРЕНДЫ" subtitle="Все бренды в одном месте" />
      
      <main className="all-brands-content">
        {loading ? (
          <div className="loading-brands">
            <div className="loading-spinner">Загрузка брендов...</div>
          </div>
        ) : error ? (
          <div className="error-brands">
            <h2>Ошибка загрузки брендов</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Попробовать снова
            </button>
          </div>
        ) : allBrands.length === 0 ? (
          <div className="empty-brands">
            <h2>Бренды временно отсутствуют</h2>
            <p>Скоро здесь появятся бренды</p>
          </div>
        ) : (
          <div className="brands-grid">
            {allBrands.map(brand => (
              <BrandCard 
                key={brand.id} 
                brand={brand} 
                onClick={() => handleBrandClick(brand)}
              />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </>
  );
};
