import React from 'react';
import { Card } from '../../../shared/ui/card/Card';
import './CategoryCard.css';

interface Category {
  id: string;
  name: string;
  image: string;
}

interface CategoryCardProps {
  category: Category;
  onClick?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  return (
    <Card className="category-card" onClick={onClick}>
      <div className="category-image">
        <img src={category.image} alt={category.name} />
      </div>
      <div className="category-overlay">
        <h3 className="category-name">{category.name}</h3>
      </div>
    </Card>
  );
};