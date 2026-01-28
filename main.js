/**
 * Product Catalog Application
 * Tuân thủ rules.md: OOP, Design Pattern, Clean Architecture
 */

// ========== MODELS ==========

/**
 * Category Model - Đại diện cho danh mục sản phẩm
 */
class Category {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.slug = data.slug;
        this.image = data.image;
        this.creationAt = new Date(data.creationAt);
        this.updatedAt = new Date(data.updatedAt);
    }

    /**
     * Lấy tên hiển thị của category
     * @returns {string}
     */
    getDisplayName() {
        return this.name || 'Uncategorized';
    }
}

/**
 * Product Model - Đại diện cho sản phẩm
 */
class Product {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.slug = data.slug;
        this.price = data.price;
        this.description = data.description;
        this.category = new Category(data.category);
        this.images = data.images || [];
        this.creationAt = new Date(data.creationAt);
        this.updatedAt = new Date(data.updatedAt);
    }

    /**
     * Lấy ảnh đầu tiên của sản phẩm
     * @returns {string}
     */
    getPrimaryImage() {
        return this.images[0] || 'https://placehold.co/600x400?text=No+Image';
    }

    /**
     * Format giá tiền
     * @returns {string}
     */
    getFormattedPrice() {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'USD'
        }).format(this.price);
    }

    /**
     * Lấy mô tả ngắn gọn
     * @param {number} maxLength - Độ dài tối đa
     * @returns {string}
     */
    getShortDescription(maxLength = 100) {
        if (!this.description) return 'No description available';
        if (this.description.length <= maxLength) return this.description;
        return this.description.substring(0, maxLength) + '...';
    }
}

// ========== SERVICE ==========

/**
 * ProductService - Quản lý dữ liệu sản phẩm
 * Áp dụng Service Pattern
 */
class ProductService {
    constructor() {
        this.products = [];
    }

    /**
     * Load sản phẩm từ JSON data
     * @param {Array} jsonData - Dữ liệu JSON
     * @returns {Array<Product>}
     */
    loadFromJson(jsonData) {
        this.products = jsonData.map(item => new Product(item));
        return this.products;
    }

    /**
     * Lấy tất cả sản phẩm
     * @returns {Array<Product>}
     */
    getAllProducts() {
        return this.products;
    }

    /**
     * Lấy số lượng sản phẩm
     * @returns {number}
     */
    getProductCount() {
        return this.products.length;
    }

    /**
     * Tìm sản phẩm theo ID
     * @param {number} id 
     * @returns {Product|undefined}
     */
    findById(id) {
        return this.products.find(product => product.id === id);
    }

    /**
     * Lọc sản phẩm theo category
     * @param {string} categorySlug 
     * @returns {Array<Product>}
     */
    filterByCategory(categorySlug) {
        return this.products.filter(
            product => product.category.slug === categorySlug
        );
    }

    /**
     * Lấy danh sách categories unique
     * @returns {Array<Category>}
     */
    getUniqueCategories() {
        const categoryMap = new Map();
        this.products.forEach(product => {
            if (!categoryMap.has(product.category.id)) {
                categoryMap.set(product.category.id, product.category);
            }
        });
        return Array.from(categoryMap.values());
    }
}

// ========== RENDERER ==========

/**
 * ProductRenderer - Render UI cho sản phẩm
 * Tách biệt UI khỏi Business Logic
 */
class ProductRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with id "${containerId}" not found`);
        }
    }

    /**
     * Tạo HTML cho một product card
     * @param {Product} product 
     * @returns {string}
     */
    createProductCardHtml(product) {
        return `
            <article class="product-card" data-product-id="${product.id}">
                <div class="product-card__image-wrapper">
                    <img 
                        class="product-card__image" 
                        src="${this.escapeHtml(product.getPrimaryImage())}" 
                        alt="${this.escapeHtml(product.title)}"
                        loading="lazy"
                        onerror="this.src='https://placehold.co/600x400?text=Error'"
                    >
                    <span class="product-card__category">
                        ${this.escapeHtml(product.category.getDisplayName())}
                    </span>
                </div>
                <div class="product-card__body">
                    <h2 class="product-card__title">${this.escapeHtml(product.title)}</h2>
                    <p class="product-card__description">${this.escapeHtml(product.getShortDescription())}</p>
                    <div class="product-card__footer">
                        <span class="product-card__price">${product.getFormattedPrice()}</span>
                        <span class="product-card__id">ID: ${product.id}</span>
                    </div>
                </div>
            </article>
        `;
    }

    /**
     * Render danh sách sản phẩm
     * @param {Array<Product>} products 
     */
    renderProducts(products) {
        if (products.length === 0) {
            this.container.innerHTML = '<p style="text-align: center; color: var(--color-text-muted);">Không có sản phẩm nào</p>';
            return;
        }

        const html = products.map(product => this.createProductCardHtml(product)).join('');
        this.container.innerHTML = html;
    }

    /**
     * Hiển thị loading state
     */
    showLoading() {
        this.container.innerHTML = `
            <div class="loading">
                <div class="loading__spinner"></div>
            </div>
        `;
    }

    /**
     * Hiển thị thông báo lỗi
     * @param {string} message 
     */
    showError(message) {
        this.container.innerHTML = `
            <p style="text-align: center; color: var(--color-error); padding: 2rem;">
                ❌ ${this.escapeHtml(message)}
            </p>
        `;
    }

    /**
     * Escape HTML để tránh XSS
     * @param {string} str 
     * @returns {string}
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// ========== APPLICATION CONTROLLER ==========

/**
 * ProductCatalogApp - Controller chính của ứng dụng
 * Điều phối giữa Service và Renderer
 */
class ProductCatalogApp {
    constructor() {
        this.productService = new ProductService();
        this.productRenderer = new ProductRenderer('productGrid');
        this.productCountElement = document.getElementById('productCount');
    }

    /**
     * Khởi tạo ứng dụng
     */
    init() {
        try {
            this.productRenderer.showLoading();

            // Load dữ liệu từ JSON
            const products = this.productService.loadFromJson(PRODUCT_DATA);

            // Cập nhật số lượng
            this.updateProductCount(products.length);

            // Render sản phẩm
            this.productRenderer.renderProducts(products);

        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Cập nhật hiển thị số lượng sản phẩm
     * @param {number} count 
     */
    updateProductCount(count) {
        if (this.productCountElement) {
            this.productCountElement.textContent = `${count} sản phẩm`;
        }
    }

    /**
     * Xử lý lỗi
     * @param {Error} error 
     */
    handleError(error) {
        this.productRenderer.showError('Có lỗi xảy ra khi tải dữ liệu sản phẩm');
        // Log lỗi để debug (trong production nên gửi đến logging service)
        if (typeof console !== 'undefined' && process?.env?.NODE_ENV !== 'production') {
            console.error('ProductCatalogApp Error:', error);
        }
    }
}

// ========== DATA ==========

/**
 * Dữ liệu sản phẩm - Được tách riêng để dễ quản lý
 * Trong thực tế, data này sẽ được load từ API
 */
const PRODUCT_DATA = [
    { "id": 160, "title": "External Hard Drive", "slug": "external-hard-drive", "price": 890, "description": "High-capacity external hard drive offering fast data transfer, reliable storage, and secure backup for personal and professional use.", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-27T12:58:26.000Z", "updatedAt": "2026-01-27T12:58:26.000Z" },
    { "id": 187, "title": "Fire Red Sport Sneakers", "slug": "fire-red-sport-sneakers", "price": 95, "description": "Bold red sneakers designed for those who love speed and style. Features advanced grip technology.", "category": { "id": 4, "name": "Shoes", "slug": "shoes", "image": "https://i.imgur.com/qNOjJje.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-27T11:46:15.000Z" }, "images": ["https://i.imgur.com/PgK0RMZ.png"], "creationAt": "2026-01-27T16:04:41.000Z", "updatedAt": "2026-01-27T16:04:41.000Z" },
    { "id": 188, "title": "Aggressive Black & Red Sneakers", "slug": "aggressive-black-red-sneakers", "price": 110, "description": "Dynamic color-block design in black and red. Built for durability and high-impact activities.", "category": { "id": 4, "name": "Shoes", "slug": "shoes", "image": "https://i.imgur.com/qNOjJje.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-27T11:46:15.000Z" }, "images": ["https://i.imgur.com/vPjonMX.png"], "creationAt": "2026-01-27T16:04:46.000Z", "updatedAt": "2026-01-27T16:04:46.000Z" },
    { "id": 189, "title": "Minimalist White Sport Smartwatch", "slug": "minimalist-white-sport-smartwatch", "price": 150, "description": "Stay connected and track your fitness with this sleek white smartwatch. Features heart rate monitoring, GPS, and a water-resistant design.", "category": { "id": 2, "name": "Electronics", "slug": "electronics", "image": "https://i.imgur.com/ZANVnHE.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-27T11:46:15.000Z" }, "images": ["https://i.imgur.com/3V4VwdP.png"], "creationAt": "2026-01-27T16:09:07.000Z", "updatedAt": "2026-01-27T16:09:07.000Z" },
    { "id": 190, "title": "Premium Black Wireless Headset", "slug": "premium-black-wireless-headset", "price": 120, "description": "Experience high-fidelity sound with these over-ear wireless headphones. Noise-canceling technology and 40-hour battery life.", "category": { "id": 2, "name": "Electronics", "slug": "electronics", "image": "https://i.imgur.com/ZANVnHE.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-27T11:46:15.000Z" }, "images": ["https://i.imgur.com/uAbpeVs.png"], "creationAt": "2026-01-27T16:09:13.000Z", "updatedAt": "2026-01-27T16:09:13.000Z" },
    { "id": 191, "title": "Waterproof Bluetooth Earbuds - Black", "slug": "waterproof-bluetooth-earbuds-black", "price": 80, "description": "Compact and powerful earbuds perfect for the gym or rainy commutes. IPX7 waterproof rating and seamless Bluetooth pairing.", "category": { "id": 2, "name": "Electronics", "slug": "electronics", "image": "https://i.imgur.com/ZANVnHE.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-27T11:46:15.000Z" }, "images": ["https://i.imgur.com/BEZlrr6.png"], "creationAt": "2026-01-27T16:09:19.000Z", "updatedAt": "2026-01-27T16:09:19.000Z" },
    { "id": 192, "title": "Vintage Mood Indigo Cap", "slug": "vintage-mood-indigo-cap", "price": 18, "description": "A stylish and adjustable cap in a deep indigo blue. Perfect for outdoor activities and casual outfits.", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://i.imgur.com/JLrUweq.png"], "creationAt": "2026-01-27T16:35:02.000Z", "updatedAt": "2026-01-27T16:35:02.000Z" },
    { "id": 193, "title": "Vibrant Purple Cotton Cap", "slug": "vibrant-purple-cotton-cap", "price": 18, "description": "Add a pop of color to your look with this comfortable purple cap made from high-quality cotton fabric.", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://i.imgur.com/UaFWQbU.png"], "creationAt": "2026-01-27T16:35:06.000Z", "updatedAt": "2026-01-27T16:35:06.000Z" },
    { "id": 194, "title": "Classic Red Sport Cap", "slug": "classic-red-sport-cap", "price": 18, "description": "A bold red cap with an adjustable strap. Durable, breathable, and designed for daily wear.", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://i.imgur.com/hrOcUSp.png"], "creationAt": "2026-01-27T16:35:11.000Z", "updatedAt": "2026-01-27T16:35:11.000Z" },
    { "id": 195, "title": "Minimalist White T-Shirt", "slug": "minimalist-white-t-shirt", "price": 25, "description": "A crisp, clean white t-shirt made from premium cotton. A staple piece for any minimalist wardrobe.", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://i.imgur.com/A30Jtpr.png"], "creationAt": "2026-01-27T16:35:17.000Z", "updatedAt": "2026-01-27T16:35:17.000Z" },
    { "id": 196, "title": "Essential Black T-Shirt", "slug": "essential-black-t-shirt", "price": 25, "description": "Classic black t-shirt with a modern fit. Soft to the touch and resistant to multiple washes.", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://i.imgur.com/Yhq2VNz.png"], "creationAt": "2026-01-27T16:35:22.000Z", "updatedAt": "2026-01-27T16:35:22.000Z" },
    { "id": 197, "title": "Sleek White Wireless Bluetooth Headset", "slug": "sleek-white-wireless-bluetooth-headset", "price": 130, "description": "Experience pure sound with this elegant white wireless headset. Ergonomic design with long-lasting battery life and crystal-clear audio.", "category": { "id": 2, "name": "Electronics", "slug": "electronics", "image": "https://i.imgur.com/ZANVnHE.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-27T11:46:15.000Z" }, "images": ["https://i.imgur.com/rkQ9fs3.png"], "creationAt": "2026-01-27T16:37:03.000Z", "updatedAt": "2026-01-27T16:37:03.000Z" },
    { "id": 198, "title": "Ocean Blue Waterproof Gym Bag", "slug": "ocean-blue-waterproof-gym-bag", "price": 40, "description": "Keep your gear dry and organized with this durable, waterproof blue gym bag. Features multiple compartments and a comfortable shoulder strap.", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://i.imgur.com/cWXA1TG.png"], "creationAt": "2026-01-27T16:37:07.000Z", "updatedAt": "2026-01-27T16:37:07.000Z" },
    { "id": 199, "title": "Active Red Waterproof Gym Bag", "slug": "active-red-waterproof-gym-bag", "price": 40, "description": "High-visibility red gym bag made from waterproof material. Perfect for the gym, swimming, or outdoor adventures.", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://i.imgur.com/aMkyLvm.png"], "creationAt": "2026-01-27T16:37:13.000Z", "updatedAt": "2026-01-27T16:37:13.000Z" },
    { "id": 200, "title": "Sweater", "slug": "sweater", "price": 50, "description": "Test sweater", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-27T16:44:10.000Z", "updatedAt": "2026-01-27T16:44:10.000Z" },
    { "id": 202, "title": "user_1769533275149mm", "slug": "user-1769533275149mm", "price": 100, "description": "Updated description", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://placeimg.com/640/480/any"], "creationAt": "2026-01-27T17:01:15.000Z", "updatedAt": "2026-01-27T17:01:16.000Z" },
    { "id": 204, "title": "New Product", "slug": "new-product", "price": 10, "description": "A description", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-27T17:54:55.000Z", "updatedAt": "2026-01-27T17:54:55.000Z" },
    { "id": 210, "title": "nmtnfgb", "slug": "nmtnfgb", "price": 325, "description": "drghetghdtdb", "category": { "id": 2, "name": "Electronics", "slug": "electronics", "image": "https://i.imgur.com/ZANVnHE.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-27T11:46:15.000Z" }, "images": ["https://placeimg.com/640/480/tech"], "creationAt": "2026-01-27T18:12:31.000Z", "updatedAt": "2026-01-27T18:12:31.000Z" },
    { "id": 211, "title": "T-Shirt", "slug": "t-shirt", "price": 70, "description": "A description", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-27T18:50:45.000Z", "updatedAt": "2026-01-27T18:50:45.000Z" },
    { "id": 212, "title": "Skinny Jeans", "slug": "skinny-jeans", "price": 40, "description": "A description", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-27T18:51:47.000Z", "updatedAt": "2026-01-27T18:51:47.000Z" },
    { "id": 213, "title": "Jeans", "slug": "jeans", "price": 50, "description": "A description", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-27T19:04:23.000Z", "updatedAt": "2026-01-27T19:04:23.000Z" },
    { "id": 214, "title": "Shirt", "slug": "shirt", "price": 50, "description": "A description", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-27T19:07:13.000Z", "updatedAt": "2026-01-27T19:07:13.000Z" },
    { "id": 215, "title": "jacket", "slug": "jacket", "price": 13, "description": "red", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-27T21:34:17.000Z", "updatedAt": "2026-01-27T21:34:17.000Z" },
    { "id": 216, "title": "title 1", "slug": "title-1", "price": 300, "description": "lorem", "category": { "id": 2, "name": "Electronics", "slug": "electronics", "image": "https://i.imgur.com/ZANVnHE.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-27T11:46:15.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-27T22:41:40.000Z", "updatedAt": "2026-01-27T22:41:40.000Z" },
    { "id": 217, "title": "88", "slug": "88", "price": 99, "description": "jhjhh", "category": { "id": 2, "name": "Electronics", "slug": "electronics", "image": "https://i.imgur.com/ZANVnHE.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-27T11:46:15.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-27T22:58:48.000Z", "updatedAt": "2026-01-27T22:58:48.000Z" },
    { "id": 218, "title": "y", "slug": "y", "price": 55, "description": "hh", "category": { "id": 4, "name": "Shoes", "slug": "shoes", "image": "https://i.imgur.com/qNOjJje.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-27T11:46:15.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-27T22:59:15.000Z", "updatedAt": "2026-01-27T22:59:15.000Z" },
    { "id": 220, "title": "aml", "slug": "aml", "price": 400, "description": "lorem", "category": { "id": 2, "name": "Electronics", "slug": "electronics", "image": "https://i.imgur.com/ZANVnHE.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-27T11:46:15.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-27T23:42:20.000Z", "updatedAt": "2026-01-27T23:42:20.000Z" },
    { "id": 221, "title": "amlvv0", "slug": "amlvv0", "price": 400, "description": "lorem", "category": { "id": 2, "name": "Electronics", "slug": "electronics", "image": "https://i.imgur.com/ZANVnHE.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-27T11:46:15.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-28T00:11:15.000Z", "updatedAt": "2026-01-28T00:12:30.000Z" },
    { "id": 222, "title": "ahmed01", "slug": "ahmed01", "price": 40, "description": "lorem 4", "category": { "id": 5, "name": "Miscellaneous", "slug": "miscellaneous", "image": "https://i.imgur.com/BG8J0Fj.jpg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-27T15:16:02.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-28T00:13:45.000Z", "updatedAt": "2026-01-28T00:18:11.000Z" },
    { "id": 223, "title": "Mất quyền kiểm soát", "slug": "mat-quyen-kiem-soat", "price": 345, "description": "Mất quyền kiểm soát", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-28T02:32:51.000Z", "updatedAt": "2026-01-28T02:32:51.000Z" },
    { "id": 224, "title": "Mất quyền kiểm soát 1", "slug": "mat-quyen-kiem-soat-1", "price": 101, "description": "Sản phẩm Mất quyền kiểm soát số 1", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-28T02:34:48.000Z", "updatedAt": "2026-01-28T02:34:48.000Z" },
    { "id": 225, "title": "Mất quyền kiểm soát 2", "slug": "mat-quyen-kiem-soat-2", "price": 102, "description": "Sản phẩm Mất quyền kiểm soát số 2", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-28T02:34:57.000Z", "updatedAt": "2026-01-28T02:34:57.000Z" },
    { "id": 226, "title": "Mất quyền kiểm soát 3", "slug": "mat-quyen-kiem-soat-3", "price": 103, "description": "Sản phẩm Mất quyền kiểm soát số 3", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-28T02:35:06.000Z", "updatedAt": "2026-01-28T02:35:06.000Z" },
    { "id": 227, "title": "Mất quyền kiểm soát 4", "slug": "mat-quyen-kiem-soat-4", "price": 104, "description": "Sản phẩm Mất quyền kiểm soát số 4", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-28T02:36:10.000Z", "updatedAt": "2026-01-28T02:36:10.000Z" },
    { "id": 228, "title": "Mất quyền kiểm so soát 5", "slug": "mat-quyen-kiem-so-soat-5", "price": 105, "description": "Sản phẩm Mất quyền kiểm soát số 5", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-28T02:36:19.000Z", "updatedAt": "2026-01-28T02:36:19.000Z" },
    { "id": 229, "title": "Mất quyền kiểm soát 6", "slug": "mat-quyen-kiem-soat-6", "price": 106, "description": "Sản phẩm Mất quyền kiểm soát số 6", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-28T02:36:26.000Z", "updatedAt": "2026-01-28T02:36:26.000Z" },
    { "id": 230, "title": "Mất quyền kiểm soát 7", "slug": "mat-quyen-kiem-soat-7", "price": 107, "description": "Sản phẩm Mất quyền kiểm soát số 7", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-28T02:36:33.000Z", "updatedAt": "2026-01-28T02:36:33.000Z" },
    { "id": 231, "title": "Mất quyền kiểm soát 8", "slug": "mat-quyen-kiem-soat-8", "price": 108, "description": "Sản phẩm Mất quyền kiểm soát số 8", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-28T02:36:39.000Z", "updatedAt": "2026-01-28T02:36:39.000Z" },
    { "id": 233, "title": "شاشه سمارت", "slug": "", "price": 890, "description": "High-capacity external hard drive offering fast data transfer, reliable storage, and secure backup for personal and professional use.", "category": { "id": 2, "name": "Electronics", "slug": "electronics", "image": "https://i.imgur.com/ZANVnHE.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-27T11:46:15.000Z" }, "images": ["https://placehold.co/600x400"], "creationAt": "2026-01-28T02:55:46.000Z", "updatedAt": "2026-01-28T02:55:46.000Z" },
    { "id": 245, "title": "Iphone", "slug": "iphone", "price": 80000, "description": "Ios Device", "category": { "id": 1, "name": "Clothes", "slug": "clothes", "image": "https://i.imgur.com/QkIa5tT.jpeg", "creationAt": "2026-01-27T11:46:15.000Z", "updatedAt": "2026-01-28T02:54:10.000Z" }, "images": ["https://placeimg.com/640/480/tech"], "creationAt": "2026-01-28T06:07:43.000Z", "updatedAt": "2026-01-28T06:07:43.000Z" }
];

// ========== INITIALIZATION ==========

/**
 * Khởi tạo ứng dụng khi DOM đã sẵn sàng
 */
document.addEventListener('DOMContentLoaded', () => {
    const app = new ProductCatalogApp();
    app.init();
});
