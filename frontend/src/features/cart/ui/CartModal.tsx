import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../app/providers/CartProvider';
import './CartModal.css';

interface CartModalProps {
  onClose: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ onClose }) => {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
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
                  <img src={item.product.image} alt={item.product.name} className="item-image" />
                  <div className="item-details">
                    <h4>{item.product.name}</h4>
                    <p className="item-brand">{item.product.brand}</p>
                    <div className="item-variants">
                      {item.size && <span className="variant">Размер: {item.size}</span>}
                      {item.color && <span className="variant">Цвет: {item.color}</span>}
                    </div>
                    <p className="item-price">{(item.product.price || 0).toLocaleString()} ₽</p>
                    
                    <div className="quantity-controls">
                      <button 
                        className="qty-btn" 
                        onClick={() => updateQuantity(item.product.id, -1, item.size, item.color)}
                      >
                        -
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button 
                        className="qty-btn" 
                        onClick={() => updateQuantity(item.product.id, 1, item.size, item.color)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.product.id, item.size, item.color)}>×</button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Итого:</span>
                <span className="total-price">{(cartTotal || 0).toLocaleString()} ₽</span>
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