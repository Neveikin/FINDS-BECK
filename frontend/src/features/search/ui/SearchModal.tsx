import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../../../shared/api/productApi';
import './SearchModal.css';

interface SearchModalProps {
  onClose: () => void;
}

interface PageLink {
  name: string;
  path: string;
}

const pages: PageLink[] = [
  { name: 'Главная', path: '/' },
  { name: 'Каталог', path: '/category/all' },
  { name: 'Бренды', path: '/all-brands' },
  { name: 'Личный кабинет', path: '/profile' },
  { name: 'Избранное', path: '/profile?tab=favorites' },
  { name: 'Мои заказы', path: '/profile?tab=orders' },
];

export const SearchModal: React.FC<SearchModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    // Поиск товаров через API
    const searchProducts = async () => {
      try {
        const results = await productApi.searchProducts(searchQuery);
        setSearchResults(results.slice(0, 8));
      } catch (err) {
        console.error('Search failed:', err);
        setSearchResults([]);
      }
    };

    // Debounce для поиска
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        searchProducts();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    onClose();
  };

  return (
    <div className="search-modal-overlay">
      <div className="search-modal" ref={modalRef}>
        <div className="search-modal-header">
          <h3>Поиск</h3>
          <button className="search-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="search-input-wrapper">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Поиск товаров, брендов, страниц..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="search-modal-content">
          {searchQuery === '' ? (
            <div className="search-section">
              <h3>Страницы</h3>
              <div className="quick-links">
                {pages.map(page => (
                  <button
                    key={page.path}
                    className="quick-link"
                    onClick={() => handleNavigate(page.path)}
                  >
                    {page.name}
                  </button>
                ))}
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="search-results">
              <h3>Товары</h3>
              <div className="results-list">
                {searchResults.map(product => (
                  <div
                    key={product.id}
                    className="search-result-item"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <img src={product.image} alt={product.name} className="result-image" />
                    <div className="result-info">
                      <div className="result-name">{product.name}</div>
                      <div className="result-brand">{product.brand}</div>
                      <div className="result-price">{product.price.toLocaleString()} ₽</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-results">
              <p>Ничего не найдено</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};