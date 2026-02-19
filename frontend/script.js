// Утилитарные функции и обработчики для форм авторизации

document.addEventListener('DOMContentLoaded', () => {
    initializeAuthForms();
});

function initializeAuthForms() {
    // Форма входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Форма регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Переключение между формами
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    
    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            showRegisterForm();
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginForm();
        });
    }
    
    // Валидация форм
    setupFormValidation();
}

async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    
    console.log('Login form submitted');
    console.log('Form data:', {
        email: formData.get('email'),
        password: '***'
    });
    
    // Показываем загрузку
    setLoading(submitBtn, true);
    
    try {
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password')
        };
        
        console.log('Sending request to:', CONFIG.LOGIN_URL);
        console.log('Request data:', loginData);
        
        const response = await fetch(CONFIG.LOGIN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const result = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', result);
        
        if (response.ok) {
            // Сохраняем токен
            localStorage.setItem(CONFIG.TOKEN_KEY, result.accesToken);
            localStorage.setItem('refresh_token', result.refershToken);
            
            // Сохраняем базовые данные пользователя для мгновенного доступа
            const userData = {
                name: result.name || result.email || 'User',
                email: result.email || '',
                role: result.role || 'USER'
            };
            localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(userData));
            localStorage.setItem('token_timestamp', Date.now().toString());
            
            console.log('Token and user data saved successfully');
            console.log('User data:', userData);
            
            // Показываем успех
            showNotification('Вход выполнен успешно!', 'success');
            
            // Перенаправляем в личный кабинет
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            console.error('Login failed:', result);
            showNotification(result.message || 'Ошибка входа', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Ошибка соединения с сервером', 'error');
    } finally {
        setLoading(submitBtn, false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Валидация паролей
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
        showNotification('Пароли не совпадают', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Пароль должен содержать минимум 6 символов', 'error');
        return;
    }
    
    // Показываем загрузку
    setLoading(submitBtn, true);
    
    try {
        const registerData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: password
        };
        
        const response = await fetch(CONFIG.REGISTER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Показываем успех
            showNotification('Регистрация выполнена успешно!', 'success');
            
            // Переключаем на форму входа
            setTimeout(() => {
                showLoginForm();
                showNotification('Теперь вы можете войти', 'info');
            }, 1500);
        } else {
            showNotification(result.message || 'Ошибка регистрации', 'error');
        }
    } catch (error) {
        console.error('Register error:', error);
        showNotification('Ошибка соединения с сервером', 'error');
    } finally {
        setLoading(submitBtn, false);
    }
}

function showLoginForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const formTitle = document.getElementById('form-title');
    const switchText = document.getElementById('switch-text');
    const switchLink = document.getElementById('switch-link');
    
    if (loginForm && registerForm) {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    }
    
    if (formTitle) {
        formTitle.textContent = 'Вход в аккаунт';
    }
    
    if (switchText && switchLink) {
        switchText.textContent = 'Нет аккаунта? ';
        switchLink.textContent = 'Зарегистрируйтесь';
        switchLink.setAttribute('id', 'switch-to-register');
        switchLink.onclick = (e) => {
            e.preventDefault();
            showRegisterForm();
        };
    }
}

function showRegisterForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const formTitle = document.getElementById('form-title');
    const switchText = document.getElementById('switch-text');
    const switchLink = document.getElementById('switch-link');
    
    if (loginForm && registerForm) {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
    
    if (formTitle) {
        formTitle.textContent = 'Регистрация';
    }
    
    if (switchText && switchLink) {
        switchText.textContent = 'Уже есть аккаунт? ';
        switchLink.textContent = 'Войдите';
        switchLink.setAttribute('id', 'switch-to-login');
        switchLink.onclick = (e) => {
            e.preventDefault();
            showLoginForm();
        };
    }
}

function setupFormValidation() {
    // Валидация поля email
    const emailInputs = document.querySelectorAll('input[name="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('input', () => {
            const value = input.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!emailRegex.test(value)) {
                showError(input, 'Введите корректный email адрес');
            } else {
                clearError(input);
            }
        });
    });
    
    // Валидация поля username (для регистрации)
    const usernameInputs = document.querySelectorAll('input[name="username"]');
    usernameInputs.forEach(input => {
        input.addEventListener('input', () => {
            const value = input.value.trim();
            const errorElement = input.parentNode.querySelector('.error-message');
            
            if (value.length < 3) {
                showError(input, 'Имя пользователя должно содержать минимум 3 символа');
            } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                showError(input, 'Имя пользователя может содержать только буквы, цифры и _');
            } else {
                clearError(input);
            }
        });
    });
    
    // Валидация поля password
    const passwordInputs = document.querySelectorAll('input[name="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('input', () => {
            const value = input.value;
            
            if (value.length < 6) {
                showError(input, 'Пароль должен содержать минимум 6 символов');
            } else {
                clearError(input);
            }
        });
    });
    
    // Валидация поля confirmPassword
    const confirmPasswordInputs = document.querySelectorAll('input[name="confirmPassword"]');
    confirmPasswordInputs.forEach(input => {
        input.addEventListener('input', () => {
            const password = input.form.querySelector('input[name="password"]').value;
            const confirmPassword = input.value;
            
            if (password !== confirmPassword) {
                showError(input, 'Пароли не совпадают');
            } else {
                clearError(input);
            }
        });
    });
}

function showError(input, message) {
    clearError(input);
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    input.parentNode.appendChild(errorElement);
    input.classList.add('error');
}

function clearError(input) {
    const errorElement = input.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
    input.classList.remove('error');
}

function setLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.textContent = 'Загрузка...';
        button.classList.add('loading');
    } else {
        button.disabled = false;
        button.textContent = button.getAttribute('data-original-text') || 'Войти';
        button.classList.remove('loading');
    }
}

// Сохраняем оригинальный текст кнопок
document.addEventListener('DOMContentLoaded', () => {
    const submitButtons = document.querySelectorAll('button[type="submit"]');
    submitButtons.forEach(button => {
        button.setAttribute('data-original-text', button.textContent);
    });
});
