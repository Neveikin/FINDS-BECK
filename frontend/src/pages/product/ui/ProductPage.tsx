import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../../widgets/header';
import { Footer } from '../../../widgets/footer/ui/Footer';
import { AddToCartButton } from '../../../features/add-to-cart/ui/AddToCartButton';
import { FavoriteButton } from '../../../features/add-to-favorites/FavoriteButton';
import { productApi } from '../../../shared/api/productApi';
import './ProductPage.css';

export const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('Черный');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProductData = async () => {
      if (!productId) {
        setError('ID товара не указан');
        return;
      }

      try {
        setLoading(true);
        
        // Загружаем данные товара
        const productData = await productApi.getProductById(productId);
        setProduct(productData);

        // Похожие товары не используются
        setSimilarProducts([]);
        
      } catch (err) {
        console.error('Failed to load product data:', err);
        setError('Не удалось загрузить информацию о товаре');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [productId]);

  if (loading) {
    return (
      <div className="product-loading">
        <Header title="Загрузка..." subtitle="" showOverlay={false} />
        <div className="loading-content">
          <div className="loading-spinner">Загрузка товара...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-not-found">
        <Header title="Товар не найден" subtitle="" showOverlay={false} />
        <div className="not-found-content">
          <h1>Товар не найден</h1>
          <p>{error || 'Товар с указанным ID не существует'}</p>
          <button onClick={() => navigate('/')}>Вернуться на главную</button>
        </div>
        <Footer />
      </div>
    );
  }

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Черный', 'Белый', 'Серый', 'Синий'];

  const handleSimilarProductClick = (id: string) => {
    navigate(`/product/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="product-page">
      <Header title={product.brand} subtitle="" showOverlay={true} />
      
      <main className="product-main">
        <div className="product-container">
          <div className="product-breadcrumb">
            <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Главная</a>
            <span>/</span>
            <a href="/category/all" onClick={(e) => { e.preventDefault(); navigate('/category/all'); }}>Каталог</a>
            <span>/</span>
            <span className="current">{product.name}</span>
          </div>

          <div className="product-content">
            <div className="product-gallery">
              <div className="product-main-image">
                <img src={product.image} alt={product.name} />
              </div>
            </div>

            <div className="product-details">
              <h1 className="product-name">{product.name}</h1>
              <div className="product-brand-info">
                <span className="brand-name">{product.brand}</span>
              </div>
              <div className="product-price">{product.price.toLocaleString()} ₽</div>
              
              <div className="product-description">
                <h3>Описание</h3>
                <p>{product.description}</p>
              </div>

              <div className="product-options">
                <div className="size-selector">
                  <h3>Выберите размер</h3>
                  <div className="size-buttons">
                    {sizes.map(size => (
                      <button
                        key={size}
                        className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="color-selector">
                  <h3>Выберите цвет</h3>
                  <div className="color-buttons">
                    {colors.map(color => (
                      <button
                        key={color}
                        className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                        style={{ 
                          backgroundColor: color === 'Черный' ? '#000' : color === 'Белый' ? '#fff' : color === 'Серый' ? '#888' : '#2c3e70',
                          color: color === 'Белый' ? '#333' : '#fff',
                          border: color === 'Белый' ? '1px solid #ddd' : 'none'
                        }}
                        onClick={() => setSelectedColor(color)}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="product-actions">
                <FavoriteButton product={product} className="product-page-favorite" />
                <AddToCartButton product={product} />
              </div>
            </div>
          </div>

          {similarProducts.length > 0 && (
            <div className="similar-products">
              <h2 className="similar-title">Похожие товары</h2>
              <div className="similar-grid">
                {similarProducts.map(item => (
                  <div key={item.id} className="similar-card" onClick={() => handleSimilarProductClick(item.id)}>
                    <div className="similar-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="similar-info">
                      <h3 className="similar-brand">{item.brand}</h3>
                      <p className="similar-name">{item.name}</p>
                      <p className="similar-price">{item.price.toLocaleString()} ₽</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};