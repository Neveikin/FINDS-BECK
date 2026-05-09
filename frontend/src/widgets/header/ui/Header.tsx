import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../../app/providers/CartProvider';
import { useFavorites } from '../../../app/providers/FavoritesProvider';
import { useSimpleAuth } from '../../../app/providers/SimpleAuthProvider';
import { CartModal } from '../../../features/cart/ui/CartModal';
import { AuthModal } from '../../../features/auth/ui/AuthModal';
import { SearchModal } from '../../../features/search/ui/SearchModal';
import './Header.css';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  showOverlay?: boolean;
  showOnlyNav?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = 'FINDS', 
  subtitle = 'Место, где начинаются новые открытия',
  backgroundImage,
  showOverlay,
  showOnlyNav = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const finalBackgroundImage = backgroundImage || (location.pathname === '/' ? '/images-main/header-img.png' : '');
  const menuRef = useRef<HTMLDivElement>(null);
  
  const { cartCount } = useCart();
  const { favoritesCount } = useFavorites();
  const { user, logout } = useSimpleAuth();
  
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const shouldShowOverlay = location.pathname === '/' && showOverlay !== false && !showOnlyNav;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (path: string) => {
    setShowUserMenu(false);
    navigate(path);
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate('/');
  };

  const handleFavoritesClick = () => {
    navigate('/profile?tab=favorites');
  };

  return (
    <>
      <header className={`header ${showOnlyNav ? 'header-only-nav' : ''}`}>
        {!showOnlyNav && <img className="header-image" src={finalBackgroundImage} alt="Finds" />}
        
        <nav className="home-icon-left">
          <div className="icon-wrapper" onClick={() => handleNavigation('/')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM4 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Z"/>
            </svg>
          </div>
        </nav>

        <nav className="nav-icons">
          <div className="icon-wrapper" onClick={handleFavoritesClick}>
            {favoritesCount > 0 && <span className="badge">{favoritesCount}</span>}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
            </svg>
          </div>

          <div className="icon-wrapper" onClick={() => user ? setShowUserMenu(!showUserMenu) : setShowAuth(true)}>
            {user && <span className="online-indicator"></span>}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16">
              <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
              <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
            </svg>
          </div>

          <div className="icon-wrapper" onClick={() => setShowSearch(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
          </div>

          <div className="icon-wrapper" onClick={() => setShowCart(true)}>
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16">
              <path d="M5.757 1.071a.5.5 0 0 1 .172.686L3.383 6h9.234L10.07 1.757a.5.5 0 1 1 .858-.514L13.783 6H15a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1v4.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 13.5V9a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1.217L5.07 1.243a.5.5 0 0 1 .686-.172zM2 9v4.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V9H2zM1 7v1h14V7H1z"/>
            </svg>
          </div>
        </nav>

        {showUserMenu && user && (
          <div className="user-menu" ref={menuRef}>
            <div className="user-info">
              <img src={user.avatar || '/images/default-avatar.jpg'} alt={user.name} className="user-avatar" />
              <span className="user-name">{user.name}</span>
            </div>
                        <button className="menu-item" onClick={() => handleNavigation('/profile')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              </svg>
              Личный кабинет
            </button>
            <button className="menu-item" onClick={() => handleNavigation('/profile?tab=orders')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5z"/>
              </svg>
              Мои заказы
            </button>
            <button className="menu-item" onClick={() => handleNavigation('/profile?tab=notifications')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
              </svg>
              Уведомления
            </button>
            <button className="menu-item" onClick={() => handleNavigation('/profile?tab=favorites')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
              </svg>
              Избранное
              {favoritesCount > 0 && <span className="menu-badge">{favoritesCount}</span>}
            </button>
            <button className="menu-item" onClick={() => handleNavigation('/profile?tab=seller')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
              </svg>
              Стать продавцом
            </button>
            <button className="menu-item logout" onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
              </svg>
              Выйти
            </button>
          </div>
        )}
        
        {shouldShowOverlay && <div className="header-text-overlay"></div>}
        
        {!showOnlyNav && <h1 className="header-title">{title}</h1>}
        {!showOnlyNav && subtitle && <h2 className="header-subtitle">{subtitle}</h2>}
      </header>

      {showCart && <CartModal onClose={() => setShowCart(false)} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </>
  );
};