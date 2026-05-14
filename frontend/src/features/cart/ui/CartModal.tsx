import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../app/providers/CartProvider';
import { cartLineKey } from '../../../shared/types';
import './CartModal.css';

interface CartModalProps {
  onClose: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { cart, removeFromCart, clearCart, cartTotal, increaseQuantity, decreaseQuantity } = useCart();

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
                <div key={cartLineKey(item)} className="cart-item">
                  <img src={item.product.image} alt={item.product.name} className="item-image" />
                  <div className="item-details">
                    <h4>{item.product.name}</h4>
                    <p className="item-brand">{item.product.brand}</p>
                    {(item.size || item.color) && (
                      <div className="item-variant">
                        {item.size ? <span>Размер: {item.size}</span> : null}
                        {item.size && item.color ? <span className="variant-sep">·</span> : null}
                        {item.color ? <span>Цвет: {item.color}</span> : null}
                      </div>
                    )}
                    <p className="item-price">{item.product.price.toLocaleString()} ₽ / шт.</p>
                    <div className="item-qty-row">
                      <button
                        type="button"
                        className="qty-btn"
                        aria-label="Уменьшить"
                        onClick={() => void decreaseQuantity(item)}
                      >
                        −
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        type="button"
                        className="qty-btn"
                        aria-label="Увеличить"
                        onClick={() => void increaseQuantity(item)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button className="remove-btn" onClick={() => void removeFromCart(item)}>×</button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Итого:</span>
                <span className="total-price">{cartTotal.toLocaleString()} ₽</span>
              </div>
              <div className="cart-actions">
                <button className="clear-btn" onClick={() => void clearCart()}>Очистить</button>
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
