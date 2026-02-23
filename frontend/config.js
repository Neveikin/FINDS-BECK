// Конфигурация API URL в зависимости от окружения
const API_CONFIG = {
    // Для локальной разработки
    development: 'http://localhost:8090/api',
    
    // Для Docker окружения (через nginx)
    docker: '/api',
    
    // Для production
    production: 'https://finds-shop.ru/api'
};

// Определяем текущее окружение
function getApiBaseUrl() {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' && window.location.port === '80') {
        // Docker окружение (nginx на порту 80)
        return API_CONFIG.docker;
    } else if (hostname === 'localhost' && window.location.port === '3000') {
        // Локальная разработка
        return API_CONFIG.development;
    } else if (hostname === 'finds-shop.ru' || hostname === 'www.finds-shop.ru') {
        // Production домен
        return API_CONFIG.production;
    } else {
        // По умолчанию для production
        return API_CONFIG.production;
    }
}

// Экспортируем базовый URL API
const API_BASE = getApiBaseUrl();

// Для отладки
console.log('API Base URL:', API_BASE);
