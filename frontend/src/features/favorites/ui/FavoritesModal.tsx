import React from 'react';
import { useFavorites } from '../../../app/providers/FavoritesProvider';
import { useNavigate } from 'react-router-dom';
import './FavoritesModal.css';

interface FavoritesModalProps {
  onClose: () => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({ onClose }) => {
  const { favorites, removeFromFavorites } = useFavorites();
  const navigate = useNavigate();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content favorites-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Избранное</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {favorites.length === 0 ? (
          <div className="empty-state">
            <p>В избранном пока ничего нет</p>
            <button className="continue-btn" onClick={onClose}>Продолжить покупки</button>
          </div>
        ) : (
          <div className="favorites-items">
            {favorites.map(item => (
              <div key={item.id} className="favorite-item">
                <img src={item.image} alt={item.name} className="item-image" />
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p className="item-brand">{item.brand}</p>
                  <p className="item-price">{item.price.toLocaleString()} ₽</p>
                </div>
                <button className="remove-btn" onClick={() => removeFromFavorites(item.id)}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};