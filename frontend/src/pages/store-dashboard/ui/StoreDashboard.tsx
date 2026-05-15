import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../../widgets/header';
import { Footer } from '../../../widgets/footer/ui/Footer';
import { useSimpleAuth } from '../../../app/providers/SimpleAuthProvider';
import { orderApi } from '../../../shared/api/order';
import { adminApi } from '../../../shared/api/adminApi';
import { apiClient } from '../../../shared/api/apiClient';
import './StoreDashboard.css';

export const StoreDashboard: React.FC = () => {
  const { user } = useSimpleAuth();
  const navigate = useNavigate();
  const [myShops, setMyShops] = useState<any[]>([]);
  const [shopOrders, setShopOrders] = useState<any[]>([]);
  const [shopActiveTab, setShopActiveTab] = useState<'products' | 'orders'>('products');
  const [shopProducts, setShopProducts] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    categoryName: 'ФУТБОЛКИ'
  });

  useEffect(() => {
    if (user) {
      fetchMyShops();
      fetchShopOrders();
    } else {
        navigate('/login');
    }
  }, [user]);

  const fetchMyShops = async () => {
    try {
      const response = await apiClient.get<any[]>('/api/shops/my');
      setMyShops(response);
      if (response.length > 0) {
        setSelectedShopId(response[0].id);
        fetchShopProducts(response[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch shops:', error);
    }
  };

  const fetchShopProducts = async (shopId: string) => {
    try {
      const response = await adminApi.getProductsByShop(shopId);
      setShopProducts(response);
    } catch (error) {
      console.error('Failed to fetch shop products:', error);
    }
  };

  const fetchShopOrders = async () => {
    if (!user) return;
    try {
      const response = await orderApi.getShopOrders(user.email);
      setShopOrders(response);
    } catch (error) {
      console.error('Failed to fetch shop orders:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await orderApi.updateStatus(orderId, status);
      fetchShopOrders();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...productFormData,
      price: parseInt(productFormData.price),
      stock: 100,
      material: 'Cotton',
      isActive: true
    };

    try {
      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, data as any);
      } else {
        await adminApi.addProduct(selectedShopId, data);
      }
      fetchShopProducts(selectedShopId);
      setIsAddingProduct(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      imageUrl: product.image || '',
      categoryName: typeof product.category === 'string' ? product.category : product.category?.name || 'ФУТБОЛКИ'
    });
    setIsAddingProduct(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductFormData(prev => ({
          ...prev,
          imageUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="store-dashboard-page">
      <Header 
        title="КАБИНЕТ МАГАЗИНА" 
        subtitle="Управление вашими продажами" 
        backgroundImage="/images-main/admin-header.jpg" 
        showOverlay={true} 
      />
      
      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-nav">
             <button className="back-btn" onClick={() => navigate('/profile')}>
                ← В профиль
             </button>
             <div className="dashboard-tabs">
                <button 
                    className={`tab-btn ${shopActiveTab === 'products' ? 'active' : ''}`}
                    onClick={() => setShopActiveTab('products')}
                >
                    Товары
                </button>
                <button 
                    className={`tab-btn ${shopActiveTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setShopActiveTab('orders')}
                >
                    Заказы
                </button>
             </div>
          </div>

          <div className="dashboard-content">
            {shopActiveTab === 'products' && (
              <div className="shop-products-section">
                <div className="content-header">
                  <div className="shop-selector">
                    <label>Магазин:</label>
                    <select 
                      value={selectedShopId} 
                      onChange={(e) => {
                        setSelectedShopId(e.target.value);
                        fetchShopProducts(e.target.value);
                      }}
                    >
                      {myShops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <button className="add-btn" onClick={() => {
                    setIsAddingProduct(true);
                    setEditingProduct(null);
                    setProductFormData({ name: '', description: '', price: '', imageUrl: '', categoryName: 'ФУТБОЛКИ' });
                  }}>+ Добавить товар</button>
                </div>

                <div className="products-grid-admin">
                  {shopProducts.map(p => (
                    <div key={p.id} className="admin-product-card">
                      <img src={p.image} alt={p.name} />
                      <div className="admin-product-info">
                        <h4>{p.name}</h4>
                        <p className="price">{p.price} ₽</p>
                        <div className="admin-product-actions">
                          <button onClick={() => handleEditProduct(p)}>Редактировать</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {isAddingProduct && (
                  <div className="modal-overlay">
                    <div className="modal-content">
                      <h3>{editingProduct ? 'Изменить товар' : 'Новый товар'}</h3>
                      <form onSubmit={handleProductSubmit}>
                        <div className="form-group">
                          <label>Название</label>
                          <input type="text" value={productFormData.name} onChange={e => setProductFormData({...productFormData, name: e.target.value})} required />
                        </div>
                        <div className="form-group">
                          <label>Цена</label>
                          <input type="number" value={productFormData.price} onChange={e => setProductFormData({...productFormData, price: e.target.value})} required />
                        </div>
                        <div className="form-group">
                          <label>Описание</label>
                          <textarea value={productFormData.description} onChange={e => setProductFormData({...productFormData, description: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>Фото товара</label>
                          <input type="file" accept="image/*" onChange={handleImageChange} />
                          {productFormData.imageUrl && (
                            <div className="image-preview">
                              <img src={productFormData.imageUrl} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '10px', borderRadius: '8px' }} />
                            </div>
                          )}
                        </div>
                        <div className="form-group">
                          <label>Категория</label>
                          <select value={productFormData.categoryName} onChange={e => setProductFormData({...productFormData, categoryName: e.target.value})}>
                            <option value="ФУТБОЛКИ">ФУТБОЛКИ</option>
                            <option value="ЗИПКИ">ЗИПКИ</option>
                            <option value="ХУДИ">ХУДИ</option>
                            <option value="ШТАНЫ">ШТАНЫ</option>
                          </select>
                        </div>
                        <div className="modal-actions">
                          <button type="submit" className="save-btn">Сохранить</button>
                          <button type="button" className="cancel-btn" onClick={() => setIsAddingProduct(false)}>Отмена</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {shopActiveTab === 'orders' && (
              <div className="shop-orders-section">
                <h3 className="section-title">Заказы ваших магазинов</h3>
                {shopOrders.length === 0 ? (
                  <div className="empty-state">
                    <p>Заказов пока нет</p>
                  </div>
                ) : (
                  <div className="shop-orders-list">
                    {Array.isArray(shopOrders) && shopOrders.map(order => (
                      <div key={order.id} className="shop-order-card">
                        <div className="shop-order-header">
                          <div className="order-main-info">
                             <span className="order-number">Заказ #{order.id.slice(-6)}</span>
                             <span className="order-date">{new Date(order.date || (order as any).createdAt).toLocaleDateString('ru-RU')}</span>
                          </div>
                          <select 
                            value={order.status} 
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className={`status-select status-${order.status}`}
                          >
                            <option value="CREATED">CREATED (Новый)</option>
                            <option value="CONFIRMED">CONFIRMED (В работе)</option>
                            <option value="SHIPPED">SHIPPED (Отправлен)</option>
                            <option value="DELIVERED">DELIVERED (Доставлен)</option>
                            <option value="CANCELLED">CANCELLED (Отменен)</option>
                          </select>
                        </div>
                        <div className="shop-order-items">
                          {order.items.map((item: any) => (
                            <div key={item.id} className="shop-order-item">
                              <div className="item-info">
                                 <img src={item.product.image} alt={item.product.name} />
                                 <span>{item.product.name} x{item.quantity}</span>
                              </div>
                              <span className="item-price">{item.priceAtPurchase * item.quantity} ₽</span>
                            </div>
                          ))}
                        </div>
                        <div className="shop-order-footer">
                          <div className="delivery-info">
                             <strong>Адрес доставки:</strong> {order.adress || order.address}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
