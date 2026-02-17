// Конфигурация приложения
const CONFIG = {
    // API URL
    API_BASE_URL: 'http://localhost:8090/api',
    
    // URL для авторизации
    LOGIN_URL: 'http://localhost:8090/api/auth/signin',
    REGISTER_URL: 'http://localhost:8090/api/auth/signup',
    
    // URL для магазинов и товаров
    SHOPS_URL: 'http://localhost:8090/api/shops',
    PRODUCTS_URL: 'http://localhost:8090/api/products',
    
    // URL для личного кабинета
    USER_PROFILE_URL: 'http://localhost:8090/api/lk/me/get',
    FAVORITES_URL: 'http://localhost:8090/api/favorites',
    
    // Настройки токена
    TOKEN_KEY: 'auth_token',
    USER_KEY: 'user_data',
    
    // Время жизни токена в миллисекундах (24 часа)
    TOKEN_EXPIRY_TIME: 24 * 60 * 60 * 1000,
    
    // Настройки приложения
    APP_NAME: 'FINDS',
    VERSION: '1.0.0',
    
    // Настройки пагинации
    ITEMS_PER_PAGE: 12,
    
    // Настройки для загрузки изображений
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
};

// Функция для получения заголовков с токеном
function getAuthHeaders() {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Функция для проверки авторизации
function isAuthenticated() {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    
    if (!token) {
        return false;
    }
    
    // Проверяем время жизни токена
    const tokenTimestamp = localStorage.getItem('token_timestamp');
    if (tokenTimestamp) {
        const elapsed = Date.now() - parseInt(tokenTimestamp);
        if (elapsed > CONFIG.TOKEN_EXPIRY_TIME) {
            logout();
            return false;
        }
    }
    
    return true;
}

// Функция для получения данных пользователя с бэкенда
async function getUserData() {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    if (!token) {
        console.log('No token found in localStorage');
        return null;
    }
    
    try {
        console.log('Fetching user data from:', CONFIG.USER_PROFILE_URL);
        console.log('Token:', token.substring(0, 20) + '...');
        
        const response = await fetch(`${CONFIG.USER_PROFILE_URL}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const userData = await response.json();
            console.log('User data received:', userData);
            localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(userData));
            return userData;
        } else {
            console.log('Failed to fetch user data, status:', response.status);
            // Если токен невалидный, удаляем его
            logout();
            return null;
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        // В случае ошибки пробуем получить из localStorage
        const cachedData = localStorage.getItem(CONFIG.USER_KEY);
        console.log('Using cached data:', cachedData);
        return cachedData ? JSON.parse(cachedData) : null;
    }
}

// Функция для выхода
function logout() {
    localStorage.removeItem(CONFIG.TOKEN_KEY);
    localStorage.removeItem(CONFIG.USER_KEY);
    localStorage.removeItem('token_timestamp');
    window.location.href = 'login.html';
}

// Функция для получения данных пользователя (синхронная, из localStorage)
function getUserDataSync() {
    const userData = localStorage.getItem(CONFIG.USER_KEY);
    return userData ? JSON.parse(userData) : null;
}

// Функция для сохранения данных пользователя
function saveUserData(userData, token) {
    localStorage.setItem(CONFIG.TOKEN_KEY, token);
    localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(userData));
    localStorage.setItem('token_timestamp', Date.now().toString());
}

// Экспорт конфигурации
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
