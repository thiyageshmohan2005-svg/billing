// ==================== DATA MANAGEMENT ==================== //
class BillingSystem {
    constructor() {
        this.bills = this.loadData('bills') || [];
        this.products = this.loadData('products') || this.getDefaultProducts();
        this.customers = this.loadData('customers') || {};
        this.settings = this.loadData('settings') || this.getDefaultSettings();
        this.currentBill = null;
        this.selectedPaymentMethod = 'cash';
        this.gstEnabled = false;
        this.charts = {};
        this.init();
    }

    getDefaultSettings() {
        return {
            defaultWhatsappNumber: '9159888991',
            autoSendWhatsapp: false,
            fullAutoSendWhatsapp: false,
            businessName: 'Sabari Cakes and Cafe',
            businessPhone: '8220347161',
            businessEmail: '',
            gstRate: 18,
            enableGstByDefault: false,
            showInvoiceDetails: false,
            enableNotifications: true,
            soundAlerts: true
        };
    }

    // ==================== DATA PERSISTENCE ==================== //
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving data:', e);
        }
    }

    loadData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error loading data:', e);
            return null;
        }
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            localStorage.clear();
            this.bills = [];
            this.products = this.getDefaultProducts();
            this.customers = {};
            this.saveData('products', this.products);
            location.reload();
        }
    }

    // ==================== INVOICE MANAGEMENT ==================== //
    generateInvoiceNumber() {
        const prefix = 'INV';
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = (this.bills.filter(b => b.invoiceNumber.startsWith(`${prefix}${date}`)).length + 1)
            .toString()
            .padStart(4, '0');
        return `${prefix}${date}${count}`;
    }

    createNewBill() {
        this.currentBill = {
            invoiceNumber: this.generateInvoiceNumber(),
            customerName: '',
            customerPhone: '',
            items: [],
            date: new Date(),
            paymentMethod: 'cash',
            gstIncluded: false,
            subtotal: 0,
            gstAmount: 0,
            grandTotal: 0
        };
        return this.currentBill;
    }

    addItemToBill(productName, quantity, price) {
        if (!this.currentBill) {
            this.createNewBill();
        }

        quantity = parseFloat(quantity) || 1;
        price = parseFloat(price) || 0;

        const item = {
            id: Date.now(),
            productName,
            quantity,
            price,
            total: quantity * price
        };

        this.currentBill.items.push(item);
        this.updateBillTotals();
        return item;
    }

    removeItemFromBill(itemId) {
        if (this.currentBill) {
            this.currentBill.items = this.currentBill.items.filter(item => item.id !== itemId);
            this.updateBillTotals();
        }
    }

    updateItemInBill(itemId, quantity, price) {
        if (this.currentBill) {
            const item = this.currentBill.items.find(i => i.id === itemId);
            if (item) {
                item.quantity = parseFloat(quantity) || 1;
                item.price = parseFloat(price) || 0;
                item.total = item.quantity * item.price;
                this.updateBillTotals();
            }
        }
    }

    updateBillTotals() {
        if (this.currentBill) {
            this.currentBill.subtotal = this.currentBill.items.reduce((sum, item) => sum + item.total, 0);
            this.currentBill.gstAmount = this.gstEnabled ? this.currentBill.subtotal * 0.18 : 0;
            this.currentBill.grandTotal = this.currentBill.subtotal + this.currentBill.gstAmount;
        }
    }

    saveBill() {
        if (!this.currentBill || !this.currentBill.customerName || this.currentBill.items.length === 0) {
            alert('Please enter customer name and add at least one item.');
            return false;
        }

        this.currentBill.gstIncluded = this.gstEnabled;
        this.bills.unshift(this.currentBill);
        this.saveData('bills', this.bills);
        this.updateCustomerData(this.currentBill);
        this.currentBill = null;
        return true;
    }

    deleteBill(invoiceNumber) {
        if (confirm('Are you sure you want to delete this bill?')) {
            this.bills = this.bills.filter(b => b.invoiceNumber !== invoiceNumber);
            this.saveData('bills', this.bills);
            this.loadBillsHistory();
        }
    }

    // ==================== PRODUCT MANAGEMENT ==================== //
    getDefaultProducts() {
        return [
            { id: 1, name: 'Water Bottle', price: 50, stock: 100, image: '💧' },
            { id: 2, name: 'Energy Drink', price: 80, stock: 50, image: '⚡' },
            { id: 3, name: 'Coffee', price: 120, stock: 75, image: '☕' },
            { id: 4, name: 'Tea', price: 80, stock: 100, image: '🍵' },
            { id: 5, name: 'Snacks', price: 100, stock: 150, image: '🍿' },
            { id: 6, name: 'Sandwich', price: 150, stock: 60, image: '🥪' }
        ];
    }

    addProduct(name, price, stock) {
        const product = {
            id: Date.now(),
            name,
            price: parseFloat(price) || 0,
            stock: parseInt(stock) || 0,
            image: '📦'  // Default emoji
        };
        this.products.push(product);
        this.saveData('products', this.products);
        return product;
    }

    updateProduct(id, name, price, stock) {
        const product = this.products.find(p => p.id === id);
        if (product) {
            product.name = name;
            product.price = parseFloat(price) || 0;
            product.stock = parseInt(stock) || 0;
            this.saveData('products', this.products);
        }
    }

    updateProductImage(id, imageData) {
        const product = this.products.find(p => p.id === id);
        if (product) {
            product.image = imageData;
            this.saveData('products', this.products);
        }
    }

    deleteProduct(id) {
        this.products = this.products.filter(p => p.id !== id);
        this.saveData('products', this.products);
    }

    searchProducts(query) {
        return this.products.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase())
        );
    }

    getProductPrice(productName) {
        const product = this.products.find(p =>
            p.name.toLowerCase() === productName.toLowerCase()
        );
        return product ? product.price : 0;
    }

    // ==================== CUSTOMER MANAGEMENT ==================== //
    updateCustomerData(bill) {
        const key = bill.customerPhone || bill.customerName;
        if (!this.customers[key]) {
            this.customers[key] = {
                name: bill.customerName,
                phone: bill.customerPhone,
                totalBills: 0,
                totalSpent: 0,
                lastVisit: null
            };
        }

        const customer = this.customers[key];
        customer.totalBills++;
        customer.totalSpent += bill.grandTotal;
        customer.lastVisit = bill.date;
        customer.name = bill.customerName;
        customer.phone = bill.customerPhone;

        this.saveData('customers', this.customers);
    }

    getCustomers() {
        return Object.values(this.customers);
    }

    // ==================== ANALYTICS ==================== //
    getTodayStats() {
        const today = new Date().toDateString();
        const todayBills = this.bills.filter(b => new Date(b.date).toDateString() === today);

        return {
            count: todayBills.length,
            revenue: todayBills.reduce((sum, b) => sum + b.grandTotal, 0),
            average: todayBills.length > 0 ? todayBills.reduce((sum, b) => sum + b.grandTotal, 0) / todayBills.length : 0
        };
    }

    getMonthlyStats() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthBills = this.bills.filter(b => {
            const billDate = new Date(b.date);
            return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
        });

        return {
            count: monthBills.length,
            revenue: monthBills.reduce((sum, b) => sum + b.grandTotal, 0)
        };
    }

    getLast7DaysStats() {
        const stats = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toDateString();

            const dayBills = this.bills.filter(b => new Date(b.date).toDateString() === dateString);
            const revenue = dayBills.reduce((sum, b) => sum + b.grandTotal, 0);

            stats.push({
                date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
                revenue: revenue
            });
        }
        return stats;
    }

    getPaymentMethodBreakdown() {
        const breakdown = {
            cash: 0,
            upi: 0,
            card: 0,
            credit: 0
        };

        this.bills.forEach(bill => {
            if (breakdown.hasOwnProperty(bill.paymentMethod)) {
                breakdown[bill.paymentMethod]++;
            }
        });

        return breakdown;
    }

    getTopSellingProducts() {
        const productSales = {};

        this.bills.forEach(bill => {
            bill.items.forEach(item => {
                if (!productSales[item.productName]) {
                    productSales[item.productName] = { quantity: 0, revenue: 0 };
                }
                productSales[item.productName].quantity += item.quantity;
                productSales[item.productName].revenue += item.total;
            });
        });

        return Object.entries(productSales)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
    }

    getMonthlyRevenueTrend() {
        const monthlyData = {};

        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
            monthlyData[monthKey] = 0;
        }

        this.bills.forEach(bill => {
            const monthKey = new Date(bill.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
            if (monthlyData.hasOwnProperty(monthKey)) {
                monthlyData[monthKey] += bill.grandTotal;
            }
        });

        return Object.entries(monthlyData).map(([month, revenue]) => ({ month, revenue }));
    }

    // ==================== SETTINGS MANAGEMENT ==================== //
    saveSettings(settings) {
        this.settings = { ...this.settings, ...settings };
        this.saveData('settings', this.settings);
    }

    getSettings() {
        return this.settings;
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveData('settings', this.settings);
    }

    // ==================== EXPORT ==================== //
    exportBillsToCSV() {
        let csv = 'Invoice Number,Customer Name,Phone,Date,Amount,Payment Method\n';

        this.bills.forEach(bill => {
            const date = new Date(bill.date).toLocaleString('en-IN');
            csv += `"${bill.invoiceNumber}","${bill.customerName}","${bill.customerPhone || 'N/A'}","${date}",${bill.grandTotal},"${bill.paymentMethod}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bills-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    }

    // ==================== INITIALIZATION ==================== //
    init() {
        this.createNewBill();
    }
}
class UIManager {
    constructor(billingSystem) {
        this.billing = billingSystem;
        this.currentViewBill = null;
        this.currentProductId = null;
        this.currentImageData = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
        this.loadBillingView();
    }

    // ==================== EVENT LISTENERS ==================== //
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.target.closest('.nav-btn').dataset.view));
        });

        // Bill Creation
        document.getElementById('addItemBtn').addEventListener('click', () => this.openAddItemModal());
        document.getElementById('saveBillBtn').addEventListener('click', () => this.saveBill());
        document.getElementById('resetBillBtn').addEventListener('click', () => this.resetBill());
        document.getElementById('printBillBtn').addEventListener('click', () => this.printBill());
        document.getElementById('whatsappBillBtn').addEventListener('click', () => this.sendViaWhatsApp());

        // Modal Controls
        document.getElementById('confirmAddItemBtn').addEventListener('click', () => this.confirmAddItem());
        document.querySelector('#addItemModal .modal-close').addEventListener('click', () => this.closeAddItemModal());
        document.getElementById('cancelAddItemBtn').addEventListener('click', () => this.closeAddItemModal());

        // Product Modal
        document.getElementById('addProductBtn').addEventListener('click', () => this.openAddProductModal());
        document.getElementById('confirmAddProductBtn').addEventListener('click', () => this.confirmAddProduct());
        document.querySelector('#addProductModal .modal-close').addEventListener('click', () => this.closeAddProductModal());
        document.getElementById('cancelAddProductBtn').addEventListener('click', () => this.closeAddProductModal());

        // GST Checkbox
        document.getElementById('gstCheckbox').addEventListener('change', (e) => {
            this.billing.gstEnabled = e.target.checked;
            this.billing.updateBillTotals();
            this.updateBillDisplay();
        });

        // Payment Methods
        document.querySelectorAll('.payment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectPaymentMethod(e.target.closest('.payment-btn')));
        });

        // Bills History
        document.getElementById('exportCsvBtn').addEventListener('click', () => this.billing.exportBillsToCSV());
        document.getElementById('billSearchInput').addEventListener('input', (e) => this.searchBills(e.target.value));

        // Customers
        document.getElementById('customerSearchInput').addEventListener('input', (e) => this.searchCustomers(e.target.value));

        // Clear Data
        document.getElementById('clearDataBtn').addEventListener('click', () => this.billing.clearAllData());

        // Product Autocomplete
        document.getElementById('productNameInput').addEventListener('input', (e) => this.showProductSuggestions(e.target.value));
        document.getElementById('productNameInput').addEventListener('focus', function() {
            if (this.value) {
                document.getElementById('productSuggestions').style.display = 'block';
            }
        });

        // Product Price Autocomplete
        document.getElementById('productNameInput').addEventListener('blur', () => {
            setTimeout(() => document.getElementById('productSuggestions').style.display = 'none', 200);
        });

        // Toggle Gallery
        document.getElementById('toggleGalleryBtn')?.addEventListener('click', () => this.toggleGallery());

        // View Bill Modal
        document.querySelector('#viewBillModal .modal-close').addEventListener('click', () => this.closeViewBillModal());
        document.getElementById('closeBillDetailBtn').addEventListener('click', () => this.closeViewBillModal());
        document.getElementById('printBillDetailBtn').addEventListener('click', () => this.printBillDetail());
        document.getElementById('whatsappBillDetailBtn').addEventListener('click', () => this.sendBillViaWhatsApp());

        // Upload Image Modal
        document.querySelector('#uploadImageModal .modal-close').addEventListener('click', () => this.closeUploadImageModal());
        document.getElementById('cancelUploadBtn').addEventListener('click', () => this.closeUploadImageModal());
        document.getElementById('confirmUploadBtn').addEventListener('click', () => this.confirmUploadImage());
        document.getElementById('imageInput').addEventListener('change', (e) => this.previewImage(e));

        // Settings
        document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());
        document.getElementById('saveBusinessSettingsBtn').addEventListener('click', () => this.saveBusinessSettings());
        document.getElementById('saveBillSettingsBtn').addEventListener('click', () => this.saveBillSettings());
        document.getElementById('testWhatsappBtn').addEventListener('click', () => this.testWhatsApp());
        document.getElementById('resetSettings').addEventListener('click', () => this.resetSettings());
        document.getElementById('exportSettings').addEventListener('click', () => this.exportSettings());
    }

    // ==================== VIEW MANAGEMENT ==================== //
    switchView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
        // Show selected view
        document.getElementById(`${viewName}-view`).classList.add('active');

        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        // Update page title
        const titles = {
            'bills': 'Create Bill',
            'bills-history': 'Bills History',
            'analytics': 'Analytics & Reports',
            'customers': 'Customer Management',
            'products': 'Product Inventory',
            'quick-add': 'Quick Add Products',
            'settings': 'Settings'
        };
        document.getElementById('pageTitle').textContent = titles[viewName];

        // Load view data
        if (viewName === 'bills-history') this.loadBillsHistory();
        if (viewName === 'analytics') this.loadAnalytics();
        if (viewName === 'customers') this.loadCustomers();
        if (viewName === 'products') this.loadProducts();
        if (viewName === 'quick-add') this.displayQuickAddGallery();
        if (viewName === 'settings') this.loadSettingsView();
        if (viewName === 'bills') this.loadBillingView();
    }

    // ==================== BILLING VIEW ==================== //
    loadBillingView() {
        this.updateInvoiceNumber();
        this.updateBillDisplay();
        this.displayProductGallery();
    }

    displayProductGallery() {
        const gallery = document.getElementById('productsGallery');
        if (!gallery) return;

        gallery.innerHTML = '';
        const products = this.billing.products.slice(0, 8); // Show first 8 products

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-image ${typeof product.image === 'string' && product.image.startsWith('data:') ? '' : 'emoji-image'}">
                    ${typeof product.image === 'string' && product.image.startsWith('data:') 
                        ? `<img src="${product.image}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" alt="${product.name}">`
                        : `<span style="font-size: 40px;">${product.image}</span>`
                    }
                </div>
                <div class="product-card-name">${product.name}</div>
                <div class="product-card-price">₹${product.price}</div>
                <div class="product-card-stock">${product.stock} in stock</div>
                <button class="product-card-btn" data-product-id="${product.id}">Add</button>
            `;

            card.querySelector('.product-card-btn').addEventListener('click', () => {
                this.quickAddProduct(product);
            });

            gallery.appendChild(card);
        });
    }

    toggleGallery() {
        const section = document.querySelector('.products-gallery-section');
        if (section) {
            section.classList.toggle('show');
        }
    }

    quickAddProduct(product) {
        const quantity = prompt(`Enter quantity for ${product.name}:`, '1');
        if (quantity !== null && quantity !== '') {
            const qty = parseInt(quantity) || 1;
            if (qty > 0) {
                this.billing.addItemToBill(product.name, qty, product.price);
                this.updateBillDisplay();
                alert(`${product.name} added to bill!`);
            } else {
                alert('Please enter a valid quantity');
            }
        }
    }

    displayQuickAddGallery() {
        const gallery = document.getElementById('quickAddGallery');
        if (!gallery) return;

        gallery.innerHTML = '';

        this.billing.products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-image">
                    ${typeof product.image === 'string' && product.image.startsWith('data:') 
                        ? `<img src="${product.image}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" alt="${product.name}">`
                        : `<span style="font-size: 50px;">${product.image}</span>`
                    }
                </div>
                <div class="product-card-name">${product.name}</div>
                <div class="product-card-price">₹${product.price}</div>
                <div class="product-card-stock">${product.stock} in stock</div>
                <button class="product-card-btn" data-product-id="${product.id}">Add Item</button>
            `;

            card.querySelector('.product-card-btn').addEventListener('click', () => {
                this.quickAddProduct(product);
            });

            gallery.appendChild(card);
        });
    }

    // Gallery methods
    displayProductsTable() {
        const tbody = document.getElementById('productsTableBody');
        tbody.innerHTML = '';

        this.billing.products.forEach(product => {
            const row = document.createElement('tr');
            const imagePath = product.image;
            row.innerHTML = `
                <td>${product.name}</td>
                <td>₹${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>
                    ${typeof imagePath === 'string' && imagePath.startsWith('data:') 
                        ? `<img src="${imagePath}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;" alt="product">`
                        : `<span style="font-size: 24px;">${imagePath}</span>`
                    }
                </td>
                <td>
                    <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px;" data-product-id="${product.id}">Upload Image</button>
                    <button class="delete-btn" style="padding: 4px 8px; font-size: 12px; margin-top: 4px;" data-product-id="${product.id}">Delete</button>
                </td>
            `;

            row.querySelector('[data-product-id]').addEventListener('click', (e) => {
                if (e.target.textContent === 'Upload Image') {
                    this.openUploadImageModal(product.id);
                }
            });

            row.querySelector('.delete-btn').addEventListener('click', (e) => {
                if (confirm('Delete this product?')) {
                    this.billing.deleteProduct(product.id);
                    this.loadProducts();
                    this.displayProductGallery();
                }
            });

            tbody.appendChild(row);
        });
    }

    updateInvoiceNumber() {
        if (this.billing.currentBill) {
            document.getElementById('invoiceNumber').value = this.billing.currentBill.invoiceNumber;
        }
    }

    updateBillDateTime() {
        const now = new Date();
        document.getElementById('billDateTime').value = now.toLocaleString('en-IN');
    }

    updateBillDisplay() {
        this.updateBillDateTime();
        this.renderBillItems();
        this.updateBillTotals();
    }

    renderBillItems() {
        const tbody = document.getElementById('itemsTableBody');
        tbody.innerHTML = '';

        if (this.billing.currentBill) {
            this.billing.currentBill.items.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="text" value="${item.productName}" readonly></td>
                    <td><input type="number" value="${item.quantity}" class="qty-input" data-item-id="${item.id}" min="1"></td>
                    <td><input type="number" value="${item.price}" class="price-input" data-item-id="${item.id}" min="0" step="0.01"></td>
                    <td>₹ <span class="item-total">${item.total.toFixed(2)}</span></td>
                    <td><button class="delete-btn" data-item-id="${item.id}">Delete</button></td>
                `;

                // Add event listeners to quantity and price inputs
                row.querySelector('.qty-input').addEventListener('change', (e) => {
                    const price = row.querySelector('.price-input').value;
                    this.billing.updateItemInBill(item.id, e.target.value, price);
                    this.updateBillDisplay();
                });

                row.querySelector('.price-input').addEventListener('change', (e) => {
                    const qty = row.querySelector('.qty-input').value;
                    this.billing.updateItemInBill(item.id, qty, e.target.value);
                    this.updateBillDisplay();
                });

                row.querySelector('.delete-btn').addEventListener('click', () => {
                    this.billing.removeItemFromBill(item.id);
                    this.updateBillDisplay();
                });

                tbody.appendChild(row);
            });
        }
    }

    updateBillTotals() {
        const bill = this.billing.currentBill;
        document.getElementById('subtotal').textContent = `₹ ${bill.subtotal.toFixed(2)}`;
        document.getElementById('gstAmount').textContent = `₹ ${bill.gstAmount.toFixed(2)}`;
        document.getElementById('grandTotal').textContent = `₹ ${bill.grandTotal.toFixed(2)}`;
    }

    // ==================== MODAL MANAGEMENT ==================== //
    openAddItemModal() {
        document.getElementById('addItemModal').classList.add('active');
        document.getElementById('productNameInput').focus();
    }

    closeAddItemModal() {
        document.getElementById('addItemModal').classList.remove('active');
        this.clearAddItemForm();
    }

    clearAddItemForm() {
        document.getElementById('productNameInput').value = '';
        document.getElementById('quantityInput').value = '1';
        document.getElementById('priceInput').value = '';
        document.getElementById('productSuggestions').innerHTML = '';
    }

    showProductSuggestions(query) {
        if (!query.trim()) {
            document.getElementById('productSuggestions').innerHTML = '';
            return;
        }

        const suggestions = this.billing.searchProducts(query);
        const suggestionsList = document.getElementById('productSuggestions');
        suggestionsList.innerHTML = '';

        suggestions.forEach(product => {
            const li = document.createElement('li');
            li.textContent = `${product.name} - ₹${product.price}`;
            li.addEventListener('click', () => {
                document.getElementById('productNameInput').value = product.name;
                document.getElementById('priceInput').value = product.price;
                suggestionsList.innerHTML = '';
            });
            suggestionsList.appendChild(li);
        });
    }

    confirmAddItem() {
        const productName = document.getElementById('productNameInput').value.trim();
        const quantity = document.getElementById('quantityInput').value;
        const price = document.getElementById('priceInput').value;

        if (!productName || !quantity || !price) {
            alert('Please fill in all fields');
            return;
        }

        this.billing.addItemToBill(productName, quantity, price);
        this.updateBillDisplay();
        this.closeAddItemModal();
    }

    // Product Modal
    openAddProductModal() {
        document.getElementById('addProductModal').classList.add('active');
        document.getElementById('productNameInput2').focus();
    }

    closeAddProductModal() {
        document.getElementById('addProductModal').classList.remove('active');
        this.clearAddProductForm();
    }

    clearAddProductForm() {
        document.getElementById('productNameInput2').value = '';
        document.getElementById('productPriceInput').value = '';
        document.getElementById('productStockInput').value = '';
    }

    confirmAddProduct() {
        const name = document.getElementById('productNameInput2').value.trim();
        const price = document.getElementById('productPriceInput').value;
        const stock = document.getElementById('productStockInput').value;

        if (!name || !price) {
            alert('Please fill in product name and price');
            return;
        }

        this.billing.addProduct(name, price, stock);
        this.loadProducts();
        alert('Product added successfully!');
        this.closeAddProductModal();
    }

    // ==================== BILL OPERATIONS ==================== //
    saveBill() {
        const customerName = document.getElementById('customerName').value.trim();
        
        if (!customerName) {
            alert('Please enter customer name');
            return;
        }

        if (this.billing.currentBill.items.length === 0) {
            alert('Please add at least one item');
            return;
        }

        this.billing.currentBill.customerName = customerName;
        this.billing.currentBill.customerPhone = document.getElementById('customerPhone').value;
        this.billing.currentBill.paymentMethod = this.billing.selectedPaymentMethod;

        if (this.billing.saveBill()) {
            const savedBill = this.billing.bills[0]; // The saved bill is at index 0
            const settings = this.billing.getSettings();
            
            // Check if auto-send is enabled and customer has phone number
            if (settings.autoSendWhatsapp && savedBill.customerPhone) {
                // Send to customer's phone number
                this.sendBillToWhatsAppNumber(savedBill, savedBill.customerPhone);
                alert(`Bill saved! 🎉\n\nOpening WhatsApp to send to ${savedBill.customerPhone}...`);
            } else if (savedBill.customerPhone) {
                // Ask user if they want to send via WhatsApp
                if (confirm('Bill saved successfully! 🎉\n\nDo you want to send this bill to customer via WhatsApp?')) {
                    this.sendBillToWhatsApp(savedBill);
                }
            } else {
                alert('Bill saved successfully!');
            }
            
            this.resetBill();
        }
    }

    sendBillToWhatsAppNumber(bill, phoneNumber) {
        // Format phone number
        const formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
        const whatsappPhone = formattedPhone.length === 10 ? '91' + formattedPhone : formattedPhone;

        // Generate message
        const billMessage = this.generateBillMessage(bill, bill.customerName);

        // Open WhatsApp
        const whatsappURL = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(billMessage)}`;
        window.open(whatsappURL, '_blank');
    }

    resetBill() {
        document.getElementById('customerName').value = '';
        document.getElementById('customerPhone').value = '';
        document.getElementById('gstCheckbox').checked = false;
        this.billing.gstEnabled = false;
        document.querySelectorAll('.payment-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-method="cash"]').classList.add('active');
        this.billing.selectedPaymentMethod = 'cash';
        this.billing.createNewBill();
        this.loadBillingView();
    }

    printBill() {
        if (!this.billing.currentBill || this.billing.currentBill.items.length === 0) {
            alert('Please add items to bill before printing');
            return;
        }

        const bill = this.billing.currentBill;
        const printContent = `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .header p { margin: 5px 0; color: #666; }
                    .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
                    .details-group { font-size: 13px; }
                    .details-group label { font-weight: bold; display: block; margin-top: 5px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #f0f0f0; font-weight: bold; }
                    .totals { text-align: right; margin: 20px 0; font-size: 14px; }
                    .totals-row { display: flex; justify-content: flex-end; margin: 5px 0; }
                    .totals-label { width: 150px; text-align: right; }
                    .totals-value { width: 100px; text-align: right; }
                    .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #000; border-bottom: 2px solid #000; }
                    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
                    .print-only { display: none; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>💳 BillPro Invoice</h1>
                    <p>Professional Invoice Management System</p>
                </div>
                
                <div class="details">
                    <div class="details-group">
                        <label>Invoice No:</label> ${bill.invoiceNumber}
                        <label>Date:</label> ${new Date(bill.date).toLocaleString('en-IN')}
                    </div>
                    <div class="details-group">
                        <label>Customer:</label> ${bill.customerName}
                        <label>Phone:</label> ${bill.customerPhone || 'N/A'}
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bill.items.map(item => `
                            <tr>
                                <td>${item.productName}</td>
                                <td>${item.quantity}</td>
                                <td>₹${item.price.toFixed(2)}</td>
                                <td>₹${item.total.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="totals-row">
                        <span class="totals-label">Subtotal:</span>
                        <span class="totals-value">₹${bill.subtotal.toFixed(2)}</span>
                    </div>
                    ${bill.gstIncluded ? `
                        <div class="totals-row">
                            <span class="totals-label">GST (18%):</span>
                            <span class="totals-value">₹${bill.gstAmount.toFixed(2)}</span>
                        </div>
                    ` : ''}
                    <div class="totals-row grand-total">
                        <span class="totals-label">Grand Total:</span>
                        <span class="totals-value">₹${bill.grandTotal.toFixed(2)}</span>
                    </div>
                    <div class="totals-row">
                        <span class="totals-label">Payment Method:</span>
                        <span class="totals-value">${bill.paymentMethod.toUpperCase()}</span>
                    </div>
                </div>

                <div class="footer">
                    <p>Thank you for your business!</p>
                    <p>Invoice generated on ${new Date().toLocaleString('en-IN')}</p>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '', 'width=600,height=700');
        printWindow.document.write(printContent);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }

    sendViaWhatsApp() {
        if (!this.billing.currentBill || this.billing.currentBill.items.length === 0) {
            alert('Please add items to bill before sending');
            return;
        }

        const bill = this.billing.currentBill;
        const customerPhone = document.getElementById('customerPhone').value.trim();
        const customerName = document.getElementById('customerName').value.trim();

        if (!customerPhone) {
            alert('Please enter customer phone number');
            return;
        }

        // Format phone number (remove spaces, +, -, etc.)
        const formattedPhone = customerPhone.replace(/[^0-9]/g, '');
        
        // Add country code if not present (assuming India +91)
        const whatsappPhone = formattedPhone.length === 10 ? '91' + formattedPhone : formattedPhone;

        // Create message
        const billMessage = this.generateBillMessage(bill, customerName);

        // Open WhatsApp with message
        const whatsappURL = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(billMessage)}`;
        window.open(whatsappURL, '_blank');
    }

    generateBillMessage(bill, customerName) {
        const businessName = this.billing.settings.businessName || 'Sabari Cakes and Cafe';
        const businessPhone = this.billing.settings.businessPhone || '8220347161';
        
        let message = `*🧾 ${businessName}*\n\n`;
        message += `Invoice #: ${bill.invoiceNumber}\n`;
        message += `Date: ${new Date(bill.date).toLocaleString('en-IN')}\n`;
        message += `Customer: ${customerName}\n\n`;
        
        message += `*Items:*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        
        bill.items.forEach((item, index) => {
            message += `${index + 1}. ${item.productName}\n`;
            message += `   Qty: ${item.quantity} | Price: ₹${item.price.toFixed(2)}\n`;
            message += `   Total: ₹${item.total.toFixed(2)}\n`;
        });
        
        message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `Subtotal: ₹${bill.subtotal.toFixed(2)}\n`;
        
        if (bill.gstIncluded) {
            message += `GST (18%): ₹${bill.gstAmount.toFixed(2)}\n`;
        }
        
        message += `\n*Grand Total: ₹${bill.grandTotal.toFixed(2)}*\n`;
        message += `Payment: ${bill.paymentMethod.toUpperCase()}\n\n`;
        message += `📞 ${businessPhone}\n`;
        message += `Thank you visit again! 🙏`;
        
        return message;
    }

    selectPaymentMethod(btn) {
        document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.billing.selectedPaymentMethod = btn.dataset.method;
    }

    // ==================== BILLS HISTORY ==================== //
    loadBillsHistory() {
        const tbody = document.getElementById('billsHistoryBody');
        tbody.innerHTML = '';

        const filteredBills = this.billing.bills;

        if (filteredBills.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#999;">No bills found</td></tr>';
            return;
        }

        filteredBills.forEach(bill => {
            const row = document.createElement('tr');
            const date = new Date(bill.date).toLocaleString('en-IN');
            row.innerHTML = `
                <td>${bill.invoiceNumber}</td>
                <td>${bill.customerName}</td>
                <td>${bill.customerPhone || 'N/A'}</td>
                <td>${date}</td>
                <td>₹${bill.grandTotal.toFixed(2)}</td>
                <td>${bill.paymentMethod.toUpperCase()}</td>
                <td>
                    <button class="btn btn-primary" style="padding: 4px 8px; font-size: 12px; margin-right: 4px;" data-action="view">View</button>
                    <button class="btn btn-info" style="padding: 4px 8px; font-size: 12px; margin-right: 4px; background: #25d366; color: white; border: none; cursor: pointer;" data-action="whatsapp" title="Send via WhatsApp">💬</button>
                    <button class="delete-btn" style="padding: 4px 8px; font-size: 12px;">Delete</button>
                </td>
            `;

            row.querySelector('[data-action="view"]').addEventListener('click', () => {
                this.viewBillDetails(bill);
            });

            row.querySelector('[data-action="whatsapp"]').addEventListener('click', () => {
                this.sendBillToWhatsApp(bill);
            });

            row.querySelector('.delete-btn').addEventListener('click', () => {
                this.billing.deleteBill(bill.invoiceNumber);
            });

            tbody.appendChild(row);
        });
    }

    sendBillToWhatsApp(bill) {
        if (!bill.customerPhone) {
            alert('Customer phone number not available for this bill');
            return;
        }

        // Format phone number
        const formattedPhone = bill.customerPhone.replace(/[^0-9]/g, '');
        const whatsappPhone = formattedPhone.length === 10 ? '91' + formattedPhone : formattedPhone;

        // Generate message
        const billMessage = this.generateBillMessage(bill, bill.customerName);

        // Open WhatsApp
        const whatsappURL = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(billMessage)}`;
        window.open(whatsappURL, '_blank');
    }

    searchBills(query) {
        const tbody = document.getElementById('billsHistoryBody');
        tbody.innerHTML = '';

        const filtered = this.billing.bills.filter(bill =>
            bill.invoiceNumber.toLowerCase().includes(query.toLowerCase()) ||
            bill.customerName.toLowerCase().includes(query.toLowerCase())
        );

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#999;">No bills found</td></tr>';
            return;
        }

        filtered.forEach(bill => {
            const row = document.createElement('tr');
            const date = new Date(bill.date).toLocaleString('en-IN');
            row.innerHTML = `
                <td>${bill.invoiceNumber}</td>
                <td>${bill.customerName}</td>
                <td>${bill.customerPhone || 'N/A'}</td>
                <td>${date}</td>
                <td>₹${bill.grandTotal.toFixed(2)}</td>
                <td>${bill.paymentMethod.toUpperCase()}</td>
                <td>
                    <button class="btn btn-primary" style="padding: 4px 8px; font-size: 12px; margin-right: 4px;" data-action="view">View</button>
                    <button class="btn btn-info" style="padding: 4px 8px; font-size: 12px; margin-right: 4px; background: #25d366; color: white; border: none; cursor: pointer;" data-action="whatsapp" title="Send via WhatsApp">💬</button>
                    <button class="delete-btn" style="padding: 4px 8px; font-size: 12px;">Delete</button>
                </td>
            `;

            row.querySelector('[data-action="view"]').addEventListener('click', () => {
                this.viewBillDetails(bill);
            });

            row.querySelector('[data-action="whatsapp"]').addEventListener('click', () => {
                this.sendBillToWhatsApp(bill);
            });

            row.querySelector('.delete-btn').addEventListener('click', () => {
                this.billing.deleteBill(bill.invoiceNumber);
            });

            tbody.appendChild(row);
        });
    }

    viewBillDetails(bill) {
        const modal = document.getElementById('viewBillModal');
        const content = document.getElementById('billDetailsContent');
        
        const billDate = new Date(bill.date).toLocaleString('en-IN');
        const itemsHTML = bill.items.map(item => `
            <tr>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>₹${item.total.toFixed(2)}</td>
            </tr>
        `).join('');

        content.innerHTML = `
            <div class="bill-details-container">
                <div class="bill-details-header">
                    <h3>📄 Bill Information</h3>
                    <div class="bill-detail-row">
                        <span class="label">Invoice Number:</span>
                        <span class="value">${bill.invoiceNumber}</span>
                    </div>
                    <div class="bill-detail-row">
                        <span class="label">Date & Time:</span>
                        <span class="value">${billDate}</span>
                    </div>
                    <div class="bill-detail-row">
                        <span class="label">Customer Name:</span>
                        <span class="value">${bill.customerName}</span>
                    </div>
                    <div class="bill-detail-row">
                        <span class="label">Phone:</span>
                        <span class="value">${bill.customerPhone || 'N/A'}</span>
                    </div>
                    <div class="bill-detail-row">
                        <span class="label">Payment Method:</span>
                        <span class="value">${bill.paymentMethod.toUpperCase()}</span>
                    </div>
                </div>

                <div class="bill-items-detail">
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHTML}
                        </tbody>
                    </table>
                </div>

                <div class="bill-summary-detail">
                    <div class="bill-summary-row">
                        <span>Subtotal:</span>
                        <span>₹${bill.subtotal.toFixed(2)}</span>
                    </div>
                    ${bill.gstIncluded ? `
                        <div class="bill-summary-row">
                            <span>GST (18%):</span>
                            <span>₹${bill.gstAmount.toFixed(2)}</span>
                        </div>
                    ` : ''}
                    <div class="bill-summary-row grand-total">
                        <span>Grand Total:</span>
                        <span>₹${bill.grandTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;

        this.currentViewBill = bill;
        modal.classList.add('active');
    }

    closeViewBillModal() {
        document.getElementById('viewBillModal').classList.remove('active');
        this.currentViewBill = null;
    }

    sendBillViaWhatsApp() {
        if (!this.currentViewBill) return;

        const bill = this.currentViewBill;
        const phone = bill.customerPhone;

        if (!phone) {
            alert('Customer phone number not available');
            return;
        }

        // Format phone number
        const formattedPhone = phone.replace(/[^0-9]/g, '');
        const whatsappPhone = formattedPhone.length === 10 ? '91' + formattedPhone : formattedPhone;

        // Generate message
        const billMessage = this.generateBillMessage(bill, bill.customerName);

        // Open WhatsApp
        const whatsappURL = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(billMessage)}`;
        window.open(whatsappURL, '_blank');
    }

    printBillDetail() {
        if (!this.currentViewBill) return;

        const bill = this.currentViewBill;
        const printContent = `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .header p { margin: 5px 0; color: #666; }
                    .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
                    .details-group { font-size: 13px; }
                    .details-group label { font-weight: bold; display: block; margin-top: 5px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #f0f0f0; font-weight: bold; }
                    .totals { text-align: right; margin: 20px 0; font-size: 14px; }
                    .totals-row { display: flex; justify-content: flex-end; margin: 5px 0; }
                    .totals-label { width: 150px; text-align: right; }
                    .totals-value { width: 100px; text-align: right; }
                    .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #000; border-bottom: 2px solid #000; }
                    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>💳 BillPro Invoice</h1>
                    <p>Professional Invoice Management System</p>
                </div>
                
                <div class="details">
                    <div class="details-group">
                        <label>Invoice No:</label> ${bill.invoiceNumber}
                        <label>Date:</label> ${new Date(bill.date).toLocaleString('en-IN')}
                    </div>
                    <div class="details-group">
                        <label>Customer:</label> ${bill.customerName}
                        <label>Phone:</label> ${bill.customerPhone || 'N/A'}
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bill.items.map(item => `
                            <tr>
                                <td>${item.productName}</td>
                                <td>${item.quantity}</td>
                                <td>₹${item.price.toFixed(2)}</td>
                                <td>₹${item.total.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="totals-row">
                        <span class="totals-label">Subtotal:</span>
                        <span class="totals-value">₹${bill.subtotal.toFixed(2)}</span>
                    </div>
                    ${bill.gstIncluded ? `
                        <div class="totals-row">
                            <span class="totals-label">GST (18%):</span>
                            <span class="totals-value">₹${bill.gstAmount.toFixed(2)}</span>
                        </div>
                    ` : ''}
                    <div class="totals-row grand-total">
                        <span class="totals-label">Grand Total:</span>
                        <span class="totals-value">₹${bill.grandTotal.toFixed(2)}</span>
                    </div>
                    <div class="totals-row">
                        <span class="totals-label">Payment Method:</span>
                        <span class="totals-value">${bill.paymentMethod.toUpperCase()}</span>
                    </div>
                </div>

                <div class="footer">
                    <p>Thank you for your business!</p>
                    <p>Invoice printed on ${new Date().toLocaleString('en-IN')}</p>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '', 'width=600,height=700');
        printWindow.document.write(printContent);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }

    // ==================== PRODUCTS ==================== //
    loadProducts() {
        this.displayProductsTable();
    }

    openUploadImageModal(productId) {
        this.currentProductId = productId;
        document.getElementById('uploadImageModal').classList.add('active');
        document.getElementById('imageInput').value = '';
        document.getElementById('imagePreview').innerHTML = '';
    }

    closeUploadImageModal() {
        document.getElementById('uploadImageModal').classList.remove('active');
        this.currentProductId = null;
    }

    previewImage(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('imagePreview');
                preview.innerHTML = `<img src="${e.target.result}" alt="preview">`;
                this.currentImageData = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    confirmUploadImage() {
        if (this.currentImageData && this.currentProductId) {
            this.billing.updateProductImage(this.currentProductId, this.currentImageData);
            this.loadProducts();
            this.displayProductGallery();
            alert('Product image updated!');
            this.closeUploadImageModal();
        } else {
            alert('Please select an image first');
        }
    }

    // ==================== CUSTOMERS ==================== //
    loadCustomers() {
        const tbody = document.getElementById('customersTableBody');
        tbody.innerHTML = '';

        const customers = this.billing.getCustomers();

        if (customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#999;">No customers yet</td></tr>';
            return;
        }

        customers.forEach(customer => {
            const row = document.createElement('tr');
            const lastVisit = customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString('en-IN') : 'N/A';
            row.innerHTML = `
                <td>${customer.name}</td>
                <td>${customer.phone || 'N/A'}</td>
                <td>${customer.totalBills}</td>
                <td>₹${customer.totalSpent.toFixed(2)}</td>
                <td>${lastVisit}</td>
                <td><button class="btn btn-primary" style="padding: 4px 8px; font-size: 12px;">View</button></td>
            `;

            tbody.appendChild(row);
        });
    }

    searchCustomers(query) {
        const tbody = document.getElementById('customersTableBody');
        const customers = this.billing.getCustomers();

        const filtered = customers.filter(c =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.phone?.includes(query)
        );

        tbody.innerHTML = '';

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#999;">No customers found</td></tr>';
            return;
        }

        filtered.forEach(customer => {
            const row = document.createElement('tr');
            const lastVisit = customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString('en-IN') : 'N/A';
            row.innerHTML = `
                <td>${customer.name}</td>
                <td>${customer.phone || 'N/A'}</td>
                <td>${customer.totalBills}</td>
                <td>₹${customer.totalSpent.toFixed(2)}</td>
                <td>${lastVisit}</td>
                <td><button class="btn btn-primary" style="padding: 4px 8px; font-size: 12px;">View</button></td>
            `;

            tbody.appendChild(row);
        });
    }

    // ==================== ANALYTICS ==================== //
    loadAnalytics() {
        // Update stats
        const todayStats = this.billing.getTodayStats();
        const monthlyStats = this.billing.getMonthlyStats();

        document.getElementById('totalBillsToday').textContent = todayStats.count;
        document.getElementById('totalRevenueToday').textContent = `₹ ${todayStats.revenue.toFixed(2)}`;
        document.getElementById('averageBillToday').textContent = `₹ ${todayStats.average.toFixed(2)}`;
        document.getElementById('totalMonthlyRevenue').textContent = `₹ ${monthlyStats.revenue.toFixed(2)}`;

        // Destroy existing charts
        Object.values(this.billing.charts).forEach(chart => {
            if (chart) chart.destroy();
        });

        this.billing.charts = {};

        // Daily Revenue Chart
        this.createDailyRevenueChart();

        // Payment Method Chart
        this.createPaymentMethodChart();

        // Top Products Chart
        this.createTopProductsChart();

        // Monthly Revenue Chart
        this.createMonthlyRevenueChart();
    }

    createDailyRevenueChart() {
        const data = this.billing.getLast7DaysStats();
        const ctx = document.getElementById('dailyRevenueChart').getContext('2d');

        this.billing.charts.daily = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.date),
                datasets: [{
                    label: 'Revenue (₹)',
                    data: data.map(d => d.revenue),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#6366f1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true, position: 'top' }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    createPaymentMethodChart() {
        const data = this.billing.getPaymentMethodBreakdown();
        const ctx = document.getElementById('paymentMethodChart').getContext('2d');

        this.billing.charts.payment = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Cash', 'UPI', 'Card', 'Credit'],
                datasets: [{
                    data: [data.cash, data.upi, data.card, data.credit],
                    backgroundColor: [
                        '#10b981',
                        '#3b82f6',
                        '#f59e0b',
                        '#ef4444'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    createTopProductsChart() {
        const data = this.billing.getTopSellingProducts();
        const ctx = document.getElementById('topProductsChart').getContext('2d');

        this.billing.charts.products = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(p => p.name),
                datasets: [{
                    label: 'Units Sold',
                    data: data.map(p => p.quantity),
                    backgroundColor: '#8b5cf6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    createMonthlyRevenueChart() {
        const data = this.billing.getMonthlyRevenueTrend();
        const ctx = document.getElementById('monthlyRevenueChart').getContext('2d');

        this.billing.charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.month),
                datasets: [{
                    label: 'Revenue (₹)',
                    data: data.map(d => d.revenue),
                    backgroundColor: [
                        '#6366f1',
                        '#8b5cf6',
                        '#a78bfa',
                        '#c4b5fd',
                        '#ddd6fe',
                        '#ede9fe'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // ==================== SETTINGS ==================== //
    loadSettingsView() {
        // Load WhatsApp settings into form
        const defaultWhatsappNumber = document.getElementById('defaultWhatsappNumber');
        const autoSendWhatsapp = document.getElementById('autoSendWhatsapp');
        
        if (defaultWhatsappNumber) {
            defaultWhatsappNumber.value = this.billing.settings.defaultWhatsappNumber || '';
        }
        if (autoSendWhatsapp) {
            autoSendWhatsapp.checked = this.billing.settings.autoSendWhatsapp || false;
        }
        
        // Load business settings
        const businessName = document.getElementById('businessName');
        const businessPhone = document.getElementById('businessPhone');
        const businessEmail = document.getElementById('businessEmail');
        
        if (businessName) businessName.value = this.billing.settings.businessName || '';
        if (businessPhone) businessPhone.value = this.billing.settings.businessPhone || '';
        if (businessEmail) businessEmail.value = this.billing.settings.businessEmail || '';
        
        // Load invoice settings
        const invoicePrefix = document.getElementById('invoicePrefix');
        const gstRate = document.getElementById('gstRate');
        
        if (invoicePrefix) invoicePrefix.value = this.billing.settings.invoicePrefix || 'INV';
        if (gstRate) gstRate.value = this.billing.settings.gstRate || '18';
    }

    saveSettings() {
        const defaultWhatsappNumber = document.getElementById('defaultWhatsappNumber')?.value.trim() || '';
        const autoSendWhatsapp = document.getElementById('autoSendWhatsapp')?.checked || false;
        
        // Validate phone number format
        if (defaultWhatsappNumber && !/^\d{10,15}$/.test(defaultWhatsappNumber.replace(/\D/g, ''))) {
            alert('Please enter a valid phone number (10-15 digits)');
            return;
        }
        
        this.billing.settings.defaultWhatsappNumber = defaultWhatsappNumber;
        this.billing.settings.autoSendWhatsapp = autoSendWhatsapp;
        
        this.billing.saveData('settings', this.billing.settings);
        alert(`✅ WhatsApp settings saved!\nDefault number: ${defaultWhatsappNumber || 'Not set'}\nAuto-send: ${autoSendWhatsapp ? 'Enabled' : 'Disabled'}`);
    }

    saveBusinessSettings() {
        const businessName = document.getElementById('businessName')?.value.trim() || '';
        const businessPhone = document.getElementById('businessPhone')?.value.trim() || '';
        const businessEmail = document.getElementById('businessEmail')?.value.trim() || '';
        
        if (!businessName) {
            alert('Please enter business name');
            return;
        }
        
        this.billing.settings.businessName = businessName;
        this.billing.settings.businessPhone = businessPhone;
        this.billing.settings.businessEmail = businessEmail;
        
        this.billing.saveData('settings', this.billing.settings);
        alert('✅ Business details saved successfully!');
    }

    saveBillSettings() {
        const invoicePrefix = document.getElementById('invoicePrefix')?.value.trim() || 'INV';
        const gstRate = document.getElementById('gstRate')?.value || '18';
        
        const gstValue = parseFloat(gstRate);
        if (isNaN(gstValue) || gstValue < 0 || gstValue > 100) {
            alert('Please enter a valid GST rate (0-100)');
            return;
        }
        
        this.billing.settings.invoicePrefix = invoicePrefix;
        this.billing.settings.gstRate = gstValue;
        
        this.billing.saveData('settings', this.billing.settings);
        alert('✅ Invoice settings saved successfully!');
    }

    testWhatsApp() {
        const phoneNumber = document.getElementById('defaultWhatsappNumber')?.value.trim();
        
        if (!phoneNumber) {
            alert('Please enter WhatsApp number first');
            return;
        }
        
        // Remove non-digit characters
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        
        if (!/^\d{10,15}$/.test(cleanPhone)) {
            alert('Invalid phone number format. Please use 10-15 digits.');
            return;
        }
        
        // Create a test bill message
        const testMessage = `🧪 *WhatsApp Integration Test*\n\nHello! This is a test message from your billing system.\n\nDefault WhatsApp Number: ${phoneNumber}\n\nIf you can see this message, WhatsApp integration is working! 🎉`;
        
        const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(testMessage)}`;
        window.open(waLink, '_blank');
        alert('Opening WhatsApp in a new window. Send the test message to verify it\'s working!');
    }

    resetSettings() {
        if (!confirm('Are you sure you want to reset all settings to defaults?\n\nDefault WhatsApp Number will be: 9159888991')) {
            return;
        }
        
        this.billing.settings = this.billing.getDefaultSettings();
        this.billing.saveData('settings', this.billing.settings);
        this.loadSettingsView();
        alert('✅ All settings have been reset to defaults!');
    }

    exportSettings() {
        const settings = this.billing.settings;
        const exportData = {
            exportedAt: new Date().toLocaleString('en-IN'),
            whatsappConfig: {
                defaultNumber: settings.defaultWhatsappNumber,
                autoSend: settings.autoSendWhatsapp
            },
            businessDetails: {
                name: settings.businessName,
                phone: settings.businessPhone,
                email: settings.businessEmail
            },
            invoiceSettings: {
                prefix: settings.invoicePrefix,
                gstRate: settings.gstRate
            }
        };
        
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `billing-settings-${new Date().getTime()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        alert('✅ Settings exported successfully!');
    }

    sendBillToWhatsAppNumber(bill, phoneNumber) {
        if (!phoneNumber) return;
        
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const message = this.generateBillMessage(bill, bill.customerName);
        const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(waLink, '_blank');
    }

    // ==================== UTILITIES ==================== //
    updateDateTime() {
        const now = new Date();
        document.getElementById('currentDateTime').textContent = now.toLocaleString('en-IN', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// ==================== INITIALIZATION ==================== //
document.addEventListener('DOMContentLoaded', () => {
    const billing = new BillingSystem();
    const ui = new UIManager(billing);
});
