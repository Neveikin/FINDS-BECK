// Управление админ панелью
class AdminPanel {
    constructor() {
        this.shopsList = document.getElementById('shops-list');
        this.productsList = document.getElementById('products-list');
        this.shopFilter = document.getElementById('shop-filter');
        this.productSearch = document.getElementById('product-search');
        this.errorMessage = document.getElementById('error-message');
        this.successMessage = document.getElementById('success-message');
        
        this.shops = [];
        this.products = [];
        this.filteredProducts = [];
        this.selectedShopId = null;
        
        this.init();
    }

    init() {
        if (!this.checkAdminAccess()) {
            return;
        }
        
        this.setupEventListeners();
        this.loadShops();
        // loadProducts будет вызван после выбора магазина
        this.setupUserSearch();
    }

    setupUserSearch() {
        const userSearchInput = document.getElementById('user-search');
        if (userSearchInput) {
            userSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchUsers();
                }
            });
        }
    }

    async searchUsers() {
        const searchInput = document.getElementById('user-search');
        const email = searchInput?.value.trim();
        
        if (!email) {
            this.showError('Введите email для поиска');
            return;
        }

        // Проверяем токен и права пользователя
        const token = localStorage.getItem(CONFIG.TOKEN_KEY);
        const userData = getUserDataSync();

        if (!token) {
            this.showError('Токен авторизации отсутствует');
            return;
        }

        if (userData?.role !== 'ADMIN') {
            this.showError('Недостаточно прав для поиска пользователей');
            return;
        }

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/admin/users/search?email=${encodeURIComponent(email)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                this.displayUserResults(result);
            } else {
                this.showError('Пользователь не найден');
            }
        } catch (error) {
            console.error('Error searching user:', error);
            this.showError('Ошибка при поиске пользователя');
        }
    }

    displayUserResults(users) {
        console.log('displayUserResults called with:', users);
        const resultsContainer = document.getElementById('user-search-results');
        const detailsContainer = document.getElementById('user-details');
        
        console.log('Results container:', resultsContainer);
        console.log('Details container:', detailsContainer);
        
        if (!resultsContainer) {
            console.log('Results container not found');
            return;
        }

        if (!users || (!users.success && !Array.isArray(users))) {
            console.log('No users found');
            resultsContainer.innerHTML = '<p class="no-results">Пользователи не найдены</p>';
            if (detailsContainer) detailsContainer.style.display = 'none';
            return;
        }

        // Извлекаем массив пользователей из нового формата
        const usersArray = users.data || users;
        
        if (!usersArray || usersArray.length === 0) {
            console.log('No users found in array');
            resultsContainer.innerHTML = '<p class="no-results">Пользователи не найдены</p>';
            if (detailsContainer) detailsContainer.style.display = 'none';
            return;
        }

        console.log('Found users, displaying first one');
        const user = usersArray[0]; // Показываем первого найденного
        resultsContainer.innerHTML = `
            <div class="user-card">
                <div class="user-info">
                    <h4>${this.escapeHtml(user.name || 'N/A')}</h4>
                    <p><strong>Email:</strong> ${this.escapeHtml(user.email)}</p>
                    <p><strong>Роль:</strong> <span class="role-badge role-${user.role?.toLowerCase()}">${this.escapeHtml(user.role || 'N/A')}</span></p>
                </div>
                <div class="user-actions">
                    <button class="btn btn-sm btn-primary" onclick="changeUserRole('${user.email}', '${user.role}')">
                        <i class="fas fa-user-tag"></i> Изменить роль
                    </button>
                </div>
            </div>
        `;

        detailsContainer.style.display = 'none';
    }

    async changeUserRole(userId, currentRole) {
        const newRole = prompt('Введите новую роль (USER, SELLER, ADMIN):', currentRole);
        
        if (!newRole || !['USER', 'SELLER', 'ADMIN'].includes(newRole.toUpperCase())) {
            this.showError('Некорректная роль');
            return;
        }

        if (!confirm(`Вы уверены, что хотите изменить роль пользователя на ${newRole}?`)) {
            return;
        }

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/auth/update-role`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem(CONFIG.TOKEN_KEY)}`
                },
                body: JSON.stringify({ 
                    email: userId,
                    role: newRole 
                })
            });
            
            if (response.ok) {
                this.showSuccess(`Роль пользователя ${userId} успешно изменена на ${newRole}`);
                
                // Если изменили роль текущего пользователя, разлогиниваем его
                const currentUser = getUserDataSync();
                if (currentUser && currentUser.email === userId) {
                    console.log('Current user role changed, logging out...');
                    logout();
                } else {
                    this.searchUsers(); // Перезагружаем результаты поиска для других пользователей
                }
            } else {
                const error = await response.json();
                this.showError(error.message || 'Не удалось изменить роль пользователя');
            }
        } catch (error) {
            console.error('Error changing user role:', error);
            this.showError('Ошибка при изменении роли');
        }
    }

    
    checkAdminAccess() {
        const user = getUserDataSync();
        if (!user) {
            this.showError('Доступ запрещен. Требуется авторизация.');
            window.location.href = 'login.html';
            return false;
        }

        if (user.role !== 'ADMIN') {
            this.showError('Доступ запрещен. Требуются права администратора.');
            window.location.href = 'index.html';
            return false;
        }

        return true;
    }

    setupEventListeners() {
        // Форма создания магазина
        const createShopForm = document.getElementById('create-shop-form');
        if (createShopForm) {
            createShopForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createShop();
            });
        }

        // Форма добавления товара
        const addProductForm = document.getElementById('add-product-form');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addProduct();
            });
        }

        // Фильтр магазина
        if (this.shopFilter) {
            this.shopFilter.addEventListener('change', () => this.filterProducts());
        }

        // Поиск товаров
        if (this.productSearch) {
            this.productSearch.addEventListener('input', () => this.filterProducts());
        }
    }

    async loadShops() {
        try {
            const response = await fetch(CONFIG.SHOPS_URL, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem(CONFIG.TOKEN_KEY)}`
                }
            });
            
            if (response.ok) {
                this.shops = await response.json();
                this.renderShops();
                this.populateShopFilter();
            } else {
                throw new Error('Failed to load shops');
            }
        } catch (error) {
            console.error('Error loading shops:', error);
            this.showError('Не удалось загрузить магазины');
        }
    }

    async loadProducts() {
        // Если нет выбранного магазина, не загружаем продукты
        if (!this.selectedShopId) {
            this.products = [];
            this.filteredProducts = [];
            this.renderProducts();
            return;
        }

        try {
            const response = await fetch(`${CONFIG.PRODUCTS_URL}?shopId=${this.selectedShopId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem(CONFIG.TOKEN_KEY)}`
                }
            });
            
            if (response.ok) {
                this.products = await response.json();
                this.filteredProducts = [...this.products];
                this.renderProducts();
            } else {
                throw new Error('Failed to load products');
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Не удалось загрузить товары');
        }
    }

    renderShops() {
        if (!this.shopsList) return;

        if (this.shops.length === 0) {
            this.shopsList.innerHTML = `
                <div class="no-items">
                    <i class="fas fa-store"></i>
                    <h4>Магазины не найдены</h4>
                    <p>Создайте первый магазин</p>
                </div>
            `;
            return;
        }

        const shopsHTML = this.shops.map(shop => this.createShopCard(shop)).join('');
        this.shopsList.innerHTML = shopsHTML;
    }

    createShopCard(shop) {
        return `
            <div class="admin-card">
                <div class="card-header">
                    <div class="shop-info">
                        <h4>${this.escapeHtml(shop.name)}</h4>
                        <p>${this.escapeHtml(shop.description || '')}</p>
                    </div>
                    <div class="shop-actions">
                        <button class="btn btn-sm btn-primary" onclick="selectShop('${shop.id}', '${this.escapeHtml(shop.name)}')">
                            <i class="fas fa-eye"></i> Товары
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="editShop('${shop.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteShop('${shop.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="shop-stats">
                        <div class="stat-item">
                            <i class="fas fa-box"></i>
                            <span>${shop.productCount || 0} товаров</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-star"></i>
                            <span>${(shop.rating || 0).toFixed(1)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    populateShopFilter() {
        if (!this.shopFilter) return;

        const currentValue = this.shopFilter.value;
        this.shopFilter.innerHTML = '<option value="">Все магазины</option>';
        
        this.shops.forEach(shop => {
            const option = document.createElement('option');
            option.value = shop.id;
            option.textContent = shop.name;
            this.shopFilter.appendChild(option);
        });
        
        this.shopFilter.value = currentValue;
        
        // Также заполняем список магазинов в модальном окне добавления товара
        const productShopSelect = document.getElementById('product-shop');
        if (productShopSelect) {
            const currentShopValue = productShopSelect.value;
            productShopSelect.innerHTML = '<option value="">Выберите магазин</option>';
            
            this.shops.forEach(shop => {
                const option = document.createElement('option');
                option.value = shop.id;
                option.textContent = shop.name;
                productShopSelect.appendChild(option);
            });
            
            productShopSelect.value = currentShopValue;
        }
    }

    renderProducts() {
        if (!this.productsList) return;

        if (this.filteredProducts.length === 0) {
            this.productsList.innerHTML = `
                <div class="no-items">
                    <i class="fas fa-box-open"></i>
                    <h4>Товары не найдены</h4>
                    <p>Попробуйте изменить параметры фильтрации</p>
                </div>
            `;
            return;
        }

        const productsHTML = this.filteredProducts.map(product => this.createProductCard(product)).join('');
        this.productsList.innerHTML = productsHTML;
    }

    createProductCard(product) {
        const user = TokenManager.getUser();
        const isAdmin = user && user.role === 'ADMIN';
        const isSeller = user && user.role === 'SELLER';
        const canEdit = isAdmin || isSeller;

        return `
            <div class="admin-product-card ${!product.isActive ? 'inactive' : ''} ${product.stock === 0 ? 'out-of-stock' : ''}">
                <div class="product-header">
                    <div class="product-info">
                        <h4>${this.escapeHtml(product.name)}</h4>
                        <div class="product-badges">
                            ${!product.isActive ? '<span class="badge badge-inactive">Неактивен</span>' : ''}
                            ${product.stock === 0 ? '<span class="badge badge-sold">Sold Out</span>' : ''}
                            <span class="badge badge-stock">В наличии: ${product.stock || 0}</span>
                        </div>
                    </div>
                    ${canEdit ? `
                        <div class="product-actions">
                            <button class="btn btn-sm btn-primary" onclick="editProduct('${product.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm ${product.isActive ? 'btn-warning' : 'btn-success'}" 
                                    onclick="toggleProductStatus('${product.id}')">
                                <i class="fas ${product.isActive ? 'fa-eye-slash' : 'fa-eye'}"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
                <div class="product-body">
                    <div class="product-details">
                        <p><strong>Цена:</strong> ${this.formatPrice(product.price)} руб</p>
                        <p><strong>Магазин:</strong> ${this.escapeHtml(product.shop?.name || 'Неизвестно')}</p>
                        <p><strong>Описание:</strong> ${this.escapeHtml(product.description || 'Нет описания')}</p>
                    </div>
                </div>
            </div>
        `;
    }

    filterProducts() {
        const shopId = this.shopFilter?.value || '';
        const searchTerm = this.productSearch?.value.toLowerCase() || '';

        this.filteredProducts = this.products.filter(product => {
            const matchesShop = !shopId || product.shop?.id === shopId;
            const matchesSearch = !searchTerm || 
                product.name.toLowerCase().includes(searchTerm) ||
                product.description?.toLowerCase().includes(searchTerm);
            
            return matchesShop && matchesSearch;
        });

        this.renderProducts();
    }

    async createShop() {
        const formData = new FormData(document.getElementById('create-shop-form'));
        const shopData = {
            name: formData.get('name'),
            description: formData.get('description'),
            logo: formData.get('logo')
        };

        try {
            const response = await fetch(`${CONFIG.SHOPS_URL}/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem(CONFIG.TOKEN_KEY)}`
                },
                body: JSON.stringify(shopData)
            });
            
            if (response.ok) {
                this.showSuccess('Магазин успешно создан');
                this.closeCreateShopModal();
                this.loadShops();
            } else {
                const error = await response.json();
                this.showError(error.message || 'Не удалось создать магазин');
            }
        } catch (error) {
            console.error('Error creating shop:', error);
            this.showError('Не удалось создать магазин');
        }
    }

    async addProduct() {
        const formData = new FormData(document.getElementById('add-product-form'));
        const productData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            stock: parseInt(formData.get('stock')),
            shopId: formData.get('shopId') || document.getElementById('product-shop').value,
            isActive: formData.get('isActive') === 'on'
        };

        try {
            const shopId = productData.shopId;
            if (!shopId) {
                this.showError('Выберите магазин для товара');
                return;
            }
            
            await ApiClient.post(`/product/add/${shopId}`, productData);
            this.showSuccess('Товар успешно добавлен');
            this.closeAddProductModal();
            this.loadProducts();
        } catch (error) {
            console.error('Error adding product:', error);
            this.showError('Не удалось добавить товар');
        }
    }

    async deleteShop(shopId) {
        if (!confirm('Вы уверены, что хотите удалить этот магазин?')) {
            return;
        }

        try {
            await ApiClient.delete(`/api/shops/delete/${shopId}`);
            this.showSuccess('Магазин успешно удален');
            this.loadShops();
            this.loadProducts();
        } catch (error) {
            console.error('Error deleting shop:', error);
            this.showError('Не удалось удалить магазин');
        }
    }

    async toggleProductStatus(productId) {
        try {
            const product = this.products.find(p => p.id === productId);
            if (!product) return;

            const newStatus = !product.isActive;
            const response = await ApiClient.patch(`/api/product/edit/${productId}`, {
                isActive: newStatus
            });

            this.showSuccess(`Товар ${newStatus ? 'активирован' : 'деактивирован'}`);
            this.loadProducts();
        } catch (error) {
            console.error('Error toggling product status:', error);
            this.showError('Не удалось изменить статус товара');
        }
    }

    showSuccess(message) {
        if (this.successMessage) {
            this.successMessage.querySelector('span').textContent = message;
            this.successMessage.style.display = 'flex';
            setTimeout(() => {
                this.successMessage.style.display = 'none';
            }, 5000);
        }
    }

    showError(message) {
        if (this.errorMessage) {
            this.errorMessage.querySelector('span').textContent = message;
            this.errorMessage.style.display = 'flex';
            setTimeout(() => {
                this.errorMessage.style.display = 'none';
            }, 7000);
        }
    }

    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    closeCreateShopModal() {
        const modal = document.getElementById('create-shop-modal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('create-shop-form').reset();
        }
    }

    closeAddProductModal() {
        const modal = document.getElementById('add-product-modal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('add-product-form').reset();
        }
    }

    selectShop(shopId, shopName) {
        this.selectedShopId = shopId;
        this.loadProducts();
        this.showSuccess(`Выбран магазин: ${shopName}`);
    }
}

// Глобальные функции для вызова из HTML
function openCreateShopModal() {
    const modal = document.getElementById('create-shop-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function openAddProductModal() {
    const modal = document.getElementById('add-product-modal');
    if (modal) {
        // Заполняем список магазинов
        const shopSelect = document.getElementById('product-shop');
        if (shopSelect && window.adminPanel) {
            shopSelect.innerHTML = '<option value="">Выберите магазин</option>';
            
            window.adminPanel.shops.forEach(shop => {
                const option = document.createElement('option');
                option.value = shop.id;
                option.textContent = shop.name;
                shopSelect.appendChild(option);
            });
        }
        
        modal.style.display = 'flex';
    }
}

function closeCreateShopModal() {
    const adminPanel = window.adminPanel;
    if (adminPanel) {
        adminPanel.closeCreateShopModal();
    }
}

function closeAddProductModal() {
    const adminPanel = window.adminPanel;
    if (adminPanel) {
        adminPanel.closeAddProductModal();
    }
}

function editShop(shopId) {
    MessageManager.showInfo('Редактирование магазинов в разработке');
}

function editProduct(productId) {
    MessageManager.showInfo('Редактирование товаров в разработке');
}

function toggleProductStatus(productId) {
    const adminPanel = window.adminPanel;
    if (adminPanel) {
        adminPanel.toggleProductStatus(productId);
    }
}

function searchUsers() {
    const adminPanel = window.adminPanel;
    if (adminPanel) {
        adminPanel.searchUsers();
    }
}

function changeUserRole(userId, currentRole) {
    const adminPanel = window.adminPanel;
    if (adminPanel) {
        adminPanel.changeUserRole(userId, currentRole);
    }
}

function selectShop(shopId, shopName) {
    const adminPanel = window.adminPanel;
    if (adminPanel) {
        adminPanel.selectShop(shopId, shopName);
    }
}


// Инициализация админ панели при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем доступ и инициализируем админ панель
    window.adminPanel = new AdminPanel();
});
