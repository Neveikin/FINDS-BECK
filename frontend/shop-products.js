// Управление страницей товаров магазина
class ShopProductsPage {
    constructor() {
        this.shopId = this.getShopIdFromUrl();
        this.productsContainer = document.getElementById('products-container');
        this.loading = document.getElementById('loading');
        this.errorMessage = document.getElementById('error-message');
        this.productSearch = document.getElementById('product-search');
        this.searchProductsBtn = document.getElementById('search-products-btn');
        this.sortSelect = document.getElementById('sort-select');
        
        this.shop = null;
        this.products = [];
        this.filteredProducts = [];
        
        this.init();
        
        // Делаем экземпляр доступным глобально
        window.shopPage = this;
    }

    init() {
        if (!this.shopId) {
            this.showError('ID магазина не указан');
            return;
        }
        
        this.setupEventListeners();
        this.loadShopInfo();
        this.loadProducts();
    }

    getShopIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    setupEventListeners() {
        // Поиск товаров
        if (this.searchProductsBtn) {
            this.searchProductsBtn.addEventListener('click', () => this.handleSearch());
        }

        // Enter в поиске
        if (this.productSearch) {
            this.productSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }

        // Сортировка
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', () => this.handleSort());
        }

        // Форма добавления товара
        const addProductForm = document.getElementById('add-product-form');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                window.shopPage.addProduct();
            });
        }
    }

    async loadShopInfo() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/shops/${this.shopId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(TokenManager.isAuthenticated() && {
                        'Authorization': `Bearer ${TokenManager.getAccessToken()}`
                    })
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.shop = data.body || data;
            this.renderShopInfo();
            
            // Проверяем права и показываем кнопку добавления товара
            this.checkAndShowAddButton();
            
        } catch (error) {
            console.error('Error loading shop info:', error);
            // Не показываем ошибку критично, продолжаем загрузку товаров
        }
    }

    checkAndShowAddButton() {
        const addProductBtn = document.getElementById('add-product-btn');
        if (!addProductBtn) {
            console.log('Кнопка add-product-btn не найдена');
            return;
        }

        const currentUser = TokenManager.getUser();
        console.log('Current user:', currentUser);
        console.log('Shop data:', this.shop);
        
        if (!currentUser) {
            console.log('Пользователь не авторизован');
            addProductBtn.style.display = 'none';
            return;
        }

        const isAdmin = currentUser.role === 'ADMIN';
        const isOwner = this.shop && this.shop.owners && 
            this.shop.owners.some(owner => owner.email === currentUser.email);

        console.log('Is admin:', isAdmin);
        console.log('Is owner:', isOwner);

        if (isAdmin || isOwner) {
            console.log('Показываем кнопку добавления товара');
            addProductBtn.style.display = 'inline-flex';
            
            // Добавляем обработчик клика
            addProductBtn.onclick = function() {
                console.log('Кнопка нажата!');
                if (typeof openAddProductModal === 'function') {
                    openAddProductModal();
                } else {
                    console.error('Функция openAddProductModal не найдена');
                }
            };
        } else {
            console.log('Скрываем кнопку добавления товара');
            addProductBtn.style.display = 'none';
        }
    }

    async loadProducts() {
        try {
            this.showLoading();
            
            const response = await fetch(`${API_CONFIG.BASE_URL}/product/get?id=${this.shopId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(TokenManager.isAuthenticated() && {
                        'Authorization': `Bearer ${TokenManager.getAccessToken()}`
                    })
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.products = data.body || data;
            this.filteredProducts = [...this.products];
            this.renderProducts();
            
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Не удалось загрузить товары. Попробуйте обновить страницу.');
        } finally {
            this.hideLoading();
        }
    }

    renderShopInfo() {
        if (!this.shop) return;

        const shopName = document.getElementById('shop-name');
        const shopDescription = document.getElementById('shop-description');
        const shopRating = document.getElementById('shop-rating');
        const productsCount = document.getElementById('products-count');

        if (shopName) shopName.textContent = this.shop.name || 'Магазин';
        if (shopDescription) shopDescription.textContent = this.shop.description || 'Описание магазина';
        if (shopRating) shopRating.textContent = (this.shop.rating || 0).toFixed(1);
        if (productsCount) productsCount.textContent = `${this.shop.productCount || 0} товаров`;
    }

    renderProducts() {
        if (!this.productsContainer) return;

        if (this.filteredProducts.length === 0) {
            this.productsContainer.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-box-open"></i>
                    <h3>Товары не найдены</h3>
                    <p>В этом магазине пока нет товаров</p>
                </div>
            `;
            return;
        }

        const productsHTML = this.filteredProducts.map(product => this.createProductCard(product)).join('');
        this.productsContainer.innerHTML = productsHTML;
    }

    createProductCard(product) {
        const user = TokenManager.getUser();
        const isAdmin = user && user.role === 'ADMIN';
        const isSeller = user && user.role === 'SELLER';
        const canEdit = isAdmin || isSeller;
        const canAddProducts = isAdmin || isSeller; 

        return `
            <div class="product-card ${!product.isActive ? 'inactive' : ''} ${product.stock === 0 ? 'out-of-stock' : ''}">
                <div class="product-image">
                    <img src="${product.imageUrl || `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name)}`}" 
                         alt="${product.name}" 
                         onerror="this.src='https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name)}'">
                    ${!product.isActive ? '<div class="inactive-badge">Неактивен</div>' : ''}
                    ${product.stock === 0 ? '<div class="out-of-stock-badge">Нет в наличии</div>' : ''}
                </div>
                <div class="product-info">
                    <h4 class="product-name">${this.escapeHtml(product.name)}</h4>
                    <p class="product-price">${this.formatPrice(product.price)} руб</p>
                    
                    <div class="product-actions">
                        ${canAddProducts ? `
                            <button class="btn btn-sm btn-outline add-product-btn" onclick="openAddProductModal()" title="Добавить товар">
                                <i class="fas fa-plus"></i>
                            </button>
                        ` : ''}
                        ${canEdit ? `
                            <button class="btn btn-sm btn-outline edit-product-btn" onclick="window.location.href='edit-product.html?id=${product.id}'">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-primary add-to-cart-btn" onclick="addToCart('${product.id}')">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    handleSearch() {
        const searchTerm = this.productSearch.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm)
            );
        }
        
        this.renderProducts();
    }

    handleSort() {
        const sortBy = this.sortSelect.value;
        
        switch (sortBy) {
            case 'name-asc':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                this.filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'price-asc':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                this.filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                this.filteredProducts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
        }
        
        this.renderProducts();
    }

    async addProduct() {
        const formData = new FormData(document.getElementById('add-product-form'));
        const productData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            stock: parseInt(formData.get('stock')),
            isActive: formData.get('isActive') === 'on'
        };

        try {
            const response = await ApiClient.post(`/product/add/${this.shopId}`, productData);
            
            if (response.ok || response.success) {
                MessageManager.showSuccess('Товар успешно добавлен');
                this.closeAddProductModal();
                this.loadProducts(); // Перезагружаем список товаров
            } else {
                MessageManager.showError('Не удалось добавить товар');
            }
        } catch (error) {
            MessageManager.showError('Ошибка при добавлении товара');
        }
    }

    closeAddProductModal() {
        const modal = document.getElementById('add-product-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price);
    }

    showLoading() {
        if (this.loading) this.loading.style.display = 'flex';
        if (this.errorMessage) this.errorMessage.style.display = 'none';
    }

    hideLoading() {
        if (this.loading) this.loading.style.display = 'none';
    }

    showError(message = 'Не удалось загрузить товары. Попробуйте обновить страницу.') {
        if (this.errorMessage) {
            this.errorMessage.querySelector('span').textContent = message;
            this.errorMessage.style.display = 'flex';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Глобальные функции для модального окна добавления товара
function openAddProductModal() {
    const modal = document.getElementById('add-product-modal');
    const shopIdInput = document.getElementById('current-shop-id');
    
    if (modal && shopIdInput && window.shopPage) {
        shopIdInput.value = window.shopPage.shopId;
        modal.style.display = 'flex';
    }
}

function closeAddProductModal() {
    const modal = document.getElementById('add-product-modal');
    const form = document.getElementById('add-product-form');
    
    if (modal) {
        modal.style.display = 'none';
    }
    
    if (form) {
        form.reset();
    }
}

// Глобальная функция для добавления в корзину
function addToCart(productId) {
    if (!TokenManager.isAuthenticated()) {
        MessageManager.show('error-container', 'Для добавления товаров в корзину необходимо авторизоваться', 'error');
        return;
    }
    
    MessageManager.show('success-container', 'Товар добавлен в корзину', 'success');
}

// Инициализация страницы при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем HeaderManager для авторизации
    new HeaderManager();
    
    // Инициализируем страницу товаров магазина
    new ShopProductsPage();
});
