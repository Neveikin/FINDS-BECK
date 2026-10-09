import React from 'react';
import { Card } from '../../../shared/ui/card/Card';
import { Brand } from '../../../shared/types';
import './BrandCard.css';

interface BrandCardProps {
  brand: Brand;
  onClick?: () => void;
}

export const BrandCard: React.FC<BrandCardProps> = ({ brand, onClick }) => {
  // Поддержка разных полей для логотипа (logo, logoUrl)
  const logoUrl = brand.logo || (brand as any).logoUrl || '/images/default-brand.png';

  return (
    <Card className="brand-card" onClick={onClick}>
      <div className="brand-image">
        <img src={logoUrl} alt={brand.name} onError={(e) => {
          (e.target as HTMLImageElement).src = '/images/default-brand.png';
        }} />
      </div>
      <div className="brand-content">
        <h3>{brand.name}</h3>
      </div>
    </Card>
  );
};