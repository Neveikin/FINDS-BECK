import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../../../widgets/header';
import { Footer } from '../../../widgets/footer/ui/Footer';
import { BrandCard } from '../../../entities/brand/ui/BrandCard';
import { Brand } from '../../../shared/types';
import { brandApi } from '../../../shared/api/brand';
import './AllBrandsPage.css';

export const AllBrandsPage: React.FC = () => {
  const navigate = useNavigate();

  // Use React Query for caching
  const { data: allBrands = [], isLoading, error } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const brandsData = await brandApi.getAllBrands();
      if (Array.isArray(brandsData)) {
        return brandsData;
      }
      return [];
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes (brands change rarely)
  });

  const handleBrandClick = (brand: Brand) => {
    navigate(`/brand/${brand.id}`);
  };

  return (
    <>
      <Header title="БРЕНДЫ" subtitle="Все бренды в одном месте" backgroundImage="/images-main/kodex-header.png" />

      <main className="all-brands-content">
        {isLoading ? (
          <div className="loading-brands">
            <div className="loading-spinner">Загрузка брендов...</div>
          </div>
        ) : error ? (
          <div className="error-brands">
            <h2>Ошибка загрузки брендов</h2>
            <p>{error instanceof Error ? error.message : 'Неизвестная ошибка'}</p>
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
