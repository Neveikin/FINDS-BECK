// Функционал личного кабинета
document.addEventListener('DOMContentLoaded', async () => {
    await loadUserProfile();
    await loadUserFavorites();
    setupEventListeners();
});

async function loadUserProfile() {
    try {
        const userData = await getUserData();
        if (!userData) return;

        // Обновляем информацию о пользователе
        const profileName = document.getElementById('user-name');
        const profileEmail = document.getElementById('user-email');
        const profileRole = document.getElementById('user-role');
        const profileId = document.getElementById('user-id');
        const profileEmailDisplay = document.getElementById('user-email-display');

        if (profileName) profileName.textContent = userData.name || 'Не указано';
        if (profileEmail) profileEmail.textContent = userData.email || 'Не указано';
        if (profileRole) profileRole.textContent = userData.role || 'USER';
        if (profileId) profileId.textContent = userData.id || '-';
        if (profileEmailDisplay) profileEmailDisplay.textContent = userData.email || 'Не указано';

        // Показываем/скрываем админ панель
        const adminSection = document.getElementById('admin-section');
        if (adminSection) {
            adminSection.style.display = userData.role === 'ADMIN' ? 'block' : 'none';
        }

    } catch (error) {
        console.error('Error loading user profile:', error);
        showNotification('Ошибка загрузки профиля', 'error');
    }
}

async function loadUserFavorites() {
    try {
        const token = localStorage.getItem(CONFIG.TOKEN_KEY);
        if (!token) return;

        const response = await fetch(`${CONFIG.FAVORITES_URL}/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const favorites = await response.json();
            renderFavorites(favorites);
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
    }
}

function renderFavorites(favorites) {
    const favoritesContainer = document.getElementById('favorites-container');
    if (!favoritesContainer) return;

    if (favorites.length === 0) {
        favoritesContainer.innerHTML = '<p>У вас пока нет избранных товаров</p>';
        return;
    }

    favoritesContainer.innerHTML = favorites.map(favorite => `
        <div class="favorite-item">
            <img src="${favorite.productImage || '/placeholder.jpg'}" alt="${favorite.productName}">
            <div class="favorite-info">
                <h4>${favorite.productName}</h4>
                <p class="price">${formatPrice(favorite.productPrice)}</p>
                <button class="btn btn-small" onclick="removeFromFavorites('${favorite.id}')">
                    <i class="fas fa-heart"></i> Удалить
                </button>
            </div>
        </div>
    `).join('');
}

async function removeFromFavorites(favoriteId) {
    try {
        const token = localStorage.getItem(CONFIG.TOKEN_KEY);
        const response = await fetch(`${CONFIG.FAVORITES_URL}/${favoriteId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showNotification('Товар удален из избранного', 'success');
            await loadUserFavorites();
        } else {
            showNotification('Ошибка удаления из избранного', 'error');
        }
    } catch (error) {
        console.error('Error removing from favorites:', error);
        showNotification('Ошибка соединения', 'error');
    }
}

function setupEventListeners() {
    // Кнопка редактирования профиля
    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', showEditProfileModal);
    }

    // Кнопка смены пароля
    const changePasswordBtn = document.getElementById('change-password-btn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', showChangePasswordModal);
    }
}

function showEditProfileModal() {
    const modal = document.getElementById('edit-profile-modal');
    if (!modal) return;

    // Заполняем форму текущими данными
    const userData = getUserDataSync();
    const usernameInput = document.getElementById('edit-username');
    const emailInput = document.getElementById('edit-email');

    if (usernameInput) usernameInput.value = userData?.username || '';
    if (emailInput) emailInput.value = userData?.email || '';

    modal.style.display = 'block';
}

function showChangePasswordModal() {
    const modal = document.getElementById('change-password-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// Закрытие модальных окон
document.addEventListener('click', (e) => {
    // Не закрываем модальные окна если клик внутри dropdown
    if (e.target.closest('#user-dropdown')) {
        return;
    }
    
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
    
    if (e.target.classList.contains('close-modal')) {
        e.target.closest('.modal').style.display = 'none';
    }
});

// Сохранение профиля
async function saveProfile() {
    try {
        const username = document.getElementById('edit-username').value;
        const email = document.getElementById('edit-email').value;
        const token = localStorage.getItem(CONFIG.TOKEN_KEY);

        const response = await fetch(`${CONFIG.USER_PROFILE_URL}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ username, email })
        });

        if (response.ok) {
            showNotification('Профиль обновлен', 'success');
            document.getElementById('edit-profile-modal').style.display = 'none';
            await loadUserProfile();
        } else {
            showNotification('Ошибка обновления профиля', 'error');
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        showNotification('Ошибка соединения', 'error');
    }
}

// Смена пароля
async function changePassword() {
    try {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            showNotification('Пароли не совпадают', 'error');
            return;
        }

        const token = localStorage.getItem(CONFIG.TOKEN_KEY);
        const response = await fetch(`${CONFIG.USER_PROFILE_URL}/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        if (response.ok) {
            showNotification('Пароль изменен', 'success');
            document.getElementById('change-password-modal').style.display = 'none';
        } else {
            showNotification('Ошибка смены пароля', 'error');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showNotification('Ошибка соединения', 'error');
    }
}
