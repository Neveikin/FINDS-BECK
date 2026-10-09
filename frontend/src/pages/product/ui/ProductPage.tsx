import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../../widgets/header';
import { Footer } from '../../../widgets/footer/ui/Footer';
import { AddToCartButton } from '../../../features/add-to-cart/ui/AddToCartButton';
import { FavoriteButton } from '../../../features/add-to-favorites/FavoriteButton';
import { productApi } from '../../../shared/api/productApi';
import { Product, ProductVariant } from '../../../shared/types';
import './ProductPage.css';

export const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
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

        const productData = await productApi.getProductById(productId);
        setProduct(productData);

        // Если есть варианты, выбираем первый
        if (productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
          if (productData.variants[0].sizes && productData.variants[0].sizes.length > 0) {
            setSelectedSize(productData.variants[0].sizes[0].size);
          }
        }

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

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setCurrentImageIndex(0);
    // Выбираем первый доступный размер для нового варианта
    if (variant.sizes && variant.sizes.length > 0) {
      setSelectedSize(variant.sizes[0].size);
    }
  };

  const handlePrevImage = () => {
    if (selectedVariant && selectedVariant.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedVariant.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (selectedVariant && selectedVariant.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === selectedVariant.images.length - 1 ? 0 : prev + 1
      );
    }
  };

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

  const currentImages = selectedVariant?.images || [{ id: '1', url: product.image, order: 0 }];
  const currentImage = currentImages[currentImageIndex]?.url || product.image;
  const availableSizes = selectedVariant?.sizes || [];

  const handleSimilarProductClick = (id: string) => {
    navigate(`/product/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="product-page">
      <Header title={product.brand} subtitle={product.name} showOverlay={true} />

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
                <img src={currentImage} alt={product.name} />

                {currentImages.length > 1 && (
                  <>
                    <button className="gallery-nav gallery-prev" onClick={handlePrevImage}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6"/>
                      </svg>
                    </button>
                    <button className="gallery-nav gallery-next" onClick={handleNextImage}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {currentImages.length > 1 && (
                <div className="product-thumbnails">
                  {currentImages.map((img, index) => (
                    <div
                      key={img.id}
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img src={img.url} alt={`${product.name} ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
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
                {product.variants && product.variants.length > 0 && (
                  <div className="color-selector">
                    <h3>Выберите цвет</h3>
                    <div className="color-buttons">
                      {product.variants.map(variant => (
                        <button
                          key={variant.id}
                          className={`color-btn ${selectedVariant?.id === variant.id ? 'active' : ''}`}
                          style={{
                            backgroundColor: variant.colorHex || '#ccc',
                            border: variant.colorHex === '#ffffff' || variant.colorHex === '#fff' ? '2px solid #ddd' : '2px solid transparent'
                          }}
                          onClick={() => handleVariantChange(variant)}
                          title={variant.color}
                        >
                          <span className="color-name">{variant.color}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {availableSizes.length > 0 && (
                  <div className="size-selector">
                    <h3>Выберите размер</h3>
                    <div className="size-buttons">
                      {availableSizes.map(sizeObj => (
                        <button
                          key={sizeObj.size}
                          className={`size-btn ${selectedSize === sizeObj.size ? 'active' : ''} ${sizeObj.stock === 0 ? 'out-of-stock' : ''}`}
                          onClick={() => sizeObj.stock > 0 && setSelectedSize(sizeObj.size)}
                          disabled={sizeObj.stock === 0}
                        >
                          {sizeObj.size}
                          {sizeObj.stock === 0 && <span className="stock-label">Нет в наличии</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="product-actions">
                <FavoriteButton product={product} className="product-page-favorite" />
                <AddToCartButton
                  product={product}
                  size={selectedSize}
                  color={selectedVariant?.color}
                />
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
