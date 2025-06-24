// API 基礎 URL
const API_BASE_URL = 'http://localhost:8080/api';

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    emailjs.init({ publicKey: 'jM2R9RmgbvvAfadTq' });
    
    // 檢查登入狀態
    checkAuthStatus();
    
    // 初始化所有功能
    initializeAuth();
    initializeCart();
    initializeCheckout();
    initializeNavigation();
    initializeContactForm();
});

// 認證相關功能
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
        address: formData.get('address'),
        phone: formData.get('phone')
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

// 購物車功能
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function initializeCart() {
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.getElementById('close-cart-modal-btn');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // 綁定加入購物車按鈕
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', addToCart);
    });
    
    // 開啟購物車
    cartIcon.addEventListener('click', () => {
        cartModal.style.display = 'block';
        renderCart();
    });
    
    // 關閉購物車
    closeCartBtn.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });
    
    // 清空購物車
    clearCartBtn.addEventListener('click', () => {
        if (confirm('確定要清空購物車嗎？')) {
            cart = [];
            updateCart();
        }
    });
    
    // 結帳按鈕
    checkoutBtn.addEventListener('click', openCheckout);
    
    // 初始化購物車顯示
    updateCartCount();
}

function addToCart(e) {
    const productElement = e.target.closest('.product-item');
    const product = {
        id: parseInt(productElement.dataset.id),
        name: productElement.dataset.name,
        price: parseInt(productElement.dataset.price)
    };
    
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCart();
    
    // 顯示添加成功提示
    const originalText = e.target.textContent;
    e.target.textContent = '已加入購物車！';
    e.target.disabled = true;
    
    setTimeout(() => {
        e.target.textContent = originalText;
        e.target.disabled = false;
    }, 1000);
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total-price');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>購物車是空的。</p>';
        cartTotal.textContent = 'NT$ 0';
        return;
    }
    
    let total = 0;
    cartItems.innerHTML = cart.map(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">NT$ ${item.price}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-item-btn" onclick="removeFromCart(${item.id})">&times;</button>
            </div>
        `;
    }).join('');
    
    cartTotal.textContent = `NT$ ${total.toLocaleString()}`;
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
            renderCart();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    renderCart();
}

function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// 結帳功能
function initializeCheckout() {
    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckoutBtn = document.getElementById('close-checkout-modal-btn');
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    
    // 關閉結帳視窗
    closeCheckoutBtn.addEventListener('click', () => {
        checkoutModal.style.display = 'none';
    });
    
    continueShoppingBtn.addEventListener('click', () => {
        checkoutModal.style.display = 'none';
    });
    
    // 步驟導航
    document.getElementById('goto-step-2-btn').addEventListener('click', validateAndProceed(1, 2));
    document.getElementById('goto-step-3-btn').addEventListener('click', validateAndProceed(2, 3));
    document.getElementById('goto-step-4-btn').addEventListener('click', () => goToStep(4));
    document.getElementById('back-to-step-1-btn').addEventListener('click', () => goToStep(1));
    document.getElementById('back-to-step-2-btn').addEventListener('click', () => goToStep(2));
    document.getElementById('back-to-step-3-btn').addEventListener('click', () => goToStep(3));
    document.getElementById('confirm-purchase-btn').addEventListener('click', confirmPurchase);
}

function openCheckout() {
    if (cart.length === 0) {
        alert('購物車是空的！');
        return;
    }
    
    document.getElementById('cart-modal').style.display = 'none';
    document.getElementById('checkout-modal').style.display = 'block';
    goToStep(1);
    updateOrderSummary();
}

function goToStep(step) {
    // 更新步驟指示器
    document.querySelectorAll('.step-indicator').forEach(indicator => {
        const indicatorStep = parseInt(indicator.dataset.step);
        indicator.classList.toggle('active', indicatorStep === step);
    });
    
    // 顯示對應步驟內容
    document.querySelectorAll('.checkout-step-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`checkout-step-${step}`).classList.add('active');
    
    // 步驟 3 時更新確認摘要
    if (step === 3) {
        updateConfirmationSummary();
    }
}

function validateAndProceed(currentStep, nextStep) {
    return function(e) {
        e.preventDefault();
        
        let isValid = true;
        const requiredFields = document.querySelectorAll(`#checkout-step-${currentStep} input[required], #checkout-step-${currentStep} select[required]`);
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });
        
        if (isValid) {
            goToStep(nextStep);
        } else {
            alert('請填寫所有必填欄位');
        }
    };
}

function updateOrderSummary() {
    // 這個功能在步驟 3 中顯示訂單摘要
    updateConfirmationSummary();
}

function updateConfirmationSummary() {
    const summaryDiv = document.getElementById('confirmation-summary');
    
    // 顧客資料
    const customerName = document.getElementById('customer-name').value;
    const customerPhone = document.getElementById('customer-phone').value;
    const customerEmail = document.getElementById('customer-email').value;
    
    // 收件人資料
    const recipientName = document.getElementById('recipient-name').value;
    const recipientPhone = document.getElementById('recipient-phone').value;
    const shippingAddress = document.getElementById('shipping-address').value;
    const deliveryDate = document.getElementById('delivery-date').value;
    const deliveryTime = document.getElementById('delivery-time').value;
    const shippingMethod = document.querySelector('input[name="shippingMethod"]:checked').value;
    const orderNotes = document.getElementById('order-notes').value;
    
    // 計算總金額
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = shippingMethod === '自取' ? 0 : 80;
    const total = subtotal + shippingFee;
    
    summaryDiv.innerHTML = `
        <div class="summary-section">
            <h4>顧客資料</h4>
            <p>姓名：${customerName}</p>
            <p>電話：${customerPhone}</p>
            <p>Email：${customerEmail}</p>
        </div>
        
        <div class="summary-section">
            <h4>收件資訊</h4>
            <p>收件人：${recipientName}</p>
            <p>電話：${recipientPhone}</p>
            <p>地址：${shippingAddress}</p>
            <p>運送方式：${shippingMethod}</p>
            ${deliveryDate ? `<p>希望到貨日：${deliveryDate}</p>` : ''}
            ${deliveryTime ? `<p>希望時段：${deliveryTime}</p>` : ''}
            ${orderNotes ? `<p>備註：${orderNotes}</p>` : ''}
        </div>
        
        <div class="summary-section">
            <h4>訂單明細</h4>
            ${cart.map(item => `
                <div class="order-item">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>NT$ ${(item.price * item.quantity).toLocaleString()}</span>
                </div>
            `).join('')}
            <div class="order-item">
                <span>運費</span>
                <span>NT$ ${shippingFee}</span>
            </div>
            <div class="order-total">
                <strong>總計</strong>
                <strong>NT$ ${total.toLocaleString()}</strong>
            </div>
        </div>
    `;
}

async function confirmPurchase() {
    // 收集訂單資料
    const orderData = {
        customerName: document.getElementById('customer-name').value,
        customerPhone: document.getElementById('customer-phone').value,
        customerEmail: document.getElementById('customer-email').value,
        recipientName: document.getElementById('recipient-name').value,
        recipientPhone: document.getElementById('recipient-phone').value,
        shippingAddress: document.getElementById('shipping-address').value,
        shippingMethod: document.querySelector('input[name="shippingMethod"]:checked').value,
        deliveryDate: document.getElementById('delivery-date').value || null,
        deliveryTime: document.getElementById('delivery-time').value || null,
        orderNotes: document.getElementById('order-notes').value || null,
        cartItems: cart.map(item => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            price: item.price
        }))
    };
    
    // 計算運費
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    orderData.shippingFee = orderData.shippingMethod === '自取' ? 0 : 80;
    
    try {
        // 發送訂單到後端
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
            
            // 清空購物車
            cart = [];
            updateCart();
            
            // 顯示成功訊息
            goToStep(5);
            
            // 也發送 EmailJS 通知作為備份
            try {
                await sendEmailNotification(orderData);
            } catch (emailError) {
                console.error('Email 發送失敗:', emailError);
            }
        } else {
            alert('訂單提交失敗，請稍後再試');
        }
    } catch (error) {
        console.error('訂單提交錯誤:', error);
        alert('網路錯誤，請檢查連線後再試');
    }
}

async function sendEmailNotification(orderData) {
    const subtotal = orderData.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + orderData.shippingFee;
    
    const orderItemsHTML = orderData.cartItems.map(item => 
        `<li>${item.productName} x ${item.quantity} - NT$ ${(item.price * item.quantity).toLocaleString()}</li>`
    ).join('');
    
    const templateParams = {
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        customer_email: orderData.customerEmail,
        shipping_info: `${orderData.recipientName} / ${orderData.recipientPhone} / ${orderData.shippingAddress}`,
        order_summary: `
            <ul>${orderItemsHTML}</ul>
            <p>運費: NT$ ${orderData.shippingFee}</p>
            <p><strong>總計: NT$ ${total.toLocaleString()}</strong></p>
        `,
        total_price: `NT$ ${total.toLocaleString()}`,
        full_details_html: `
            <h3>訂單明細</h3>
            ${orderItemsHTML}
            <p>運送方式: ${orderData.shippingMethod}</p>
            ${orderData.deliveryDate ? `<p>希望到貨日: ${orderData.deliveryDate}</p>` : ''}
            ${orderData.orderNotes ? `<p>備註: ${orderData.orderNotes}</p>` : ''}
        `
    };
    
    return emailjs.send('service_ysd0u6p', 'template_7igw7tb', templateParams);
}

// 導航功能
function initializeNavigation() {
    // 平滑滾動
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // CTA 按鈕
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            document.getElementById('products').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
}

// 聯絡表單
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formStatus = document.getElementById('form-status');
            formStatus.textContent = '發送中...';
            formStatus.style.color = '#666';
            
            try {
                await emailjs.sendForm('service_ysd0u6p', 'template_contact', this);
                formStatus.textContent = '訊息已成功發送！';
                formStatus.style.color = '#27ae60';
                this.reset();
            } catch (error) {
                formStatus.textContent = '發送失敗，請稍後再試。';
                formStatus.style.color = '#e74c3c';
            }
        });
    }
}

// CSS 樣式
const style = document.createElement('style');
style.textContent = `
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