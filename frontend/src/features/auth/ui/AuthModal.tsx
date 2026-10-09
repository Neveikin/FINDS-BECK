import React, { useState } from 'react';
import { useSimpleAuth } from '../../../app/providers/SimpleAuthProvider';
import { EmailConfirmationModal } from './EmailConfirmationModal';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);

  const { login, register } = useSimpleAuth();
  const { executeRecaptcha } = useGoogleReCaptcha();

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
      if (!acceptedTerms) {
        setError('Необходимо принять пользовательское соглашение и политику конфиденциальности');
        return;
      }

      if (password !== confirmPassword) {
        setError('Пароли не совпадают');
        return;
      }

      let recaptchaToken = 'mock-recaptcha-token';
      if (executeRecaptcha) {
        try {
          recaptchaToken = await executeRecaptcha('register');
        } catch (err) {
          console.warn('reCAPTCHA execution failed, falling back to mock token:', err);
        }
      }

      try {
        console.log('Registration data:', { name, email, password, confirmPassword, recaptchaToken });
        const success = await register(name, email, password, confirmPassword, recaptchaToken);
        if (success) {
          setShowEmailConfirmation(true);
        } else {
          setError('Ошибка при регистрации');
        }
      } catch (err) {
        setError('Ошибка при регистрации на сервере');
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

            {!isLogin && (
              <div className="form-group terms-checkbox-group" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '15px', marginBottom: '15px' }}>
                <input
                  type="checkbox"
                  id="terms-checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  style={{ marginTop: '4px', cursor: 'pointer' }}
                  required
                />
                <label htmlFor="terms-checkbox" style={{ fontSize: '13px', color: '#666', lineHeight: '1.4', cursor: 'pointer', userSelect: 'none' }}>
                  Я согласен с{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'underline' }}>
                    Пользовательским соглашением
                  </a>{' '}
                  и{' '}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'underline' }}>
                    Политикой обработки персональных данных
                  </a>
                </label>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-btn" disabled={!isLogin && !acceptedTerms}>
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