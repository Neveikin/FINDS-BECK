// Управление страницей магазинов
class ShopsPage {
    constructor() {
        // Проверяем доступность API_CONFIG
        if (typeof API_CONFIG === 'undefined') {
            console.error('API_CONFIG не определен!');
            return;
        }
        
        this.shopsGrid = document.getElementById('shops-grid');
        this.loading = document.getElementById('loading');
        this.errorMessage = document.getElementById('error-message');
        this.searchInput = document.getElementById('shop-search');
        this.searchBtn = document.getElementById('search-btn');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        
        this.shops = [];
        this.filteredShops = [];
        
        this.init();
    }

    init() {
        console.log('Инициализация страницы магазинов...');
        console.log('API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
        console.log('TokenManager.isAuthenticated():', TokenManager.isAuthenticated());
        
        this.setupEventListeners();
        this.loadShops();
    }

    setupEventListeners() {
        // Поиск
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.handleSearch());
        }
        
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => this.handleSearch());
        }

        // Фильтры
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });

        // Enter в поиске
        if (this.searchInput) {
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }
    }

    async loadShops() {
        try {
            console.log('Начинаю загрузку магазинов...');
            this.showLoading();
            
            // Используем прямой URL для отладки
            const url = 'http://localhost:8090/api/shops';
            console.log('URL запроса:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(TokenManager.isAuthenticated() && {
                        'Authorization': `Bearer ${TokenManager.getAccessToken()}`
                    })
                }
            });

            console.log('Статус ответа:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                let errorMessage = 'Ошибка загрузки магазинов';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (e) {
                    // Если не удалось распарсить ошибку
                }
                throw new Error(`${errorMessage} (${response.status})`);
            }

            const data = await response.json();
            console.log('Полученные данные:', data);
            
            this.shops = Array.isArray(data) ? data : [];
            this.filteredShops = [...this.shops];
            
            console.log('Количество магазинов:', this.shops.length);
            
            this.renderShops();
            this.hideLoading();
            
            if (this.shops.length === 0) {
                MessageManager.showInfo('Магазины не найдены');
            } else {
                MessageManager.showSuccess(`Загружено ${this.shops.length} магазинов`);
            }
            
        } catch (error) {
            console.error('Error loading shops:', error);
            this.showError();
            this.hideLoading();
            MessageManager.showError(`Не удалось загрузить магазины: ${error.message}`);
        }
    }

    renderShops() {
        if (!this.shopsGrid) return;

        if (this.filteredShops.length === 0) {
            this.shopsGrid.innerHTML = `
                <div class="no-shops">
                    <i class="fas fa-store-slash"></i>
                    <h3>Магазины не найдены</h3>
                    <p>Попробуйте изменить параметры поиска или фильтры</p>
                </div>
            `;
            return;
        }

        const shopsHTML = this.filteredShops.map(shop => this.createShopCard(shop)).join('');
        this.shopsGrid.innerHTML = shopsHTML;
    }

    createShopCard(shop) {
        const shopId = shop.id || '';
        const shopName = shop.name || 'Без названия';
        const shopDescription = shop.description || 'Описание отсутствует';
        const shopLogo = shop.logoUrl || 'https://via.placeholder.com/200x200?text=' + encodeURIComponent(shopName.charAt(0));
        const shopRating = shop.rating || 0;
        const shopProducts = shop.productCount || 0;
        
        // Проверяем, является ли текущий пользователь владельцем магазина
        const currentUser = TokenManager.getUser();
        const isOwner = currentUser && shop.owners && shop.owners.some(owner => owner.email === currentUser.email);
        const isAdmin = currentUser && currentUser.role === 'ADMIN';

        return `
            <div class="shop-card">
                <div class="shop-logo">
                    <img src="${shopLogo}" alt="${shopName}" onerror="this.src='https://via.placeholder.com/200x200?text=${encodeURIComponent(shopName.charAt(0))}'">
                </div>
                <div class="shop-info">
                    <h3 class="shop-name">${this.escapeHtml(shopName)}</h3>
                    <p class="shop-description">${this.escapeHtml(shopDescription)}</p>
                    <div class="shop-stats">
                        <div class="shop-rating">
                            <i class="fas fa-star"></i>
                            <span>${shopRating.toFixed(1)}</span>
                        </div>
                        <div class="shop-products-count">
                            <i class="fas fa-box"></i>
                            <span>${shopProducts} товаров</span>
                        </div>
                    </div>
                    <div class="shop-actions">
                        <button class="btn btn-primary" onclick="window.location.href='shop-products.html?id=${shopId}'">
                            <i class="fas fa-eye"></i> Товары
                        </button>
                        ${(isOwner || isAdmin) ? `
                            <button class="btn btn-success" onclick="openAddProductModal('${shopId}', '${shopName}')">
                                <i class="fas fa-plus"></i> Добавить товар
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    handleSearch() {
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.filteredShops = [...this.shops];
        } else {
            this.filteredShops = this.shops.filter(shop => 
                shop.name.toLowerCase().includes(searchTerm) ||
                shop.description.toLowerCase().includes(searchTerm)
            );
        }
        
        this.renderShops();
    }

    handleFilter(e) {
        // Удаляем активный класс у всех кнопок
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Добавляем активный класс текущей кнопке
        e.target.classList.add('active');
        
        const filter = e.target.dataset.filter;
        
        if (filter === 'all') {
            this.filteredShops = [...this.shops];
        } else {
            // Фильтрация по категории (если у магазина есть поле category)
            this.filteredShops = this.shops.filter(shop => 
                shop.category === filter || 
                shop.name.toLowerCase().includes(filter.toLowerCase())
            );
        }
        
        this.renderShops();
    }

    showLoading() {
        if (this.loading) this.loading.style.display = 'flex';
        if (this.errorMessage) this.errorMessage.style.display = 'none';
    }

    hideLoading() {
        if (this.loading) this.loading.style.display = 'none';
    }

    showError() {
        if (this.errorMessage) this.errorMessage.style.display = 'flex';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Обработка формы добавления товара
document.addEventListener('DOMContentLoaded', () => {
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(addProductForm);
            const productData = {
                name: formData.get('name'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price')),
                stock: parseInt(formData.get('stock')),
                isActive: formData.get('isActive') === 'on'
            };
            
            try {
                const response = await ApiClient.post(`/product/add/${formData.get('shopId')}`, productData);
                
                if (response.success) {
                    MessageManager.show('success-container', 'Товар успешно добавлен', 'success');
                    closeAddProductModal();
                } else {
                    MessageManager.show('error-container', response.message || 'Не удалось добавить товар', 'error');
                }
            } catch (error) {
                console.error('Error adding product:', error);
                MessageManager.show('error-container', 'Ошибка при добавлении товара', 'error');
            }
        });
    }
});

// Инициализация страницы при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем HeaderManager для авторизации
    new HeaderManager();
    
    // Ждем немного, чтобы API_CONFIG загрузился
    setTimeout(() => {
        
        // Инициализируем страницу магазинов
        new ShopsPage();
    }, 100);
});
