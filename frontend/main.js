// Основные функции приложения
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Проверяем авторизацию и обновляем UI
    await updateAuthUI();
    
    // Добавляем обработчики событий
    setupEventListeners();
    
    // Инициализируем компоненты
    initializeComponents();
}

async function updateAuthUI() {
    const authSection = document.getElementById('auth-section');
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    
    console.log('updateAuthUI called for page:', window.location.pathname);
    
    if (!authSection) return;
    
    if (isAuthenticated()) {
        console.log('User is authenticated, checking data...');
        
        // Сначала получаем данные из localStorage для быстрой проверки
        let userData = getUserDataSync();
        console.log('Cached user data:', userData);
        
        // Если данных нет или они неполные, пробуем загрузить с бэкенда
        if (!userData || !userData.email) {
            console.log('No valid cached data, fetching from backend...');
            userData = await getUserData();
        }
        
        if (!userData) {
            console.log('No user data available, redirecting to login');
            // Если и после этого нет данных, перенаправляем на вход
            if (authButtons) authButtons.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
            
            if (window.location.pathname.includes('dashboard.html') || 
                window.location.pathname.includes('admin.html')) {
                window.location.href = 'login.html';
            }
            return;
        }
        
        console.log('User data found:', userData);
        
        // Показываем меню пользователя
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        
        // Обновляем аватар
        const userAvatar = document.getElementById('user-avatar');
        if (userAvatar && userData) {
            userAvatar.innerHTML = userData.name ? userData.name.charAt(0).toUpperCase() : '<i class="fas fa-user"></i>';
        }
        
        // Обновляем имя пользователя в dropdown
        const userNameElement = document.getElementById('user-name');
        if (userNameElement && userData) {
            userNameElement.textContent = userData.name || 'Пользователь';
        }
        
        // Показываем/скрываем админ панель для ADMIN
        const adminLinks = document.querySelectorAll('.admin-link');
        adminLinks.forEach(link => {
            if (userData && userData.role === 'ADMIN') {
                link.style.display = 'block';
            } else {
                link.style.display = 'none';
            }
        });
        
        // Перенаправляем не-админов с админ страниц
        if (window.location.pathname.includes('admin.html') && userData.role !== 'ADMIN') {
            console.log('Non-admin trying to access admin page, redirecting...');
            window.location.href = 'dashboard.html';
        }
    } else {
        console.log('User is not authenticated');
        
        // Показываем кнопки входа/регистрации
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        
        // Скрываем админ ссылки
        const adminLinks = document.querySelectorAll('.admin-link');
        adminLinks.forEach(link => {
            link.style.display = 'none';
        });
        
        // Перенаправляем неавторизованных с защищенных страниц
        if (window.location.pathname.includes('dashboard.html') || 
            window.location.pathname.includes('admin.html')) {
            console.log('Unauthenticated user on protected page, redirecting to login...');
            window.location.href = 'login.html';
        }
    }
}

function setupEventListeners() {
    // Обработчик для кнопки выхода
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    // Обработчик для dropdown меню
    const userAvatar = document.getElementById('user-avatar');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userAvatar && userDropdown) {
        userAvatar.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        // Закрываем dropdown при клике вне его
        document.addEventListener('click', () => {
            userDropdown.classList.remove('show');
        });
        
        userDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // Обработчики для мобильного меню
    setupMobileMenu();
}

function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }
}

function initializeComponents() {
    // Инициализация tooltips
    initializeTooltips();
    
    // Инициализация модальных окон
    initializeModals();
    
    // Инициализация форм
    initializeForms();
}

function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = e.target.getAttribute('data-tooltip');
            document.body.appendChild(tooltip);
            
            const rect = e.target.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
            
            e.target.tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', (e) => {
            if (e.target.tooltip) {
                e.target.tooltip.remove();
                delete e.target.tooltip;
            }
        });
    });
}

function initializeModals() {
    const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
    const modalCloses = document.querySelectorAll('[data-modal-close]');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal-trigger');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    modalCloses.forEach(close => {
        close.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = close.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Закрытие модальных окон по клику на фон
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
}

function initializeForms() {
    const forms = document.querySelectorAll('form[data-ajax]');
    
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Показываем загрузку
            submitBtn.disabled = true;
            submitBtn.textContent = 'Загрузка...';
            
            try {
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                const response = await fetch(form.action, {
                    method: form.method,
                    headers: getAuthHeaders(),
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    // Показываем успех
                    showNotification('Успешно!', 'success');
                    
                    // Выполняем действие после успешной отправки
                    const onSuccess = form.getAttribute('data-on-success');
                    if (onSuccess) {
                        eval(onSuccess);
                    }
                } else {
                    showNotification(result.message || 'Ошибка', 'error');
                }
            } catch (error) {
                showNotification('Ошибка соединения', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Автоматическое скрытие
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Вспомогательные функции
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
    }).format(price);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ru-RU');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Экспорт функций для использования в других файлах
window.appUtils = {
    showNotification,
    formatPrice,
    formatDate,
    debounce,
    isAuthenticated,
    getUserData,
    logout
};
