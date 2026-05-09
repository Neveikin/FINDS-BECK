import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../app/providers/CartProvider';
import './CartModal.css';

interface CartModalProps {
  onClose: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ onClose }) => {
  const { cart, removeFromCart, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content cart-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Корзина</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-state">
            <p>Корзина пуста</p>
            <button className="continue-btn" onClick={onClose}>Продолжить покупки</button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="item-image" />
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p className="item-brand">{item.brand}</p>
                    <p className="item-price">{item.price.toLocaleString()} ₽</p>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>×</button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Итого:</span>
                <span className="total-price">{cartTotal.toLocaleString()} ₽</span>
              </div>
              <div className="cart-actions">
                <button className="clear-btn" onClick={clearCart}>Очистить</button>
                <button className="checkout-btn" onClick={() => {
                  onClose();
                  navigate('/checkout');
                }}>Оформить заказ</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};