import React, { useState } from 'react';
import { useSimpleAuth } from '../../../app/providers/SimpleAuthProvider';
import { EmailConfirmationModal } from './EmailConfirmationModal';
import './AuthModal.css';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  
  const { login, register } = useSimpleAuth();

  const handleEmailConfirmationSuccess = () => {
    setShowEmailConfirmation(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const success = await login(email, password);
      if (success) {
        onClose();
      } else {
        setError('Неверный email или пароль');
      }
    } else {
      if (password !== confirmPassword) {
        setError('Пароли не совпадают');
        return;
      }
      console.log('Registration data:', { name, email, password, confirmPassword });
      const success = await register(name, email, password, confirmPassword);
      if (success) {
        setShowEmailConfirmation(true);
      } else {
        setError('Ошибка при регистрации');
      }
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content auth-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{isLogin ? 'Вход' : 'Регистрация'}</h3>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label>Имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Введите ваше имя"
                />
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Введите email"
              />
            </div>

            <div className="form-group">
              <label>Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Введите пароль"
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label>Подтвердите пароль</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Введите пароль еще раз"
                />
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-btn">
              {isLogin ? 'Войти' : 'Зарегистрироваться'}
            </button>

            <button 
              type="button" 
              className="toggle-btn"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
            </button>
          </form>
        </div>
      </div>

      {showEmailConfirmation && (
        <EmailConfirmationModal
          email={email}
          onClose={() => setShowEmailConfirmation(false)}
          onSuccess={handleEmailConfirmationSuccess}
        />
      )}
    </>
  );
};