// Управление хедером и авторизацией
class HeaderManager {
    constructor() {
        this.authButtons = document.getElementById('auth-buttons');
        this.userMenu = document.getElementById('user-menu');
        this.userAvatar = document.getElementById('user-avatar');
        this.userDropdown = document.getElementById('user-dropdown');
        this.logoutBtn = document.getElementById('logout-btn');
        
        this.init();
    }

    init() {
        this.updateAuthSection();
        this.setupEventListeners();
    }

    updateAuthSection() {
        const isAuthenticated = TokenManager.isAuthenticated();
        
        if (isAuthenticated) {
            // Показываем меню пользователя
            this.authButtons.style.display = 'none';
            this.userMenu.style.display = 'block';
            
            // Загружаем данные пользователя для аватара
            const userData = TokenManager.getUser();
            if (userData && userData.name) {
                this.userAvatar.innerHTML = userData.name.charAt(0).toUpperCase();
            }
        } else {
            // Показываем кнопки входа/регистрации
            this.authButtons.style.display = 'flex';
            this.userMenu.style.display = 'none';
        }
    }

    setupEventListeners() {
        // Клик на аватар - показываем/скрываем дропдаун
        if (this.userAvatar) {
            this.userAvatar.addEventListener('click', (e) => {
                e.stopPropagation();
                this.userDropdown.style.display = 
                    this.userDropdown.style.display === 'block' ? 'none' : 'block';
            });
        }

        // Клик на кнопку выхода
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Закрытие дропдауна при клике вне его
        document.addEventListener('click', (e) => {
            if (!this.userMenu.contains(e.target)) {
                this.userDropdown.style.display = 'none';
            }
        });
    }

    logout() {
        TokenManager.clearAll();
        this.updateAuthSection();
        
        // Показываем сообщение об успешном выходе
        MessageManager.show('success-container', 'Вы успешно вышли из системы', 'success');
        
        // Перенаправляем на главную через 1 секунду
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Глобальная функция для выхода (может быть вызвана из других скриптов)
function logout() {
    TokenManager.clearAll();
    window.location.href = 'index.html';
}
