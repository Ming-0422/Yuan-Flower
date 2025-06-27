// API 基礎 URL
const API_BASE_URL = 'http://localhost:8080/api';

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    emailjs.init({ publicKey: 'jM2R9RmgbvvAfadTq' });
    
    // 檢查登入狀態
    checkAuthStatus();
    
    // 初始化所有功能
    initializeEventListeners();
    initializeAuth();
    setupShoppingCart();
    
    // 圖片載入處理
    document.querySelectorAll('.product-img').forEach(img => {
        if (img.complete) {
            setObjectFit(img);
        } else {
            img.onload = function() {
                setObjectFit(img);
            }
        }
    });
});

// 初始化事件監聽器 (來自第一版)
function initializeEventListeners() {
    // 平滑滾動
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', smoothScroll);
    });

    // 漢堡選單
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // 導航欄滾動效果
    window.addEventListener('scroll', handleNavbarScroll);

    // CTA按鈕
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
        });
    }
}

// 認證相關功能 (來自第二版，更強化)
function initializeAuth() {
    const authModal = document.getElementById('authModal');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const closeBtn = document.querySelector('.close-button');
    const tabButtons = document.querySelectorAll('.tab-button');
    
    // 開啟登入模態框
    loginBtn.addEventListener('click', () => {
        authModal.style.display = 'block';
        showTab('login');
    });
    
    // 開啟註冊模態框
    registerBtn.addEventListener('click', () => {
        authModal.style.display = 'block';
        showTab('register');
    });
    
    // 關閉模態框
    closeBtn.addEventListener('click', () => {
        authModal.style.display = 'none';
    });
    
    // 點擊外部關閉
    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.style.display = 'none';
        }
    });
    
    // 標籤切換
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');
            showTab(tab);
        });
    });
    
    // 登入表單提交
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    
    // 註冊表單提交
    document.getElementById('registerFormElement').addEventListener('submit', handleRegister);
    
    // 登出
    logoutBtn.addEventListener('click', handleLogout);
}

function showTab(tabName) {
    // 更新標籤按鈕
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });
    
    // 更新內容
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabName + 'Form');
    });
}

async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(loginData),
            credentials: 'include'
        });
        
        if (response.ok) {
            localStorage.setItem('username', loginData.username);
            document.getElementById('authModal').style.display = 'none';
            checkAuthStatus();
            showMessage('loginMessage', '登入成功！', 'success');
            
            // 清空表單
            e.target.reset();
        } else {
            showMessage('loginMessage', '登入失敗，請檢查用戶名和密碼', 'error');
        }
    } catch (error) {
        showMessage('loginMessage', '發生錯誤，請稍後再試', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const registerData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        address: formData.get('address') || '',
        phone: formData.get('phone') || ''
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/members/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData)
        });
        
        if (response.ok) {
            showMessage('registerMessage', '註冊成功！請登入', 'success');
            setTimeout(() => {
                showTab('login');
            }, 1500);
            
            // 清空表單
            e.target.reset();
        } else {
            const error = await response.text();
            showMessage('registerMessage', error || '註冊失敗', 'error');
        }
    } catch (error) {
        showMessage('registerMessage', '發生錯誤，請稍後再試', 'error');
    }
}

async function handleLogout() {
    try {
        await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        localStorage.removeItem('username');
        checkAuthStatus();
    } catch (error) {
        console.error('登出失敗:', error);
    }
}

function checkAuthStatus() {
    const username = localStorage.getItem('username');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const welcomeUser = document.getElementById('welcomeUser');
    
    if (username) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        welcomeUser.style.display = 'inline';
        welcomeUser.textContent = `歡迎, ${username}!`;
    } else {
        loginBtn.style.display = 'block';
        registerBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        welcomeUser.style.display = 'none';
    }
}

function showMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    messageElement.textContent = message;
    messageElement.className = `auth-message ${type}`;
    messageElement.style.display = 'block';
    
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 3000);
}

// 平滑滾動 (來自第一版)
function smoothScroll(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    
    if (targetSection) {
        targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 導航欄滾動效果 (來自第一版)
function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
}

// 商品圖片自動判斷比例切換 object-fit (來自第一版)
function setObjectFit(img) {
    const ratio = img.naturalWidth / img.naturalHeight;
    // 比例超過 1.2（橫向或直向明顯長方形）就 cover，否則 contain
    if (ratio > 1.2 || ratio < 0.83) {
        img.style.objectFit = 'cover';
    } else {
        img.style.objectFit = 'contain';
    }
}

// 購物車邏輯 (來自第一版，整合第二版的後端API)
function setupShoppingCart() {
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    const openCartBtn = document.querySelector('.nav-cart');
    const closeCartBtn = document.querySelector('.close-cart-btn');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartCount = document.querySelector('.cart-count');
    const cartTotalPrice = document.getElementById('cart-total-price');
    
    const checkoutBtn = document.querySelector('.checkout-btn');
    const checkoutPage = document.getElementById('checkout-page');
    const closeCheckoutBtn = document.querySelector('.close-checkout-btn');
    const customerForm = document.getElementById('customer-info-form');
    const shippingForm = document.getElementById('shipping-info-form');

    // Checkout step buttons
    const gotoStep2Btn = document.getElementById('goto-step-2-btn');
    const gotoStep3Btn = document.getElementById('goto-step-3-btn');
    const gotoStep4Btn = document.getElementById('goto-step-4-btn');
    const backToStep1Btn = document.getElementById('back-to-step-1-btn');
    const backToStep2Btn = document.getElementById('back-to-step-2-btn');
    const backToStep3Btn = document.getElementById('back-to-step-3-btn');
    const confirmPurchaseBtn = document.getElementById('confirm-purchase-btn');
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    
    // Shipping options
    const shippingMethodRadios = document.querySelectorAll('input[name="shipping-method"]');
    const homeDeliveryFields = document.getElementById('home-delivery-fields');
    const storePickupFields = document.getElementById('store-pickup-fields');
    const addressInput = document.getElementById('customer-address');
    const storeInput = document.getElementById('pickup-store-info');
    const confirmationSummary = document.getElementById('confirmation-summary');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // 開啟購物車
    function openCart() {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    }

    // 關閉購物車
    function closeCart() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    }

    // 更新購物車畫面
    function updateCartUI() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let totalItems = 0;

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span class="cart-item-price">${item.priceText}</span>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                    </div>
                </div>
                <button class="remove-item-btn" data-id="${item.id}">&times;</button>
            `;
            cartItemsContainer.appendChild(itemElement);
            total += item.price * item.quantity;
            totalItems += item.quantity;
        });

        cartTotalPrice.textContent = `NT$ ${total.toLocaleString()}`;
        cartCount.textContent = totalItems;
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // 加入購物車
    function addToCart(e) {
        const productCard = e.target.closest('.product-card');
        const id = productCard.dataset.id;
        const name = productCard.dataset.name;
        const price = parseInt(productCard.dataset.price);
        const image = productCard.querySelector('img').src;
        const priceText = `NT$ ${price}`;

        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id, name, price, priceText, image, quantity: 1 });
        }
        updateCartUI();
        openCart();
    }
    
    // 變更數量或移除
    function handleCartActions(e) {
        const target = e.target;
        if (!target.closest('.cart-item')) return;
        const id = target.closest('.cart-item').querySelector('.remove-item-btn').dataset.id;

        if (target.classList.contains('quantity-btn')) {
            const action = target.dataset.action;
            const itemToUpdate = cart.find(item => item.id === id);
            if (action === 'increase') {
                itemToUpdate.quantity++;
            } else if (action === 'decrease') {
                itemToUpdate.quantity--;
                if (itemToUpdate.quantity <= 0) {
                    cart = cart.filter(item => item.id !== id);
                }
            }
        }

        if (target.classList.contains('remove-item-btn')) {
            cart = cart.filter(item => item.id !== id);
        }

        updateCartUI();
    }
    
    // 結帳流程
    function handleCheckout() {
        if (cart.length === 0) {
            alert('您的購物車是空的！');
            return;
        }
        switchCheckoutStep(1);
        updateCheckoutSummary();
        checkoutPage.classList.add('active');
        closeCart();
    }

    function closeCheckout() {
        checkoutPage.classList.remove('active');
    }

    function renderOrderSummary(container) {
        if (!container) return;
        container.innerHTML = '';

        let subtotal = 0;
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4>${item.name} (x${item.quantity})</h4>
                    <span class="cart-item-price">${item.priceText}</span>
                </div>
                <div class="cart-item-total">NT$ ${(item.price * item.quantity).toLocaleString()}</div>
            `;
            container.appendChild(itemElement);
            subtotal += item.price * item.quantity;
        });

        const shippingFee = subtotal >= 600 ? 0 : 60;
        const total = subtotal + shippingFee;

        const summaryTotals = document.createElement('div');
        summaryTotals.classList.add('summary-totals');
        summaryTotals.style.cssText = "margin-top: 1rem; border-top: 1px solid #eee; padding-top: 1rem;";
        summaryTotals.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>小計</span>
                <span>NT$ ${subtotal.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>運費</span>
                <span>NT$ ${shippingFee.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1rem;">
                <span>總計</span>
                <span>NT$ ${total.toLocaleString()}</span>
            </div>
        `;
        container.appendChild(summaryTotals);
    }

    function updateCheckoutSummary() {
        const summaryContainer = document.getElementById('checkout-order-summary');
        renderOrderSummary(summaryContainer);
    }

    function switchCheckoutStep(stepNumber) {
        document.querySelectorAll('.checkout-step-content').forEach(el => el.classList.remove('active'));
        document.querySelector(`#checkout-step-${stepNumber}`).classList.add('active');
        document.querySelectorAll('.checkout-steps .step').forEach(el => el.classList.remove('active'));
        document.querySelector(`.step[data-step="${stepNumber}"]`).classList.add('active');
    }

    // 完成購買 (整合第二版的後端API調用)
    async function finishPurchase() {
        const name = document.getElementById('customer-name').value;
        const phone = document.getElementById('customer-phone').value;
        const email = document.getElementById('customer-email').value;
        const shippingMethod = document.querySelector('input[name="shipping-method"]:checked').value;
        
        let recipientName = name;
        let recipientPhone = phone;
        let shippingAddress = '';
        
        if (shippingMethod === 'homedelivery') {
            shippingAddress = addressInput.value;
        } else {
            const storeName = shippingMethod === '711' ? '7-11 門市' : '全家門市';
            shippingAddress = `${storeName}: ${storeInput.value}`;
        }

        // 計算金額
        let subtotal = 0;
        const cartItems = cart.map(item => {
            subtotal += item.price * item.quantity;
            return {
                productId: parseInt(item.id.replace('f', '')), // 將 f1 轉為 1
                productName: item.name,
                quantity: item.quantity,
                price: item.price
            };
        });
        
        const shippingFee = subtotal >= 600 ? 0 : 60;
        const total = subtotal + shippingFee;

        // 準備訂單資料 (符合第二版的 OrderRequest 格式)
        const orderData = {
            customerName: name,
            customerPhone: phone,
            customerEmail: email,
            recipientName: recipientName,
            recipientPhone: recipientPhone,
            shippingAddress: shippingAddress,
            shippingMethod: shippingMethod === 'homedelivery' ? '指定地址' : 
                           shippingMethod === '711' ? '7-11 門市取貨' : '全家門市取貨',
            shippingFee: shippingFee,
            deliveryDate: document.getElementById('delivery-date').value || null,
            deliveryTime: document.getElementById('delivery-time').value || null,
            orderNotes: document.getElementById('order-notes').value || null,
            cartItems: cartItems
        };

        try {
            // 發送訂單到後端 API
            const response = await fetch(`${API_BASE_URL}/orders/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
                credentials: 'include'
            });
            
            if (response.ok) {
                const order = await response.json();
                console.log('訂單建立成功:', order);
            } else {
                console.error('訂單API失敗，但繼續使用 EmailJS');
            }
        } catch (error) {
            console.error('訂單API錯誤:', error);
        }

        // 發送 EmailJS 通知 (保留作為備份)
        try {
            const orderItemsHTML = cartItems.map(item => 
                `<li>${item.productName} x ${item.quantity} - NT$ ${(item.price * item.quantity).toLocaleString()}</li>`
            ).join('');
            
            const orderSummaryHTML = `
                <ul>${orderItemsHTML}</ul>
                <p>小計: NT$ ${subtotal.toLocaleString()}</p>
                <p>運費: NT$ ${shippingFee > 0 ? shippingFee.toLocaleString() : '免運'}</p>
                <p><strong>總計: NT$ ${total.toLocaleString()}</strong></p>
            `;
            
            const fullDetailsHTML = `
                <h3>顧客資訊</h3>
                <p>收件人: ${name}</p>
                <p>電話: ${phone}</p>
                <p>Email: ${email}</p>
                <h3>寄送資訊</h3>
                <p>${shippingAddress}</p>
                <h3>訂單明細</h3>
                ${orderSummaryHTML}
            `;

            const templateParams = {
                customer_name: name,
                customer_phone: phone,
                shipping_info: shippingAddress,
                order_summary: orderSummaryHTML,
                total_price: `NT$ ${total.toLocaleString()}`,
                full_details_html: fullDetailsHTML,
            };

            await emailjs.send('service_ysd0u6p', 'template_7igw7tb', templateParams);
            console.log('EmailJS 發送成功');
        } catch (err) {
            console.error('EmailJS 發送失敗:', err);
        }

        // 直接切換到步驟五，並清空購物車
        switchCheckoutStep(5);
        cart = []; 
        updateCartUI();
    }

    function renderConfirmationSummary() {
        const name = document.getElementById('customer-name').value;
        const phone = document.getElementById('customer-phone').value;
        const email = document.getElementById('customer-email').value;
        const shippingMethod = document.querySelector('input[name="shipping-method"]:checked').value;
        const confirmationSummaryContainer = document.getElementById('confirmation-summary');
        
        let shippingInfo = '';
        if (shippingMethod === 'homedelivery') {
            shippingInfo = `
                <tr>
                    <td>寄送方式</td>
                    <td>指定地址</td>
                </tr>
                <tr>
                    <td>地址</td>
                    <td>${addressInput.value}</td>
                </tr>
            `;
        } else {
            const storeName = shippingMethod === '711' ? '7-11 門市' : '全家門市';
             shippingInfo = `
                <tr>
                    <td>寄送方式</td>
                    <td>${storeName}</td>
                </tr>
                <tr>
                    <td>門市資訊</td>
                    <td>${storeInput.value}</td>
                </tr>
            `;
        }

        const deliveryDate = document.getElementById('delivery-date').value;
        const deliveryTime = document.getElementById('delivery-time').value;
        const orderNotes = document.getElementById('order-notes').value;

        confirmationSummaryContainer.innerHTML = `
            <h4 style="text-align: left; margin-bottom: 1rem; font-weight: bold;">顧客與寄送資訊</h4>
            <table class="summary-table">
                <tr>
                    <td>收件人</td>
                    <td>${name}</td>
                </tr>
                <tr>
                    <td>電話</td>
                    <td>${phone}</td>
                </tr>
                <tr>
                    <td>Email</td>
                    <td>${email}</td>
                </tr>
                ${shippingInfo}
                ${deliveryDate ? `<tr><td>希望到貨日</td><td>${deliveryDate}</td></tr>` : ''}
                ${deliveryTime ? `<tr><td>希望時段</td><td>${deliveryTime}</td></tr>` : ''}
                ${orderNotes ? `<tr><td>備註</td><td>${orderNotes}</td></tr>` : ''}
            </table>
        `;

        const orderSummaryContainer = document.getElementById('confirmation-order-summary');
        renderOrderSummary(orderSummaryContainer);
    }

    function handleShippingMethodChange() {
        const selectedMethod = document.querySelector('input[name="shipping-method"]:checked').value;
        if (selectedMethod === 'homedelivery') {
            homeDeliveryFields.style.display = 'block';
            storePickupFields.style.display = 'none';
            addressInput.required = true;
            storeInput.required = false;
        } else {
            homeDeliveryFields.style.display = 'none';
            storePickupFields.style.display = 'block';
            addressInput.required = false;
            storeInput.required = true;
        }
    }

    // 事件監聽
    openCartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    addToCartButtons.forEach(btn => btn.addEventListener('click', addToCart));
    cartItemsContainer.addEventListener('click', handleCartActions);
    
    // Checkout Listeners
    checkoutBtn.addEventListener('click', handleCheckout);
    closeCheckoutBtn.addEventListener('click', closeCheckout);

    gotoStep2Btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (customerForm.checkValidity()) {
            switchCheckoutStep(2);
        } else {
            customerForm.reportValidity();
        }
    });

    gotoStep3Btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (shippingForm.checkValidity()) {
            renderConfirmationSummary();
            switchCheckoutStep(3);
        } else {
            shippingForm.reportValidity();
        }
    });

    gotoStep4Btn.addEventListener('click', (e) => {
        e.preventDefault();
        switchCheckoutStep(4);
    });

    backToStep1Btn.addEventListener('click', () => switchCheckoutStep(1));
    backToStep2Btn.addEventListener('click', () => switchCheckoutStep(2));
    backToStep3Btn.addEventListener('click', () => switchCheckoutStep(3));
    confirmPurchaseBtn.addEventListener('click', finishPurchase);
    continueShoppingBtn.addEventListener('click', closeCheckout);
    shippingMethodRadios.forEach(radio => radio.addEventListener('change', handleShippingMethodChange));

    // 初始化
    updateCartUI();
    handleShippingMethodChange();
}

// 滾動動畫 (來自第一版)
function animateOnScroll() {
    const elements = document.querySelectorAll('.product-card, .about-text, .contact-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// 初始化滾動動畫
document.addEventListener('DOMContentLoaded', animateOnScroll);

// 添加CSS樣式到頁面 (來自第一版 + 第二版認證功能樣式)
const style = document.createElement('style');
style.textContent = `
    .nav-menu.active {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        padding: 1rem;
    }
    
    .hamburger.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }
    
    .hamburger.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    /* 認證 Modal 樣式 (來自第二版) */
    .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
    }
    
    .modal-content {
        background-color: #fefefe;
        margin: 5% auto;
        padding: 20px;
        border: none;
        width: 90%;
        max-width: 400px;
        border-radius: 10px;
        position: relative;
    }
    
    .close-button {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
        position: absolute;
        right: 15px;
        top: 10px;
    }
    
    .close-button:hover {
        color: black;
    }
    
    .auth-tabs {
        display: flex;
        margin-bottom: 20px;
        border-bottom: 1px solid #eee;
    }
    
    .tab-button {
        flex: 1;
        padding: 10px;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 16px;
        border-bottom: 2px solid transparent;
    }
    
    .tab-button.active {
        border-bottom-color: #ff6b9d;
        color: #ff6b9d;
        font-weight: bold;
    }
    
    .tab-content {
        display: none;
    }
    
    .tab-content.active {
        display: block;
    }
    
    .tab-content .form-group {
        margin-bottom: 15px;
    }
    
    .tab-content .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
        color: #333;
    }
    
    .tab-content .form-group input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 14px;
    }
    
    .auth-submit-btn {
        width: 100%;
        padding: 12px;
        background: linear-gradient(45deg, #ff6b9d, #ff8fab);
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .auth-submit-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(255, 107, 157, 0.3);
    }
    
    .nav-button {
        background: none;
        border: 1px solid #ff6b9d;
        color: #ff6b9d;
        padding: 8px 16px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
    }
    
    .nav-button:hover {
        background: #ff6b9d;
        color: white;
    }
    
    .auth-message {
        margin-top: 1rem;
        padding: 0.5rem;
        border-radius: 5px;
        text-align: center;
        display: none;
    }
    
    .auth-message.success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    
    .auth-message.error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    
    input.error {
        border-color: #e74c3c !important;
    }
    
    .summary-section {
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: #f9f9f9;
        border-radius: 8px;
    }
    
    .summary-section h4 {
        margin-bottom: 0.5rem;
        color: #333;
    }
    
    .order-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #eee;
    }
    
    .order-total {
        display: flex;
        justify-content: space-between;
        padding: 1rem 0 0;
        font-size: 1.2rem;
        border-top: 2px solid #333;
        margin-top: 0.5rem;
    }
`;

document.head.appendChild(style);