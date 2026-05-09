import React, { useState } from 'react';
import { useCart } from '../../../app/providers/CartProvider';
import { Product } from '../../../shared/types';
import './AddToCartButton.css';

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  showIcon?: boolean;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({ 
  product, 
  className = '',
  showIcon = true 
}) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <button 
      className={`add-to-cart-btn ${className} ${isAdded ? 'added' : ''}`} 
      onClick={handleAddToCart}
    >
      {isAdded ? '✓ Добавлено' : 'В корзину'}
      {showIcon && !isAdded && (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
          <path d="M5.757 1.071a.5.5 0 0 1 .172.686L3.383 6h9.234L10.07 1.757a.5.5 0 1 1 .858-.514L13.783 6H15a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1v4.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 13.5V9a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1.217L5.07 1.243a.5.5 0 0 1 .686-.172zM2 9v4.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V9H2zM1 7v1h14V7H1z"/>
        </svg>
      )}
    </button>
  );
};