// Управление страницей товаров магазина
class ShopProductsPage {
    constructor() {
        this.shopId = this.getShopIdFromUrl();
        this.productsGrid = document.getElementById('products-grid');
        this.loading = document.getElementById('loading');
        this.errorMessage = document.getElementById('error-message');
        this.productSearch = document.getElementById('product-search');
        this.searchProductsBtn = document.getElementById('search-products-btn');
        this.sortSelect = document.getElementById('sort-select');
        
        this.shop = null;
        this.products = [];
        this.filteredProducts = [];
        
        this.init();
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
        if (this.productSearch) {
            this.productSearch.addEventListener('input', () => this.handleSearch());
        }
        
        if (this.searchProductsBtn) {
            this.searchProductsBtn.addEventListener('click', () => this.handleSearch());
        }

        // Сортировка
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', () => this.handleSort());
        }

        // Enter в поиске
        if (this.productSearch) {
            this.productSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }
    }

    async loadShopInfo() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/shops/${this.shopId}`, {
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
            
        } catch (error) {
            console.error('Error loading shop info:', error);
            // Не показываем ошибку критично, продолжаем загрузку товаров
        }
    }

    async loadProducts() {
        try {
            this.showLoading();
            
            // В реальном приложении здесь будет запрос к API для получения товаров магазина
            // Пока используем моковые данные
            const mockProducts = this.generateMockProducts();
            
            // Имитация задержки загрузки
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.products = mockProducts;
            this.filteredProducts = [...this.products];
            
            this.renderProducts();
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError();
            this.hideLoading();
        }
    }

    generateMockProducts() {
        const productNames = [
            'Смартфон iPhone 15', 'Ноутбук MacBook Pro', 'Наушники AirPods',
            'Камера Canon EOS', 'Планшет iPad', 'Часы Apple Watch',
            'Клавиатура Mechanical', 'Мышь Gaming Mouse', 'Монитор 4K',
            'Колонки Bluetooth', 'Power Bank', 'Кабель USB-C'
        ];
        
        return productNames.map((name, index) => ({
            id: `product_${index + 1}`,
            name: name,
            price: Math.floor(Math.random() * 50000) + 1000,
            rating: (Math.random() * 2 + 3).toFixed(1),
            image: `https://via.placeholder.com/300x300?text=${encodeURIComponent(name.substring(0, 10))}`,
            description: `Отличное качество по доступной цене. ${name} - это выбор современных пользователей.`,
            inStock: Math.random() > 0.2
        }));
    }

    renderShopInfo() {
        if (!this.shop) return;

        const shopName = document.getElementById('shop-name');
        const shopDescription = document.getElementById('shop-description');
        const shopLogo = document.getElementById('shop-logo');
        const shopRating = document.getElementById('shop-rating');
        const productsCount = document.getElementById('products-count');

        if (shopName) shopName.textContent = this.shop.name || 'Магазин';
        if (shopDescription) shopDescription.textContent = this.shop.description || 'Описание магазина';
        if (shopLogo) {
            shopLogo.src = this.shop.logo || 'https://via.placeholder.com/100x100';
            shopLogo.alt = this.shop.name || 'Магазин';
        }
        if (shopRating) shopRating.textContent = (this.shop.rating || 0).toFixed(1);
        if (productsCount) productsCount.textContent = `${this.products.length} товаров`;
    }

    renderProducts() {
        if (!this.productsGrid) return;

        if (this.filteredProducts.length === 0) {
            this.productsGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-box-open"></i>
                    <h3>Товары не найдены</h3>
                    <p>Попробуйте изменить параметры поиска</p>
                </div>
            `;
            return;
        }

        const productsHTML = this.filteredProducts.map(product => this.createProductCard(product)).join('');
        this.productsGrid.innerHTML = productsHTML;
    }

    createProductCard(product) {
        return `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
                    ${!product.inStock ? '<div class="out-of-stock">Нет в наличии</div>' : ''}
                </div>
                <div class="product-info">
                    <h4 class="product-title">${this.escapeHtml(product.name)}</h4>
                    <div class="product-rating">
                        <i class="fas fa-star"></i>
                        <span>${product.rating}</span>
                    </div>
                    <p class="product-price">${this.formatPrice(product.price)} ₽</p>
                    <button class="btn btn-primary ${!product.inStock ? 'disabled' : ''}" 
                            onclick="addToCart('${product.id}')" 
                            ${!product.inStock ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                        ${product.inStock ? 'В корзину' : 'Нет в наличии'}
                    </button>
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
        const sortValue = this.sortSelect.value;
        
        switch (sortValue) {
            case 'name':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'price-asc':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                this.filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
        }
        
        this.renderProducts();
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

// Глобальная функция для добавления в корзину
function addToCart(productId) {
    if (!TokenManager.isAuthenticated()) {
        MessageManager.show('error-container', 'Для добавления товаров в корзину необходимо авторизоваться', 'error');
        return;
    }
    
    // Здесь будет логика добавления товара в корзину
    MessageManager.show('success-container', 'Товар добавлен в корзину', 'success');
}

// Инициализация страницы при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем HeaderManager для авторизации
    new HeaderManager();
    
    // Инициализируем страницу товаров магазина
    new ShopProductsPage();
});
