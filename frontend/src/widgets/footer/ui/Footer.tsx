import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleNavigation = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">По сотрудничеству</h3>
          <ul className="footer-contacts">
            <li className="contact-item">
              <span className="contact-label">Телефон:</span>
              <a href="tel:+78805553535" className="contact-link">+7 (880) 555-35-35</a>
            </li>
            <li className="contact-item">
              <span className="contact-label">Telegram:</span>
              <a href="https://t.me/finds_brand" className="contact-link" target="_blank" rel="noopener noreferrer">@finds_brand</a>
            </li>
            <li className="contact-item">
              <span className="contact-label">Почта:</span>
              <a href="mailto:info@finds.ru" className="contact-link">info@finds.ru</a>
            </li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3 className="footer-title">Социальные сети</h3>
          <div className="social-links">
            <a href="https://vk.com" className="social-link" target="_blank" rel="noopener noreferrer">VK</a>
            <a href="https://t.me" className="social-link" target="_blank" rel="noopener noreferrer">Telegram</a>

          </div>
        </div>
        
        <div className="footer-section">
          <h3 className="footer-title">Информация</h3>
          <ul className="footer-links">
            <li><button className="footer-link" onClick={() => handleNavigation('/')}>Главная</button></li>
            <li><button className="footer-link" onClick={() => handleNavigation('/category/all')}>Каталог</button></li>
            <li><button className="footer-link" onClick={() => handleNavigation('/all-brands')}>Бренды</button></li>
            <li><button className="footer-link" onClick={() => handleNavigation('/profile')}>Личный кабинет</button></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p className="copyright">© {currentYear} Finds. Все права защищены.</p>
      </div>
    </footer>
  );
};