// Утилиты для работы с cookie на фронтенде

class CookieManager {
    // Получить значение cookie по имени
    static getCookie(name) {
        const matches = document.cookie.match(
            new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
        );
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    // Установить cookie
    static setCookie(name, value, options = {}) {
        options = {
            path: '/',
            ...options
        };

        if (options.expires instanceof Date) {
            options.expires = options.expires.toUTCString();
        }

        let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

        for (let optionKey in options) {
            updatedCookie += "; " + optionKey;
            let optionValue = options[optionKey];
            if (optionValue !== true) {
                updatedCookie += "=" + optionValue;
            }
        }

        document.cookie = updatedCookie;
    }

    // Удалить cookie
    static deleteCookie(name) {
        this.setCookie(name, "", {
            'max-age': -1
        });
    }

    // Проверить авторизацию
    static isAuthenticated() {
        const userEmail = this.getCookie('user');
        return userEmail && userEmail !== '';
    }

    // Получить email пользователя
    static getUserEmail() {
        return this.getCookie('user');
    }

    // Выйти из системы
    static logout() {
        this.deleteCookie('accessToken');
        this.deleteCookie('refreshToken');
        this.deleteCookie('user');
    }
}

// Экспортируем для использования в других скриптах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CookieManager;
} else {
    window.CookieManager = CookieManager;
}
