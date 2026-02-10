// Конфигурация API
const API_CONFIG = {
    BASE_URL: 'http://localhost:8090',
    ENDPOINTS: {
        AUTH: {
            SIGNIN: '/api/auth/signin',
            SIGNUP: '/api/auth/signup',
            REFRESH: '/api/auth/refresh'
        },
        USER: {
            GET_PROFILE: '/api/lk/me/get',
            UPDATE_EMAIL: '/api/lk/me/email',
            UPDATE_NAME: '/api/lk/me/name',
            UPDATE_PASSWORD: '/api/lk/me/password'
        }
    },
    TOKEN_KEYS: {
        ACCESS: 'token',
        REFRESH: 'refreshToken',
        USER: 'user'
    }
};

// Управление токенами
class TokenManager {
    static getAccessToken() {
        return localStorage.getItem(API_CONFIG.TOKEN_KEYS.ACCESS);
    }

    static getRefreshToken() {
        return localStorage.getItem(API_CONFIG.TOKEN_KEYS.REFRESH);
    }

    static setTokens(accessToken, refreshToken) {
        localStorage.setItem(API_CONFIG.TOKEN_KEYS.ACCESS, accessToken);
        if (refreshToken) {
            localStorage.setItem(API_CONFIG.TOKEN_KEYS.REFRESH, refreshToken);
        }
    }

    static setUser(userData) {
        localStorage.setItem(API_CONFIG.TOKEN_KEYS.USER, JSON.stringify(userData));
    }

    static getUser() {
        const userStr = localStorage.getItem(API_CONFIG.TOKEN_KEYS.USER);
        return userStr ? JSON.parse(userStr) : null;
    }

    static clearAll() {
        localStorage.removeItem(API_CONFIG.TOKEN_KEYS.ACCESS);
        localStorage.removeItem(API_CONFIG.TOKEN_KEYS.REFRESH);
        localStorage.removeItem(API_CONFIG.TOKEN_KEYS.USER);
    }

    static isAuthenticated() {
        return !!this.getAccessToken();
    }
}

// HTTP клиент для API запросов
class ApiClient {
    static async request(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        const token = TokenManager.getAccessToken();
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            
            // Если токен истек (401), пытаемся обновить
            if (response.status === 401 && !options._retry) {
                const newToken = await this.refreshToken();
                if (newToken) {
                    // Повторяем запрос с новым токеном
                    config.headers['Authorization'] = `Bearer ${newToken}`;
                    config._retry = true;
                    return this.request(endpoint, config);
                }
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    static async refreshToken() {
        const refreshToken = TokenManager.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken })
            });

            const data = await response.json();
            
            if (response.ok) {
                TokenManager.setTokens(data.accesToken, data.refershToken);
                return data.accesToken;
            } else {
                throw new Error(data.message || 'Token refresh failed');
            }
        } catch (error) {
            // Если обновление не удалось - очищаем токены и перенаправляем на вход
            TokenManager.clearAll();
            window.location.href = 'index.html';
            throw error;
        }
    }

    // Удобные методы для разных типов запросов
    static get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    static post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    static put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Валидация
class Validator {
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidPassword(password) {
        return password && password.length >= 6;
    }

    static isValidName(name) {
        return name && name.length >= 2 && name.length <= 100;
    }
}

// Управление сообщениями
class MessageManager {
    static show(containerId, message, type = 'error') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;
        
        container.innerHTML = '';
        container.appendChild(messageDiv);
        
        // Автоматически скрыть через 5 секунд
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    static hide(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
        }
    }

    // Новые методы для уведомлений
    static showNotification(title, message, type = 'info', duration = 5000) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };

        notification.innerHTML = `
            <i class="fas ${iconMap[type] || iconMap.info}"></i>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(notification);

        // Автоматически скрыть через duration
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }

    static showSuccess(message, title = 'Успешно') {
        this.showNotification(title, message, 'success');
    }

    static showError(message, title = 'Ошибка') {
        this.showNotification(title, message, 'error', 7000);
    }

    static showInfo(message, title = 'Информация') {
        this.showNotification(title, message, 'info');
    }

    static showWarning(message, title = 'Предупреждение') {
        this.showNotification(title, message, 'warning');
    }
}

// Управление маршрутизацией
class Router {
    static requireAuth() {
        if (!TokenManager.isAuthenticated()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    static redirectIfAuthenticated() {
        if (TokenManager.isAuthenticated()) {
            window.location.href = 'dashboard.html';
            return false;
        }
        return true;
    }
}

// Глобальные обработчики ошибок
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // Показываем пользователю только критические ошибки
    if (event.error.message.includes('fetch') || event.error.message.includes('network')) {
        const errorContainer = document.getElementById('error-container') || document.getElementById('message');
        if (errorContainer) {
            errorContainer.textContent = 'Ошибка подключения к серверу. Проверьте интернет-соединение.';
            errorContainer.className = 'error-message';
            errorContainer.style.display = 'block';
        }
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Показываем пользователю только критические ошибки
    if (event.reason.message && event.reason.message.includes('fetch')) {
        const errorContainer = document.getElementById('error-container') || document.getElementById('message');
        if (errorContainer) {
            errorContainer.textContent = 'Ошибка подключения к серверу. Проверьте интернет-соединение.';
            errorContainer.className = 'error-message';
            errorContainer.style.display = 'block';
        }
    }
    event.preventDefault(); // Предотвращаем вывод в консоль
});

// Инициализация приложения
class App {
    static init() {
        // Проверка авторизации при загрузке
        this.checkAuthStatus();
    }

    static checkAuthStatus() {
        const currentPath = window.location.pathname;
        const isLoginPage = currentPath.includes('login.html') || 
                           currentPath.includes('register.html');
        const isDashboardPage = currentPath.includes('dashboard.html');
        const isMainPage = currentPath === '/' || 
                          currentPath === '' || 
                          currentPath.endsWith('index.html') ||
                          currentPath.endsWith('/');
        
        console.log('Checking auth status for:', currentPath);
        console.log('Is login page:', isLoginPage);
        console.log('Is dashboard page:', isDashboardPage);
        console.log('Is main page:', isMainPage);
        console.log('Is authenticated:', TokenManager.isAuthenticated());
        
        if (isLoginPage) {
            // Если пользователь авторизован и пытается зайти на страницу входа/регистрации
            if (TokenManager.isAuthenticated()) {
                console.log('Redirecting authenticated user from login page to dashboard');
                window.location.href = 'dashboard.html';
                return false;
            }
        } else if (isDashboardPage) {
            // Проверяем авторизацию для личного кабинета
            if (!TokenManager.isAuthenticated()) {
                console.log('Redirecting unauthenticated user from dashboard to main page');
                window.location.href = 'index.html';
                return false;
            }
        }
        // Для главной страницы и других страниц не делаем проверку - разрешаем доступ всем
        console.log('No auth redirect needed for this page');
        return true;
    }

    static logout() {
        TokenManager.clearAll();
        window.location.href = 'index.html';
    }
}

// Экспорт для использования в других файлах
window.API_CONFIG = API_CONFIG;
window.TokenManager = TokenManager;
window.ApiClient = ApiClient;
window.Validator = Validator;
window.MessageManager = MessageManager;
window.Router = Router;
window.App = App;

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
