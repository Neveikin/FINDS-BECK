import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../../widgets/header';
import { Footer } from '../../../widgets/footer/ui/Footer';
import { useOrders } from '../../../app/providers/OrdersProvider';
import './OrderPage.css';

export const OrderPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getOrderById } = useOrders();

  const order = getOrderById(orderId || '');

  if (!order) {
    return (
      <div className="order-not-found">
        <Header title="Заказ не найден" subtitle="" showOverlay={false} />
        <main className="order-main">
          <div className="order-container">
            <div className="not-found-content">
              <h1>Заказ не найден</h1>
              <button onClick={() => navigate('/profile?tab=orders')}>
                Вернуться к заказам
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending': return 'Ожидает оплаты';
      case 'processing': return 'В обработке';
      case 'shipped': return 'Отправлен';
      case 'delivered': return 'Доставлен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const getDeliveryMethodText = (method: string) => {
    switch(method) {
      case 'Курьером': return 'Курьером';
      case 'Самовывоз': return 'Самовывоз';
      case 'Почтой России': return 'Почтой России';
      default: return method;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch(method) {
      case 'Банковская карта': return 'Банковская карта';
      case 'Наличными': return 'Наличными при получении';
      case 'СБП': return 'СБП';
      default: return method;
    }
  };

  return (
    <div className="order-page">
      <Header title="Детали заказа" subtitle="" showOverlay={false} showOnlyNav={true} />
      
      <main className="order-main">
        <div className="order-container">
          <button className="back-button" onClick={() => navigate('/profile?tab=orders')}>
            ← Вернуться к заказам
          </button>

          <div className="order-details-card">
            <div className="order-details-header">
              <div>
                <h1 className="order-number">Заказ #{order.id.slice(-8)}</h1>
                <p className="order-date">Оформлен: {new Date(order.date).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              <div className={`order-status-badge ${getStatusClass(order.status)}`}>
                {getStatusText(order.status)}
              </div>
            </div>

            <div className="order-info-section">
              <h3>Информация о доставке</h3>
              <div className="info-grid">
                <div className="info-row">
                  <div className="info-label">Способ доставки</div>
                  <div className="info-value">{getDeliveryMethodText(order.deliveryMethod)}</div>
                </div>
                {order.address && order.address !== ',' && order.address !== '' && (
                  <div className="info-row">
                    <div className="info-label">Адрес доставки</div>
                    <div className="info-value">{order.address}</div>
                  </div>
                )}
                <div className="info-row">
                  <div className="info-label">Способ оплаты</div>
                  <div className="info-value">{getPaymentMethodText(order.paymentMethod)}</div>
                </div>
              </div>
            </div>

            <div className="order-items-section">
              <h3>Состав заказа</h3>
              <div className="order-items-list">
                {order.items.map(item => (
                  <div key={item.id} className="order-item-detail" onClick={() => navigate(`/product/${item.id}`)}>
                    <img src={item.image} alt={item.name} className="order-item-image" />
                    <div className="order-item-detail-info">
                      <div className="order-item-name">{item.name}</div>
                      <div className="order-item-brand">{item.brand}</div>
                      <div className="order-item-price">{item.price.toLocaleString()} ₽</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Товары ({order.items.length})</span>
                <span>{order.items.reduce((sum, item) => sum + item.price, 0).toLocaleString()} ₽</span>
              </div>
              <div className="summary-row">
                <span>Доставка</span>
                <span>Бесплатно</span>
              </div>
              <div className="summary-row total">
                <span>Итого</span>
                <span>{order.total.toLocaleString()} ₽</span>
              </div>
            </div>

            <button className="continue-shopping" onClick={() => navigate('/')}>
              Продолжить покупки
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};