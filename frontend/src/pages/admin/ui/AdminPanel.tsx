import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../../widgets/header';
import { Footer } from '../../../widgets/footer/ui/Footer';
import { useSimpleAuth } from '../../../app/providers/SimpleAuthProvider';
import { adminApi } from '../../../shared/api/adminApi';
import { Product } from '../../../shared/types';
import './AdminPanel.css';

type Tab = 'products' | 'shops' | 'users';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useSimpleAuth();
  const [activeTab, setActiveTab] = useState<Tab>('products');
  
  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection states
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [searchUserEmail, setSearchUserEmail] = useState<string>('');
  
  // Form states
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    brand: '',
    price: '',
    image: '',
    description: '',
    category: ''
  });

  const [showShopForm, setShowShopForm] = useState(false);
  const [editingShop, setEditingShop] = useState<any>(null);
  const [shopFormData, setShopFormData] = useState({
    name: '',
    description: '',
    logoUrl: ''
  });

  const isAdmin = user?.roles?.includes('ADMIN');
  const isSeller = user?.roles?.includes('SELLER');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || (!isSeller && !isAdmin)) {
        navigate('/');
        return;
      }
      loadInitialData();
    }
  }, [authLoading, isAuthenticated, isSeller, isAdmin, navigate]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const shopsData = await adminApi.getShops();
      setShops(shopsData);
      
      if (shopsData.length > 0) {
        setSelectedShopId(shopsData[0].id);
        loadProductsByShop(shopsData[0].id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setLoading(false);
    }
  };

  const loadProductsByShop = async (shopId: string) => {
    setLoading(true);
    try {
      const data = await adminApi.getProductsByShop(shopId);
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShopChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const shopId = e.target.value;
    setSelectedShopId(shopId);
    loadProductsByShop(shopId);
  };

  // Product Actions
  const handleAddProduct = () => {
    if (!selectedShopId) {
      alert('Пожалуйста, выберите магазин сначала');
      return;
    }
    setEditingProduct(null);
    setProductFormData({
      name: '',
      brand: shops.find(s => s.id === selectedShopId)?.name || '',
      price: '',
      image: '',
      description: '',
      category: ''
    });
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      brand: product.brand,
      price: product.price.toString(),
      image: product.image,
      description: product.description,
      category: typeof product.category === 'object' ? (product.category as any)?.name : product.category
    });
    setShowProductForm(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: productFormData.name,
      description: productFormData.description,
      price: parseInt(productFormData.price),
      imageUrl: productFormData.image, // Can be empty now
      categoryName: productFormData.category,
      stock: 100, // Default stock
      material: 'Cotton', // Default material
      isActive: true // Required for edit
    };

    try {
      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, data as any);
      } else {
        await adminApi.addProduct(selectedShopId, data);
      }
      loadProductsByShop(selectedShopId);
      setShowProductForm(false);
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Ошибка при сохранении товара. Проверьте консоль для деталей.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Вы уверены?')) {
      try {
        await adminApi.deleteProduct(id);
        loadProductsByShop(selectedShopId);
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  // Shop Actions
  const handleEditShop = (shop: any) => {
    setEditingShop(shop);
    setShopFormData({
      name: shop.name,
      description: shop.description || '',
      logoUrl: shop.logoUrl || ''
    });
    setShowShopForm(true);
  };

  const handleShopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingShop) {
        await adminApi.updateShop(editingShop.id, shopFormData);
      } else {
        await adminApi.addShop(shopFormData);
      }
      setShowShopForm(false);
      loadInitialData();
    } catch (error) {
      console.error('Failed to save shop:', error);
      alert('Ошибка при сохранении магазина');
    }
  };

  // User Role Actions
  const handleUserSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUserEmail) return;
    setLoading(true);
    try {
      const response = await adminApi.searchUsers(searchUserEmail);
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to search users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      const usersData = await adminApi.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleAssignOwner = async (shopId: string, email: string) => {
    if (!email) return;
    try {
      await adminApi.addShopOwner(shopId, email);
      alert('Владелец добавлен');
      loadInitialData();
    } catch (error) {
      console.error('Failed to assign owner:', error);
      alert('Ошибка: пользователь не найден или уже является владельцем');
    }
  };

  if (authLoading) return <div>Загрузка...</div>;

  return (
    <div className="admin-panel">
      <Header title="АДМИН ПАНЕЛЬ" subtitle="Управление маркетплейсом" showOverlay={false} />
      
      <main className="admin-main">
        <div className="admin-container">
          {/* Tabs Navigation */}
          <div className="admin-tabs">
            <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>Товары</button>
            <button className={activeTab === 'shops' ? 'active' : ''} onClick={() => setActiveTab('shops')}>Магазины</button>
            {isAdmin && <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Пользователи</button>}
          </div>

          {activeTab === 'products' && (
            <div className="tab-content">
              <div className="content-header">
                <div className="shop-selector">
                  <label>Выберите магазин: </label>
                  <select value={selectedShopId} onChange={handleShopChange}>
                    {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <button className="add-btn" onClick={handleAddProduct}>Добавить товар в этот магазин</button>
              </div>

              {loading ? <p>Загрузка товаров...</p> : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Название</th>
                      <th>Бренд</th>
                      <th>Цена</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.brand}</td>
                        <td>{p.price} ₽</td>
                        <td>
                          <button onClick={() => handleEditProduct(p)}>Изм.</button>
                          <button onClick={() => handleDeleteProduct(p.id)}>Уд.</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {showProductForm && (
                <div className="modal">
                  <div className="modal-content">
                    <h2>{editingProduct ? 'Изменить товар' : 'Новый товар'}</h2>
                    <form onSubmit={handleProductSubmit}>
                      <input type="text" placeholder="Название" value={productFormData.name} onChange={e => setProductFormData({...productFormData, name: e.target.value})} required />
                      <input type="number" placeholder="Цена" value={productFormData.price} onChange={e => setProductFormData({...productFormData, price: e.target.value})} required />
                      <textarea placeholder="Описание" value={productFormData.description} onChange={e => setProductFormData({...productFormData, description: e.target.value})} />
                      <input type="text" placeholder="URL картинки" value={productFormData.image} onChange={e => setProductFormData({...productFormData, image: e.target.value})} />
                      <select value={productFormData.category} onChange={e => setProductFormData({...productFormData, category: e.target.value})} required>
                        <option value="">Категория</option>
                        <option value="ФУТБОЛКИ">ФУТБОЛКИ</option>
                        <option value="ЗИПКИ">ЗИПКИ</option>
                      </select>
                      <div className="form-actions">
                        <button type="submit">Сохранить</button>
                        <button type="button" onClick={() => setShowProductForm(false)}>Отмена</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'shops' && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Управление магазинами</h2>
                {isAdmin && <button className="add-btn" onClick={() => {
                  setEditingShop(null);
                  setShopFormData({ name: '', description: '', logoUrl: '' });
                  setShowShopForm(true);
                }}>+ Создать магазин</button>}
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Владельцы</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {shops.map(s => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.owners?.map((o: any) => o.email).join(', ') || 'Нет'}</td>
                      <td>
                        <button onClick={() => handleEditShop(s)}>Изм.</button>
                        <button onClick={() => {
                          const email = prompt('Email нового владельца:');
                          if (email) handleAssignOwner(s.id, email);
                        }}>+ Владелец</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {showShopForm && (
                <div className="modal">
                  <div className="modal-content">
                    <h2>{editingShop ? 'Изменить магазин' : 'Новый магазин'}</h2>
                    <form onSubmit={handleShopSubmit}>
                      <div className="form-group">
                        <label>Название</label>
                        <input type="text" value={shopFormData.name} onChange={e => setShopFormData({...shopFormData, name: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label>Описание</label>
                        <textarea value={shopFormData.description} onChange={e => setShopFormData({...shopFormData, description: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>URL логотипа</label>
                        <input type="text" value={shopFormData.logoUrl} onChange={e => setShopFormData({...shopFormData, logoUrl: e.target.value})} />
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="save-btn">Сохранить</button>
                        <button type="button" className="cancel-btn" onClick={() => setShowShopForm(false)}>Отмена</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="tab-content">
              <h2>Поиск пользователя</h2>
              <div className="user-search-container">
                <form onSubmit={handleUserSearch} className="search-form">
                  <input 
                    type="email" 
                    placeholder="Введите email пользователя..." 
                    value={searchUserEmail}
                    onChange={(e) => setSearchUserEmail(e.target.value)}
                    required
                  />
                  <button type="submit">Найти</button>
                </form>
              </div>

              {users.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Имя</th>
                      <th>Email</th>
                      <th>Роль</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <select value={u.role} onChange={(e) => handleChangeRole(u.id, e.target.value)}>
                            <option value="USER">USER</option>
                            <option value="SELLER">SELLER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td>-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                searchUserEmail && !loading && <p className="no-results">Пользователь не найден</p>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};