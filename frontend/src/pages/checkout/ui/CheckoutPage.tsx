import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../../widgets/header';
import { Footer } from '../../../widgets/footer/ui/Footer';
import { useCart } from '../../../app/providers/CartProvider';
import { useSimpleAuth } from '../../../app/providers/SimpleAuthProvider';
import { useOrders } from '../../../app/providers/OrdersProvider';
import './CheckoutPage.css';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useSimpleAuth();
  const { addOrder } = useOrders();

  const [deliveryMethod, setDeliveryMethod] = useState('courier');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+7',
    address: '',
    city: '',
    postalCode: '',
    comment: ''
  });

  const deliveryPrice = deliveryMethod === 'courier' ? 350 : deliveryMethod === 'pickup' ? 0 : 500;
  const totalWithDelivery = cartTotal + deliveryPrice;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/profile?tab=checkout');
      return;
    }
    
    if (cart.length === 0) {
      alert('Корзина пуста');
      return;
    }
    
    addOrder({
      items: cart,
      total: totalWithDelivery,
      status: 'pending',
      deliveryMethod: deliveryMethod === 'courier' ? 'Курьером' : deliveryMethod === 'pickup' ? 'Самовывоз' : 'Почтой России',
      paymentMethod: paymentMethod === 'card' ? 'Банковская карта' : paymentMethod === 'cash' ? 'Наличными' : 'СБП',
      address: `${formData.city}, ${formData.address}`
    });
    
    alert('Заказ оформлен!');
    clearCart();
    navigate('/profile?tab=orders');
  };

  if (!isAuthenticated) {
    return (
      <div className="checkout-page">
        <Header 
          title="Оформление заказа" 
          subtitle="" 
          showOverlay={false} 
          showOnlyNav={true} 
        />
        <main className="checkout-main">
          <div className="checkout-container">
            <div className="auth-required">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="#999">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <h2>Требуется авторизация</h2>
              <p>Для оформления заказа необходимо войти в аккаунт</p>
              <button className="auth-btn" onClick={() => navigate('/profile?tab=checkout')}>
                Войти или зарегистрироваться
              </button>
              <button className="back-btn" onClick={() => navigate(-1)}>
                Вернуться назад
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <Header 
          title="Оформление заказа" 
          subtitle="" 
          showOverlay={false} 
          showOnlyNav={true} 
        />
        <main className="checkout-main">
          <div className="checkout-container">
            <div className="empty-cart">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="#999">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
              <h2>Корзина пуста</h2>
              <p>Добавьте товары в корзину чтобы оформить заказ</p>
              <button className="continue-btn" onClick={() => navigate('/')}>
                Перейти к покупкам
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Header 
        title="Оформление заказа" 
        subtitle="" 
        showOverlay={false} 
        showOnlyNav={true} 
      />
      
      <main className="checkout-main">
        <div className="checkout-container">
          <div className="checkout-grid">
            <div className="checkout-form">
              <form>
                <div className="form-section">
                  <h3>Контактные данные</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Имя *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        placeholder="Введите имя"
                      />
                    </div>
                    <div className="form-group">
                      <label>Фамилия *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        placeholder="Введите фамилию"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="example@mail.ru"
                      />
                    </div>
                    <div className="form-group">
                      <label>Телефон *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="+7 (___) ___-__-__"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Доставка</h3>
                  <div className="delivery-options">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="delivery"
                        value="courier"
                        checked={deliveryMethod === 'courier'}
                        onChange={() => setDeliveryMethod('courier')}
                      />
                      <span>Курьером</span>
                      <span className="delivery-price">350 ₽</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="delivery"
                        value="pickup"
                        checked={deliveryMethod === 'pickup'}
                        onChange={() => setDeliveryMethod('pickup')}
                      />
                      <span>Самовывоз</span>
                      <span className="delivery-price">Бесплатно</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="delivery"
                        value="post"
                        checked={deliveryMethod === 'post'}
                        onChange={() => setDeliveryMethod('post')}
                      />
                      <span>Почтой России</span>
                      <span className="delivery-price">500 ₽</span>
                    </label>
                  </div>

                  {(deliveryMethod === 'courier' || deliveryMethod === 'post') && (
                    <>
                      <div className="form-group">
                        <label>Город *</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          placeholder="Введите город"
                        />
                      </div>
                      <div className="form-group">
                        <label>Адрес *</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          placeholder="Улица, дом, квартира"
                        />
                      </div>
                      <div className="form-group">
                        <label>Почтовый индекс</label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          placeholder="123456"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="form-section">
                  <h3>Оплата</h3>
                  <div className="payment-options">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                      />
                      <span>Банковская карта</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                      />
                      <span>Наличными при получении</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="payment"
                        value="sbp"
                        checked={paymentMethod === 'sbp'}
                        onChange={() => setPaymentMethod('sbp')}
                      />
                      <span>СБП</span>
                    </label>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Комментарий к заказу</h3>
                  <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    placeholder="Пожелания к заказу, удобное время доставки..."
                    rows={3}
                  />
                </div>
              </form>
            </div>

            <div className="checkout-summary">
              <h3>Ваш заказ</h3>
              <div className="summary-items">
                {cart.map(item => (
                  <div key={item.id} className="summary-item">
                    <img src={item.image} alt={item.name} />
                    <div className="summary-item-info">
                      <div className="summary-item-name">{item.name}</div>
                      <div className="summary-item-brand">{item.brand}</div>
                      <div className="summary-item-price">{item.price.toLocaleString()} ₽</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="summary-total">
                <div className="summary-row">
                  <span>Товары ({cart.length})</span>
                  <span>{cartTotal.toLocaleString()} ₽</span>
                </div>
                <div className="summary-row">
                  <span>Доставка</span>
                  <span>{deliveryPrice === 0 ? 'Бесплатно' : deliveryPrice.toLocaleString() + ' ₽'}</span>
                </div>
                <div className="summary-row total">
                  <span>Итого</span>
                  <span>{totalWithDelivery.toLocaleString()} ₽</span>
                </div>
              </div>
              <button className="order-btn" onClick={handleSubmit}>
                Оформить заказ
              </button>
              <button className="back-to-cart" onClick={() => navigate(-1)}>
                Вернуться в корзину
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};