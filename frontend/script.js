// Проверка загрузки зависимостей
document.addEventListener('DOMContentLoaded', () => {
    console.log('script.js loaded');
    
    // Проверяем наличие необходимых глобальных объектов
    if (typeof API_CONFIG === 'undefined') {
        console.error('API_CONFIG not loaded. Check config.js');
        alert('Ошибка загрузки конфигурации. Проверьте консоль.');
        return;
    }
    
    if (typeof ApiClient === 'undefined') {
        console.error('ApiClient not loaded. Check config.js');
        alert('Ошибка загрузки API клиента. Проверьте консоль.');
        return;
    }
    
    if (typeof Validator === 'undefined') {
        console.error('Validator not loaded. Check config.js');
        alert('Ошибка загрузки валидатора. Проверьте консоль.');
        return;
    }
    
    if (typeof MessageManager === 'undefined') {
        console.error('MessageManager not loaded. Check config.js');
        alert('Ошибка загрузки менеджера сообщений. Проверьте консоль.');
        return;
    }
    
    console.log('All dependencies loaded successfully');
});

// DOM элементы
const tabBtns = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

console.log('DOM elements:', {
    tabBtns: tabBtns.length,
    authForms: authForms.length,
    loginForm: !!loginForm,
    registerForm: !!registerForm
});

// Переключение вкладок
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        
        // Удаляем активный класс у всех кнопок и форм
        tabBtns.forEach(tabBtn => tabBtn.classList.remove('active'));
        authForms.forEach(form => form.classList.remove('active'));
        
        // Добавляем активный класс к выбранной вкладке и форме
        btn.classList.add('active');
        const targetForm = document.getElementById(`${targetTab}Form`);
        if (targetForm) {
            targetForm.classList.add('active');
        }
        
        // Скрыть сообщения при переключении
        MessageManager.hide('message');
    });
});

// Обработка формы входа
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const email = formData.get('email').trim();
        const password = formData.get('password');
        
        // Валидация
        if (!email) {
            MessageManager.show('message', 'Введите email', 'error');
            return;
        }
        
        if (!Validator.isValidEmail(email)) {
            MessageManager.show('message', 'Введите корректный email', 'error');
            return;
        }
        
        if (!password) {
            MessageManager.show('message', 'Введите пароль', 'error');
            return;
        }
        
        try {
            const result = await ApiClient.post(API_CONFIG.ENDPOINTS.AUTH.SIGNIN, {
                email: email,
                password: password
            });
            
            // Сохранение токенов и данных пользователя
            TokenManager.setTokens(result.accesToken, result.refershToken);
            
            // Используем данные пользователя из ответа авторизации
            if (result.user) {
                TokenManager.setUser(result.user);
                console.log('User data from login response:', result.user);
            } else {
                // Если в ответе нет данных пользователя, запрашиваем их
                try {
                    const userData = await ApiClient.get(API_CONFIG.ENDPOINTS.USER.GET_PROFILE);
                    TokenManager.setUser(userData);
                    console.log('User data loaded after login:', userData);
                } catch (error) {
                    console.log('Could not load user data, using email only');
                    TokenManager.setUser({ 
                        email: email,
                        role: 'USER' // По умолчанию
                    });
                }
            }
            
            MessageManager.show('message', 'Вход выполнен успешно!', 'success');
            
            // Перенаправление на главную страницу
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            console.error('Login error:', error);
            
            // Показываем конкретную ошибку
            let errorMessage = 'Ошибка при входе';
            if (error.message.includes('User not found') || error.message.includes('пользователь не найден')) {
                errorMessage = 'Пользователь с таким email не найден';
            } else if (error.message.includes('Invalid password') || error.message.includes('пароль')) {
                errorMessage = 'Неверный пароль';
            } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
                errorMessage = 'Неверные учетные данные';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage = 'Ошибка подключения к серверу. Проверьте интернет-соединение.';
            } else {
                errorMessage = error.message || 'Ошибка при входе';
            }
            
            MessageManager.show('message', errorMessage, 'error');
        }
    });
}

// Обработка формы регистрации
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Registration form submitted');
        
        const formData = new FormData(registerForm);
        const name = formData.get('name').trim();
        const email = formData.get('email').trim();
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const role = formData.get('role') || 'USER';
        
        console.log('Form data:', { name, email, password: '***', confirmPassword: '***', role });
        
        // Валидация
        if (!name) {
            console.log('Name validation failed');
            MessageManager.show('message', 'Введите имя', 'error');
            return;
        }
        
        if (!Validator.isValidName(name)) {
            console.log('Name format validation failed');
            MessageManager.show('message', 'Имя должно содержать от 2 до 100 символов', 'error');
            return;
        }
        
        if (!email) {
            console.log('Email validation failed');
            MessageManager.show('message', 'Введите email', 'error');
            return;
        }
        
        if (!Validator.isValidEmail(email)) {
            console.log('Email format validation failed');
            MessageManager.show('message', 'Введите корректный email', 'error');
            return;
        }
        
        if (!password) {
            console.log('Password validation failed');
            MessageManager.show('message', 'Введите пароль', 'error');
            return;
        }
        
        if (password.length < 6) {
            console.log('Password length validation failed');
            MessageManager.show('message', 'Пароль должен содержать минимум 6 символов', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            console.log('Password confirmation failed');
            MessageManager.show('message', 'Пароли не совпадают', 'error');
            return;
        }
        
        console.log('Request data:', {
            name: name,
            email: email,
            password: password,
            confirmPassword: confirmPassword,
            role: role
        });
        
        try {
            const result = await ApiClient.post(API_CONFIG.ENDPOINTS.AUTH.SIGNUP, {
                name: name,
                email: email,
                password: password,
                confirmPassword: confirmPassword,
                role: role
            });
            
            console.log('Registration successful:', result);
            
            // После успешной регистрации сразу входим в систему
            MessageManager.show('message', 'Регистрация прошла успешно! Выполняю вход...', 'success');
            
            // Сохраняем токены от регистрации
            TokenManager.setTokens(result.accesToken, result.refershToken);
            
            // Используем данные пользователя из ответа регистрации
            if (result.user) {
                TokenManager.setUser(result.user);
                console.log('User data from registration response:', result.user);
            } else {
                // Если в ответе нет данных пользователя, используем базовые
                try {
                    const userData = await ApiClient.get(API_CONFIG.ENDPOINTS.USER.GET_PROFILE);
                    TokenManager.setUser(userData);
                    console.log('User data loaded after registration:', userData);
                } catch (error) {
                    console.log('Could not load user data, using basic info');
                    TokenManager.setUser({ 
                        email: email, 
                        name: name,
                        role: role 
                    });
                }
            }
            
            // Перенаправление на главную страницу
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            
        } catch (error) {
            console.error('Registration error:', error);
            
            // Показываем конкретную ошибку
            let errorMessage = 'Ошибка при регистрации';
            if (error.message.includes('Email уже существует') || error.message.includes('email already exists')) {
                errorMessage = 'Пользователь с таким email уже существует';
            } else if (error.message.includes('пароль') && error.message.includes('символов')) {
                errorMessage = 'Пароль должен содержать минимум 6 символов';
            } else if (error.message.includes('пароли не совпадают')) {
                errorMessage = 'Пароли не совпадают';
            } else if (error.message.includes('имя') && error.message.includes('пуст')) {
                errorMessage = 'Имя не может быть пустым';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage = 'Ошибка подключения к серверу. Проверьте интернет-соединение.';
            } else {
                errorMessage = error.message || 'Ошибка при регистрации';
            }
            
            MessageManager.show('message', errorMessage, 'error');
        }
    });
}

// Обработка "Забыли пароль"
document.querySelector('.forgot-password')?.addEventListener('click', (e) => {
    e.preventDefault();
    MessageManager.show('message', 'Функция восстановления пароля будет доступна позже', 'error');
});

// Очистка формы при переключении вкладок
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetForm = document.getElementById(`${btn.dataset.tab}Form`);
        if (targetForm) {
            targetForm.reset();
        }
    });
});
