import React from 'react';
import { Card } from '../../../shared/ui/card/Card';
import { Brand } from '../../../shared/types';
import './BrandCard.css';

interface BrandCardProps {
  brand: Brand;
  onClick?: () => void;
}

export const BrandCard: React.FC<BrandCardProps> = ({ brand, onClick }) => {
  return (
    <Card className="brand-card" onClick={onClick}>
      <div className="brand-image">
        <img src={brand.logo} alt={brand.name} />
      </div>
      <div className="brand-content">
        <h3>{brand.name}</h3>
        <p>{brand.description}</p>
      </div>
    </Card>
  );
};