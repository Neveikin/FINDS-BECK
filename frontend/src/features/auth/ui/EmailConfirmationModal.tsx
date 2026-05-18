import React, { useState } from 'react';
import { authApi } from '../../../shared/api/auth';
import './EmailConfirmationModal.css';

interface EmailConfirmationModalProps {
  email: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const EmailConfirmationModal: React.FC<EmailConfirmationModalProps> = ({ 
  email, 
  onClose, 
  onSuccess 
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.verifyEmail({ email, code });
      console.log('Email verified successfully:', response);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Email verification failed:', error);
      setError('Неверный код подтверждения');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.resendVerificationCode({ email });
      console.log('Code resent successfully:', response);
      setError('Код отправлен повторно');
    } catch (error) {
      console.error('Resend code failed:', error);
      setError('Ошибка при отправке кода');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content email-confirmation-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Подтверждение email</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="confirmation-content">
          <p className="confirmation-message">
            Мы отправили код подтверждения на email: <strong>{email}</strong>
          </p>
          <p className="confirmation-instruction">
            Пожалуйста, введите код из письма для завершения регистрации
          </p>

          <form onSubmit={handleSubmit} className="confirmation-form">
            <div className="form-group">
              <label>Код подтверждения</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder="Введите 5-значный код"
                maxLength={5}
                pattern="[0-9]{5}"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Подтверждение...' : 'Подтвердить'}
            </button>

            <button 
              type="button" 
              className="resend-btn"
              onClick={handleResendCode}
              disabled={isLoading}
            >
              Отправить код повторно
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
