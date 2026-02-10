// Управление профилем пользователя
class ProfileManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Кнопки редактирования профиля
        document.querySelectorAll('.edit-btn[data-field]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Получаем поле из data-атрибута кнопки
                const field = e.target.closest('.edit-btn').dataset.field;
                console.log('Edit button clicked for field:', field);
                
                if (field) {
                    this.toggleEdit(field);
                }
            });
        });

        // Кнопка смены пароля
        const togglePasswordBtn = document.getElementById('toggle-password-form');
        if (togglePasswordBtn) {
            togglePasswordBtn.addEventListener('click', () => {
                this.togglePasswordForm();
            });
        }

        // Кнопки сохранения и отмены
        const saveBtns = document.querySelectorAll('.save-btn');
        const cancelBtns = document.querySelectorAll('.cancel-btn');
        
        saveBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const passwordForm = btn.closest('.password-form');
                if (passwordForm) {
                    this.changePassword();
                } else {
                    this.saveProfile();
                }
            });
        });
        
        cancelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const passwordForm = btn.closest('.password-form');
                if (passwordForm) {
                    this.togglePasswordForm();
                } else {
                    this.cancelEdit();
                }
            });
        });

        // Кнопки выхода и возврата
        document.querySelector('.logout-btn')?.addEventListener('click', () => App.logout());
        document.querySelector('.back-btn')?.addEventListener('click', () => window.location.href = 'index.html');
    }

    async loadUserData() {
        try {
            // Показываем токен
            const token = TokenManager.getAccessToken();
            const tokenDisplay = document.getElementById('token-display');
            console.log('Token from TokenManager:', token);
            
            if (tokenDisplay) {
                if (token) {
                    tokenDisplay.textContent = token;
                    console.log('Token displayed successfully, length:', token.length);
                } else {
                    tokenDisplay.textContent = 'Токен не найден';
                    console.log('No token found in TokenManager');
                    MessageManager.show('error-container', 'Токен авторизации не найден. Пожалуйста, войдите снова.', 'error');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 3000);
                    return;
                }
            } else {
                console.error('Token display element not found');
                MessageManager.show('error-container', 'Ошибка отображения токена. Перезагрузите страницу.', 'error');
            }

            // Получаем данные пользователя
            let userData = TokenManager.getUser();
            console.log('User data from localStorage:', userData);
            
            // Всегда загружаем свежие данные с сервера для актуальности
            console.log('Fetching fresh user data from server...');
            MessageManager.show('success-container', 'Загрузка данных пользователя...', 'info');
            userData = await this.fetchUserDataFromServer();

            if (userData) {
                this.displayUserData(userData);
                MessageManager.show('success-container', 'Данные пользователя загружены', 'success');
            } else {
                MessageManager.show('error-container', 'Не удалось загрузить данные пользователя', 'error');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            MessageManager.show('error-container', `Ошибка загрузки данных: ${error.message}`, 'error');
            
            // Если ошибка авторизации, перенаправляем на вход
            if (error.message.includes('401') || error.message.includes('unauthorized')) {
                MessageManager.show('error-container', 'Сессия истекла. Пожалуйста, войдите снова.', 'error');
                setTimeout(() => {
                    TokenManager.clearAll();
                    window.location.href = 'index.html';
                }, 3000);
            }
        }
    }

    async fetchUserDataFromServer() {
        try {
            const userData = await ApiClient.get(API_CONFIG.ENDPOINTS.USER.GET_PROFILE);
            TokenManager.setUser(userData);
            return userData;
        } catch (error) {
            throw new Error('Ошибка загрузки данных с сервера: ' + error.message);
        }
    }

    displayUserData(userData) {
        console.log('Displaying user data:', userData);
        
        // Обновляем основные данные вверху страницы
        document.getElementById('user-id').textContent = userData.id || 'Не указан';
        document.getElementById('user-email').textContent = userData.email || 'Не указан';
        
        // Правильно отображаем имя - если имя есть, используем его, иначе email
        const displayName = userData.name && userData.name.trim() !== '' ? userData.name : userData.email;
        document.getElementById('user-name').textContent = displayName || 'Не указан';
        
        document.getElementById('user-role').textContent = userData.role || 'USER';
        
        // Обновляем данные в форме редактирования
        document.getElementById('user-email-display').textContent = userData.email || 'Не указан';
        document.getElementById('user-name-display').textContent = displayName || 'Не указан';
        document.getElementById('user-role-display').textContent = userData.role || 'USER';
        
        // Обновляем значения в полях ввода
        document.getElementById('user-email-input').value = userData.email || '';
        document.getElementById('user-name-input').value = userData.name || '';
        
        console.log('Displayed data:', {
            id: userData.id,
            email: userData.email,
            name: displayName,
            role: userData.role
        });
    }

    toggleEdit(field) {
        const span = document.getElementById(`user-${field}-display`);
        const input = document.getElementById(`user-${field}-input`);
        
        if (!span || !input) {
            console.error(`Elements not found for field: ${field}`);
            return;
        }
        
        if (input.style.display === 'none') {
            input.value = span.textContent;
            input.style.display = 'block';
            span.style.display = 'none';
            
            // Показываем кнопки сохранения
            const saveBtn = document.querySelector(`.save-btn[data-field="${field}"]`);
            const cancelBtn = document.querySelector(`.cancel-btn[data-field="${field}"]`);
            if (saveBtn) saveBtn.style.display = 'inline-block';
            if (cancelBtn) cancelBtn.style.display = 'inline-block';
        } else {
            input.style.display = 'none';
            span.style.display = 'block';
            
            // Скрываем кнопки сохранения
            const saveBtn = document.querySelector(`.save-btn[data-field="${field}"]`);
            const cancelBtn = document.querySelector(`.cancel-btn[data-field="${field}"]`);
            if (saveBtn) saveBtn.style.display = 'none';
            if (cancelBtn) cancelBtn.style.display = 'none';
        }
    }

    async saveProfile() {
        const emailInput = document.getElementById('user-email-input');
        const nameInput = document.getElementById('user-name-input');
        
        const updates = {};
        let hasChanges = false;

        // Проверяем email
        if (emailInput.style.display !== 'none') {
            const email = emailInput.value.trim();
            if (!email) {
                MessageManager.show('error-container', 'Email не может быть пустым', 'error');
                return;
            }
            if (!Validator.isValidEmail(email)) {
                MessageManager.show('error-container', 'Некорректный формат email', 'error');
                return;
            }
            updates.email = email;
            hasChanges = true;
        }

        // Проверяем имя
        if (nameInput.style.display !== 'none') {
            const name = nameInput.value.trim();
            if (!name) {
                MessageManager.show('error-container', 'Имя не может быть пустым', 'error');
                return;
            }
            if (!Validator.isValidName(name)) {
                MessageManager.show('error-container', 'Имя должно содержать от 2 до 100 символов', 'error');
                return;
            }
            updates.name = name;
            hasChanges = true;
        }

        if (!hasChanges) {
            MessageManager.show('error-container', 'Нет изменений для сохранения', 'error');
            return;
        }

        if (!confirm('Вы уверены, что хотите изменить:\n' + 
            Object.entries(updates).map(([key, value]) => `${key}: ${value}`).join('\n'))) {
            return;
        }

        try {
            MessageManager.show('success-container', 'Сохранение изменений...', 'info');
            await this.updateProfile(updates);
            this.cancelEdit();
            MessageManager.show('success-container', 'Изменения успешно сохранены!', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            MessageManager.show('error-container', 'Ошибка сохранения профиля: ' + error.message, 'error');
        }
    }

    async updateProfile(updates) {
        // Обновляем email если нужно
        if (updates.email) {
            const result = await ApiClient.patch(API_CONFIG.ENDPOINTS.USER.UPDATE_EMAIL, { email: updates.email });
            
            // Если сервер вернул новые токены, обновляем их
            if (result.accesToken && result.refershToken) {
                TokenManager.setTokens(result.accesToken, result.refershToken);
                console.log('Tokens updated after email change');
            }
            
            this.updateUserDisplay('email', result.user.email);
            TokenManager.setUser(result.user);
            MessageManager.show('success-container', 'Email успешно обновлен!', 'success');
        }

        // Обновляем имя если нужно
        if (updates.name) {
            const result = await ApiClient.patch(API_CONFIG.ENDPOINTS.USER.UPDATE_NAME, { name: updates.name });
            
            // Если сервер вернул новые токены, обновляем их
            if (result.accesToken && result.refershToken) {
                TokenManager.setTokens(result.accesToken, result.refershToken);
                console.log('Tokens updated after name change');
            }
            
            this.updateUserDisplay('name', result.user.name);
            TokenManager.setUser(result.user);
            MessageManager.show('success-container', 'Имя успешно обновлено!', 'success');
        }
    }

    updateUserDisplay(field, value) {
        // Обновляем основные данные вверху страницы
        const mainElement = document.getElementById(`user-${field}`);
        if (mainElement) {
            mainElement.textContent = value;
        }
        
        // Обновляем данные в форме редактирования
        const displayElement = document.getElementById(`user-${field}-display`);
        if (displayElement) {
            displayElement.textContent = value;
        }
        
        // Обновляем значение в поле ввода
        const inputElement = document.getElementById(`user-${field}-input`);
        if (inputElement) {
            inputElement.value = value;
        }
    }

    cancelEdit() {
        // Скрываем все поля ввода и показываем все span
        const fields = ['email', 'name'];
        
        fields.forEach(field => {
            const input = document.getElementById(`user-${field}-input`);
            const span = document.getElementById(`user-${field}-display`);
            const saveBtn = document.querySelector(`.save-btn[data-field="${field}"]`);
            const cancelBtn = document.querySelector(`.cancel-btn[data-field="${field}"]`);
            
            if (input) input.style.display = 'none';
            if (span) span.style.display = 'block';
            if (saveBtn) saveBtn.style.display = 'none';
            if (cancelBtn) cancelBtn.style.display = 'none';
        });
    }

    togglePasswordForm() {
        const form = document.getElementById('password-form');
        const isVisible = form.style.display !== 'none';
        
        if (isVisible) {
            // Скрываем форму
            form.style.display = 'none';
        } else {
            // Показываем форму и очищаем поля
            form.style.display = 'block';
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
            document.getElementById('current-password').focus();
        }
    }

    async changePassword() {
        const oldPassword = document.getElementById('current-password').value.trim();
        const newPassword = document.getElementById('new-password').value.trim();
        const confirmPassword = document.getElementById('confirm-password').value.trim();
        
        console.log('Password change attempt:', { oldPassword: !!oldPassword, newPassword: !!newPassword, confirmPassword: !!confirmPassword });
        
        // Валидация
        if (!oldPassword) {
            MessageManager.show('error-container', 'Введите текущий пароль', 'error');
            return;
        }
        
        if (!newPassword) {
            MessageManager.show('error-container', 'Введите новый пароль', 'error');
            return;
        }
        
        if (!Validator.isValidPassword(newPassword)) {
            MessageManager.show('error-container', 'Новый пароль должен содержать минимум 6 символов', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            MessageManager.show('error-container', 'Пароли не совпадают', 'error');
            return;
        }
        
        if (oldPassword === newPassword) {
            MessageManager.show('error-container', 'Новый пароль должен отличаться от текущего', 'error');
            return;
        }
        
        if (!confirm('Вы уверены, что хотите изменить пароль?')) {
            return;
        }
        
        try {
            MessageManager.show('success-container', 'Изменение пароля...', 'info');
            await ApiClient.patch(API_CONFIG.ENDPOINTS.USER.UPDATE_PASSWORD, {
                currentPassword: oldPassword,
                newPassword: newPassword
            });
            
            MessageManager.show('success-container', 'Пароль успешно изменен!', 'success');
            this.togglePasswordForm();
            
        } catch (error) {
            console.error('Error changing password:', error);
            MessageManager.show('error-container', 'Ошибка смены пароля: ' + error.message, 'error');
            
            // Если ошибка текущего пароля, предлагаем попробовать снова
            if (error.message.includes('Invalid password') || error.message.includes('текущий пароль')) {
                document.getElementById('current-password').value = '';
                document.getElementById('current-password').focus();
            }
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем менеджер профиля
    new ProfileManager();
});
