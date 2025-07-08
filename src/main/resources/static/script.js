// API 基礎 URL
const API_BASE_URL = 'https://yuan-flower.onrender.com/api';

// 全域購物車變數
let cart = [];

// 初始化
document.addEventListener('DOMContentLoaded', function () {
    // 初始化 EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.init({ publicKey: 'jM2R9RmgbvvAfadTq' });
    }

    // 載入購物車數據
    cart = JSON.parse(localStorage.getItem('cart')) || [];

    // 檢查登入狀態
    checkAuthStatus();

    // 初始化所有功能
    initializeEventListeners();
    initializeAuth();
    initializeRegistrationValidation();
    setupShoppingCart();
    setupCheckout();

    // 圖片載入處理
    document.querySelectorAll('.product-img').forEach(img => {
        if (img.complete) {
            setObjectFit(img);
        } else {
            img.onload = function () {
                setObjectFit(img);
            }
        }
    });

    // 初始更新購物車UI
    updateCartUI();
});

// 初始化事件監聽器
function initializeEventListeners() {
    // 平滑滾動
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', smoothScroll);
    });

    // 漢堡選單
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // 點擊選單連結後關閉選單
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            });
        });

        // 點擊頁面其他地方關閉選單
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
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

// 修復認證功能
function initializeAuth() {
    const authModal = document.getElementById('authModal');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const closeBtn = document.querySelector('.close-button');
    const tabButtons = document.querySelectorAll('.tab-button');

    console.log('認證元素檢查:');
    console.log('authModal:', authModal);
    console.log('loginBtn:', loginBtn);
    console.log('registerBtn:', registerBtn);
    console.log('closeBtn:', closeBtn);

    // 開啟登入模態框
    if (loginBtn && authModal) {
        loginBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('登入按鈕被點擊');
            authModal.style.display = 'block';
            authModal.style.zIndex = '3000';
            showTab('login');
        });
    }

    // 開啟註冊模態框
    if (registerBtn && authModal) {
        registerBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('註冊按鈕被點擊');
            authModal.style.display = 'block';
            authModal.style.zIndex = '3000';
            showTab('register');
        });
    }

    // 關閉模態框
    if (closeBtn && authModal) {
        closeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('關閉按鈕被點擊');
            authModal.style.display = 'none';
        });
    }

    // 點擊外部關閉
    if (authModal) {
        authModal.addEventListener('click', function (e) {
            if (e.target === authModal) {
                console.log('點擊外部關閉模態框');
                authModal.style.display = 'none';
            }
        });
    }

    // 標籤切換
    tabButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const tab = button.getAttribute('data-tab');
            console.log('切換標籤:', tab);
            showTab(tab);
        });
    });

    // 登入表單提交
    const loginForm = document.getElementById('loginFormElement');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // 註冊表單提交
    const registerForm = document.getElementById('registerFormElement');
    if (registerForm) {
        registerForm.addEventListener('submit', handleEnhancedRegister);
    }

    // 登出
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('登出按鈕被點擊');
            await handleLogout();
        });
    }
}

// 修復購物車功能
function setupShoppingCart() {
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    const openCartBtn = document.querySelector('.nav-cart');
    const closeCartBtn = document.querySelector('.close-cart-btn');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const cartItemsContainer = document.querySelector('.cart-items');

    console.log('購物車元素檢查:');
    console.log('cartSidebar:', cartSidebar);
    console.log('cartOverlay:', cartOverlay);
    console.log('openCartBtn:', openCartBtn);

    // 購物車圖示點擊事件
    if (openCartBtn && cartSidebar && cartOverlay) {
        // 移除現有事件監聽器
        const newOpenCartBtn = openCartBtn.cloneNode(true);
        openCartBtn.parentNode.replaceChild(newOpenCartBtn, openCartBtn);

        newOpenCartBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('購物車圖示被點擊');

            const isOpen = cartSidebar.classList.contains('active');

            if (isOpen) {
                cartSidebar.classList.remove('active');
                cartOverlay.classList.remove('active');
                console.log('購物車已關閉');
            } else {
                cartSidebar.classList.add('active');
                cartOverlay.classList.add('active');
                console.log('購物車已開啟');
            }
        });
    }

    // 關閉購物車
    if (closeCartBtn && cartSidebar && cartOverlay) {
        closeCartBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            cartSidebar.classList.remove('active');
            cartOverlay.classList.remove('active');
        });
    }

    // 點擊遮罩關閉
    if (cartOverlay && cartSidebar) {
        cartOverlay.addEventListener('click', function (e) {
            if (e.target === cartOverlay) {
                cartSidebar.classList.remove('active');
                cartOverlay.classList.remove('active');
            }
        });
    }

    // 加入購物車按鈕
    addToCartButtons.forEach(btn => {
        btn.addEventListener('click', addToCart);
    });

    // 購物車操作
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', handleCartActions);
    }

    console.log('購物車功能已初始化');
}

// 確保 showTab 函數存在
function showTab(tabName) {
    console.log('顯示標籤:', tabName);

    // 更新標籤按鈕
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    // 更新內容
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabName + 'Form');
    });
}

// 驗證規則
const validationRules = {
    username: {
        pattern: /^[a-zA-Z0-9_]{3,20}$/,
        message: '用戶名只能包含字母、數字和底線，3-20個字符'
    },
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: '請輸入有效的電子郵件地址'
    },
    password: {
        pattern: /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/,
        message: '密碼必須至少6個字符，包含至少1個大寫字母和1個小寫字母'
    },
    phone: {
        pattern: /^09[0-9]{8}$/,
        message: '請輸入有效的台灣手機號碼 (09xxxxxxxx)'
    }
};

// 初始化註冊表單驗證
function initializeRegistrationValidation() {
    const form = document.getElementById('registerFormElement');
    if (!form) return;

    const inputs = {
        username: document.getElementById('register-username'),
        email: document.getElementById('register-email'),
        password: document.getElementById('register-password'),
        phone: document.getElementById('register-phone')
    };

    // 為每個輸入框添加即時驗證
    Object.keys(inputs).forEach(field => {
        const input = inputs[field];
        if (input) {
            input.addEventListener('input', () => validateField(field, input));
            input.addEventListener('blur', () => validateField(field, input));
        }
    });

    // 密碼強度指示器
    if (inputs.password) {
        inputs.password.addEventListener('input', updatePasswordStrength);
    }

    // 表單提交驗證
    form.addEventListener('submit', handleEnhancedRegister);
}

// 驗證單個欄位
function validateField(fieldName, input) {
    const rule = validationRules[fieldName];
    const errorElement = document.getElementById(`${fieldName}-error`);
    const value = input.value.trim();

    let isValid = false;
    let message = rule.message;

    if (!value) {
        message = '此欄位為必填';
    } else if (rule.pattern.test(value)) {
        isValid = true;
    }

    // 特殊驗證：用戶名長度
    if (fieldName === 'username' && value.length > 0) {
        if (value.length < 3) {
            message = '用戶名至少需要3個字符';
            isValid = false;
        } else if (value.length > 20) {
            message = '用戶名不能超過20個字符';
            isValid = false;
        }
    }

    // 更新UI
    input.classList.toggle('valid', isValid);
    input.classList.toggle('invalid', !isValid);

    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.toggle('show', !isValid);
    }

    // 更新提交按鈕狀態
    updateSubmitButtonState();

    return isValid;
}

// 密碼強度指示器
function updatePasswordStrength() {
    const password = document.getElementById('register-password').value;
    const strengthIndicator = document.getElementById('password-strength');

    if (!strengthIndicator) return;

    let strength = 0;
    let strengthClass = '';

    // 檢查密碼強度
    if (password.length >= 6) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength < 3) {
        strengthClass = 'weak';
    } else if (strength < 4) {
        strengthClass = 'medium';
    } else {
        strengthClass = 'strong';
    }

    strengthIndicator.className = `password-strength ${strengthClass}`;
}

// 更新提交按鈕狀態
function updateSubmitButtonState() {
    const submitBtn = document.querySelector('#registerFormElement .auth-submit-btn');
    if (!submitBtn) return;

    const inputs = [
        document.getElementById('register-username'),
        document.getElementById('register-email'),
        document.getElementById('register-password'),
        document.getElementById('register-phone')
    ];

    const allValid = inputs.every(input => {
        if (!input) return false;
        const fieldName = input.name;
        const value = input.value.trim();
        return value && validationRules[fieldName].pattern.test(value);
    });

    submitBtn.disabled = !allValid;
}

// 增強的註冊處理函數
async function handleEnhancedRegister(e) {
    e.preventDefault();

    // 最終驗證所有欄位
    const inputs = {
        username: document.getElementById('register-username'),
        email: document.getElementById('register-email'),
        password: document.getElementById('register-password'),
        phone: document.getElementById('register-phone')
    };

    let allValid = true;
    Object.keys(inputs).forEach(field => {
        if (!validateField(field, inputs[field])) {
            allValid = false;
        }
    });

    if (!allValid) {
        showMessage('registerMessage', '請修正表單中的錯誤', 'error');
        return;
    }

    const formData = new FormData(e.target);
    const registerData = {
        username: formData.get('username').trim(),
        email: formData.get('email').trim(),
        password: formData.get('password'),
        phone: formData.get('phone').trim()
    };

    // 顯示載入狀態
    const submitBtn = e.target.querySelector('.auth-submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '註冊中...';
    submitBtn.disabled = true;

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
                // 自動填入用戶名到登入表單
                const loginUsername = document.getElementById('login-username');
                if (loginUsername) {
                    loginUsername.value = registerData.username;
                }
            }, 1500);
            e.target.reset();
            updatePasswordStrength(); // 清除密碼強度指示器
        } else {
            const error = await response.text();
            showMessage('registerMessage', error || '註冊失敗', 'error');
        }
    } catch (error) {
        console.error('註冊錯誤:', error);
        showMessage('registerMessage', '網路錯誤，請稍後再試', 'error');
    } finally {
        // 恢復按鈕狀態
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password')
    };

    console.log('Attempting login with:', loginData.username);

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: new URLSearchParams(loginData),
            credentials: 'include'
        });

        console.log('Login response status:', response.status);

        if (response.ok) {
            const responseData = await response.json();
            console.log('Login response:', responseData);

            // 登入成功後檢查實際認證狀態
            await checkAuthStatus();

            document.getElementById('authModal').style.display = 'none';
            showMessage('loginMessage', responseData.message || '登入成功！', 'success');
            e.target.reset();
        } else {
            const errorData = await response.json().catch(() => ({ message: '登入失敗，請檢查用戶名和密碼' }));
            showMessage('loginMessage', errorData.message, 'error');
        }
    } catch (error) {
        console.error('登入錯誤:', error);
        showMessage('loginMessage', '網路錯誤，請稍後再試', 'error');
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

// 檢查登入狀態
async function checkAuthStatus() {
    try {
        // 檢查後端的實際登入狀態
        const response = await fetch(`${API_BASE_URL}/auth/status`, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const authData = await response.json();
            if (authData.authenticated) {
                localStorage.setItem('username', authData.username);
                updateUIForLoggedInUser(authData.username);
            } else {
                localStorage.removeItem('username');
                updateUIForLoggedOutUser();
            }
        } else {
            // 後端服務不可用或錯誤，視為未登入
            console.error('無法獲取認證狀態:', response.status);
            localStorage.removeItem('username');
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.error('檢查認證狀態時發生錯誤:', error);
        localStorage.removeItem('username');
        updateUIForLoggedOutUser();
    }
}

function showMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `auth-message ${type}`;
        messageElement.style.display = 'block';

        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
    }
}

// 更新登入後UI
function updateUIForLoggedInUser(username) {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const welcomeUser = document.getElementById('welcomeUser');

    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';
    if (welcomeUser) {
        welcomeUser.style.display = 'inline';
        welcomeUser.textContent = `歡迎, ${username}!`;
    }
}

// 更新登出後UI
function updateUIForLoggedOutUser() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const welcomeUser = document.getElementById('welcomeUser');

    if (loginBtn) loginBtn.style.display = 'block';
    if (registerBtn) registerBtn.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (welcomeUser) welcomeUser.style.display = 'none';
}

// 平滑滾動
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

// 導航欄滾動效果
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

// 商品圖片自動判斷比例切換 object-fit
function setObjectFit(img) {
    const ratio = img.naturalWidth / img.naturalHeight;
    if (ratio > 1.2 || ratio < 0.83) {
        img.style.objectFit = 'cover';
    } else {
        img.style.objectFit = 'contain';
    }
}

// 加入購物車
function addToCart(e) {
    e.preventDefault();
    e.stopPropagation(); // 阻止事件冒泡

    const productCard = e.target.closest('.product-card');
    if (!productCard) return;

    const id = productCard.dataset.id;
    const name = productCard.dataset.name;
    const price = parseInt(productCard.dataset.price);
    const image = productCard.querySelector('img')?.src || '';
    const priceText = `NT$ ${price}`;

    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id, name, price, priceText, image, quantity: 1 });
    }

    updateCartUI();

    // 顯示成功訊息
    const originalText = e.target.textContent;
    e.target.textContent = '已加入購物車！';
    e.target.disabled = true;

    setTimeout(() => {
        e.target.textContent = originalText;
        e.target.disabled = false;
    }, 1000);
}

// 更新購物車UI
function updateCartUI() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartCount = document.querySelector('.cart-count');
    const cartTotalPrice = document.getElementById('cart-total-price');

    if (!cartItemsContainer || !cartCount || !cartTotalPrice) {
        return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;
    let totalItems = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">購物車是空的</p>';
        cartCount.textContent = '0';
        cartTotalPrice.textContent = 'NT$ 0';
        localStorage.setItem('cart', JSON.stringify(cart));
        return;
    }

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

    // 更新 localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
}

// 處理購物車操作
function handleCartActions(e) {
    e.stopPropagation(); // 阻止事件冒泡

    const target = e.target;
    const id = target.dataset.id;

    if (target.classList.contains('quantity-btn')) {
        const action = target.dataset.action;
        const item = cart.find(item => item.id === id);

        if (item) {
            if (action === 'increase') {
                item.quantity++;
            } else if (action === 'decrease') {
                item.quantity--;
                if (item.quantity <= 0) {
                    cart = cart.filter(cartItem => cartItem.id !== id);
                }
            }
        }
        updateCartUI();
    }

    if (target.classList.contains('remove-item-btn')) {
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
    }
}

// 調試函數 - 檢查元素狀態
function debugElements() {
    console.log('=== 調試元素狀態 ===');
    console.log('authModal:', document.getElementById('authModal'));
    console.log('loginBtn:', document.getElementById('loginBtn'));
    console.log('registerBtn:', document.getElementById('registerBtn'));
    console.log('cart-sidebar:', document.querySelector('.cart-sidebar'));
    console.log('nav-cart:', document.querySelector('.nav-cart'));
    console.log('========================');
}

// 在控制台呼叫此函數來調試
window.debugElements = debugElements;

// 結帳功能設置
// script.js

function setupCheckout() {
    // 明確指定選取 .cart-sidebar 容器內的 .checkout-btn
    const checkoutBtn = document.querySelector('.cart-sidebar .checkout-btn');
    const checkoutPage = document.getElementById('checkout-page');
    const closeCheckoutBtn = document.querySelector('.close-checkout-btn');

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (cart.length === 0) {
                showCustomAlert('您的購物車是空的！', 'fas fa-shopping-cart', '購物車提示');
                return;
            }

            // 檢查後端實際登入狀態
            const response = await fetch(`${API_BASE_URL}/auth/status`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                showLoginRequired();
                return;
            }

            const authData = await response.json();

            if (!authData.authenticated) {
                localStorage.removeItem('username');
                updateUIForLoggedOutUser();
                showLoginRequired();
                return;
            }

            localStorage.setItem('username', authData.username);
            updateUIForLoggedInUser(authData.username);

            if (checkoutPage) {
                const deliveryDateInput = document.getElementById('delivery-date');
                if (deliveryDateInput) {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    const maxDate = new Date();
                    maxDate.setDate(maxDate.getDate() + 180);

                    const yyyy = tomorrow.getFullYear();
                    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
                    const dd = String(tomorrow.getDate()).padStart(2, '0');

                    const maxYyyy = maxDate.getFullYear();
                    const maxMm = String(maxDate.getMonth() + 1).padStart(2, '0');
                    const maxDd = String(maxDate.getDate()).padStart(2, '0');

                    deliveryDateInput.min = `${yyyy}-${mm}-${dd}`;
                    deliveryDateInput.max = `${maxYyyy}-${maxMm}-${maxDd}`;
                }

                switchCheckoutStep(1);
                updateCheckoutSummary();
                checkoutPage.classList.add('active');

                const cartSidebar = document.querySelector('.cart-sidebar');
                const cartOverlay = document.querySelector('.cart-overlay');
                if (cartSidebar && cartOverlay) {
                    cartSidebar.classList.remove('active');
                    cartOverlay.classList.remove('active');
                }
            }
        });
    }

    if (closeCheckoutBtn) {
        closeCheckoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (checkoutPage) {
                checkoutPage.classList.remove('active');
            }
        });
    }

    // 結帳步驟按鈕
    setupCheckoutSteps();
}

// 設置結帳步驟
function setupCheckoutSteps() {
    const gotoStep2Btn = document.getElementById('goto-step-2-btn');
    const gotoStep3Btn = document.getElementById('goto-step-3-btn');
    const gotoStep4Btn = document.getElementById('goto-step-4-btn');
    const backToStep1Btn = document.getElementById('back-to-step-1-btn');
    const backToStep2Btn = document.getElementById('back-to-step-2-btn');
    const backToStep3Btn = document.getElementById('back-to-step-3-btn');
    const confirmPurchaseBtn = document.getElementById('confirm-purchase-btn');
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');

    const customerForm = document.getElementById('customer-info-form');
    const shippingForm = document.getElementById('shipping-info-form');

    if (gotoStep2Btn) {
        gotoStep2Btn.addEventListener('click', (e) => {
            e.preventDefault();
            const isPhoneValid = validatePhone('customer-phone');
            if (customerForm && customerForm.checkValidity() && isPhoneValid) {
                if (switchCheckoutStep(2)) {
                    handleShippingMethodChange();
                    initializeDatePicker();
                }
            } else if (customerForm) {
                customerForm.reportValidity();
            }
        });
    }

    if (gotoStep3Btn) {
        gotoStep3Btn.addEventListener('click', (e) => {
            e.preventDefault();
            const isAddressValid = validateAddress('customer-address');
            const isBankAccountValid = validateBankAccountLast5('bank-account-last5');
            if (shippingForm && shippingForm.checkValidity() && isAddressValid && isBankAccountValid) {
                renderConfirmationSummary();
                switchCheckoutStep(3);
            } else if (shippingForm) {
                shippingForm.reportValidity();
            }
        });
    }

    if (gotoStep4Btn) {
        gotoStep4Btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchCheckoutStep(4);
        });
    }

    if (backToStep1Btn) {
        backToStep1Btn.addEventListener('click', () => switchCheckoutStep(1));
    }

    if (backToStep2Btn) {
        backToStep2Btn.addEventListener('click', () => switchCheckoutStep(2));
    }

    if (backToStep3Btn) {
        backToStep3Btn.addEventListener('click', () => switchCheckoutStep(3));
    }

    if (confirmPurchaseBtn) {
        confirmPurchaseBtn.addEventListener('click', finishPurchase);
    }

    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
            const checkoutPage = document.getElementById('checkout-page');
            if (checkoutPage) {
                checkoutPage.classList.remove('active');
            }
        });
    }

    // 寄送方式切換
    const shippingMethodRadios = document.querySelectorAll('input[name="shipping-method"]');
    shippingMethodRadios.forEach(radio => {
        radio.addEventListener('change', handleShippingMethodChange);
    });
}

// 初始化 Flatpickr 日期選擇器
function initializeDatePicker() {
    const deliveryDateInput = document.getElementById('delivery-date');
    if (!deliveryDateInput) {
        console.error('Flatpickr: delivery-date input not found!');
        return;
    }

    if (deliveryDateInput._flatpickr) {
        deliveryDateInput._flatpickr.destroy();
    }

    const removeExistingWarning = () => {
        const parent = deliveryDateInput.parentNode;
        const existingWarning = parent.querySelector('.weekend-warning');
        if (existingWarning) {
            existingWarning.remove();
        }
    };

    const customLocale = Object.assign({}, flatpickr.l10ns.zh_tw, {
        months: {
            shorthand: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
            longhand: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        }
    });

    flatpickr(deliveryDateInput, {
        minDate: new Date().fp_incr(1),
        maxDate: new Date().fp_incr(180),
        locale: customLocale,
        dateFormat: "Y-m-d",

        onChange: function (selectedDates, dateStr, instance) {
            removeExistingWarning();
        },
        onReady: function (selectedDates, dateStr, instance) {
            const container = instance.calendarContainer;
            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = "padding: 0 10px 10px; display: flex; gap: 5px; justify-content: center;";

            const quickDates = [
                { label: '明天', days: 1 },
                { label: '3天後', days: 3 },
                { label: '一週後', days: 7 },
                { label: '一個月後', days: 30 },
                { label: '三個月後', days: 90 }
            ];

            quickDates.forEach(({ label, days }) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'flatpickr-button';
                button.style.cssText = 'background: #f0f0f0; border: 1px solid #ddd; border-radius: 3px; padding: 4px 8px; cursor: pointer;';
                button.textContent = label;
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetDate = new Date().fp_incr(days);
                    instance.setDate(targetDate, true);
                    instance.close();
                });
                buttonContainer.appendChild(button);
            });

            container.appendChild(buttonContainer);
        }
    });
}

// 驗證函式
function validatePhone(inputId) {
    const phoneInput = document.getElementById(inputId);
    const errorSpan = document.getElementById(`${inputId}-error`);
    const phoneRegex = /^\d{10}$/;

    if (phoneInput && errorSpan) {
        if (phoneRegex.test(phoneInput.value)) {
            phoneInput.classList.remove('input-error');
            errorSpan.style.display = 'none';
            return true;
        } else {
            phoneInput.classList.add('input-error');
            errorSpan.style.display = 'block';
            return false;
        }
    }
    return true;
}

function validateAddress(inputId) {
    const addressInput = document.getElementById(inputId);
    const errorSpan = document.getElementById(`${inputId}-error`);
    const addressRegex = /^(?=.*[路街])(?=.*號).+$/;

    const shippingMethod = document.querySelector('input[name="shipping-method"]:checked').value;
    if (shippingMethod !== 'homedelivery') {
        addressInput.classList.remove('input-error');
        errorSpan.style.display = 'none';
        return true;
    }

    if (addressInput && errorSpan) {
        if (addressRegex.test(addressInput.value)) {
            addressInput.classList.remove('input-error');
            errorSpan.style.display = 'none';
            return true;
        } else {
            addressInput.classList.add('input-error');
            errorSpan.textContent = '地址格式不完整 (需包含路/街及號)。';
            errorSpan.style.display = 'block';
            return false;
        }
    }
    return true;
}

function validateBankAccountLast5(inputId) {
    const bankAccountInput = document.getElementById(inputId);
    const errorSpan = document.getElementById(`${inputId}-error`);
    const bankAccountRegex = /^\d{5}$/;

    if (bankAccountInput && errorSpan) {
        if (bankAccountRegex.test(bankAccountInput.value)) {
            bankAccountInput.classList.remove('input-error');
            errorSpan.style.display = 'none';
            return true;
        } else {
            bankAccountInput.classList.add('input-error');
            errorSpan.style.display = 'block';
            return false;
        }
    }
    return true;
}

// 顯示登入要求
function showLoginRequired() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 3000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 15px;
        text-align: center;
        max-width: 400px;
        margin: 0 1rem;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    `;

    content.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <i class="fas fa-user-lock" style="font-size: 3rem; color: #ff6b9d; margin-bottom: 1rem;"></i>
            <h3 style="color: #333; margin-bottom: 0.5rem;">需要登入才能結帳</h3>
            <p style="color: #666; line-height: 1.5;">
                為了提供更好的購物體驗和訂單管理，<br>
                請先登入或註冊會員帳號
            </p>
        </div>
        <div style="display: flex; gap: 1rem; justify-content: center;">
            <button id="login-required-login" style="
                background: linear-gradient(45deg, #ff6b9d, #ff8fab);
                color: white;
                border: none;
                padding: 0.8rem 1.2rem;
                border-radius: 25px;
                cursor: pointer;
                font-weight: 500;
                transition: transform 0.2s ease;
            ">立即登入</button>
            <button id="login-required-register" style="
                background: none;
                color: #ff6b9d;
                border: 2px solid #ff6b9d;
                padding: 0.8rem 1.2rem;
                border-radius: 25px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s ease;
            ">註冊會員</button>
            <button id="login-required-close" style="
                background: #f0f0f0;
                color: #666;
                border: none;
                padding: 0.8rem 1.2rem;
                border-radius: 25px;
                cursor: pointer;
                font-weight: 500;
            ">稍後再說</button>
        </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    document.getElementById('login-required-login').addEventListener('click', () => {
        document.body.removeChild(modal);
        const cartSidebar = document.querySelector('.cart-sidebar');
        const cartOverlay = document.querySelector('.cart-overlay');
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.remove('active');
            cartOverlay.classList.remove('active');
        }
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.style.display = 'block';
            showTab('login');
        }
    });

    document.getElementById('login-required-register').addEventListener('click', () => {
        document.body.removeChild(modal);
        const cartSidebar = document.querySelector('.cart-sidebar');
        const cartOverlay = document.querySelector('.cart-overlay');
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.remove('active');
            cartOverlay.classList.remove('active');
        }
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.style.display = 'block';
            showTab('register');
        }
    });

    document.getElementById('login-required-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// 顯示自訂提示框
function showCustomAlert(message, iconClass = 'fas fa-info-circle', title = '提示') {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 3000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 15px;
        text-align: center;
        max-width: 400px;
        margin: 0 1rem;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    `;

    content.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <i class="${iconClass}" style="font-size: 3rem; color: #ff6b9d; margin-bottom: 1rem;"></i>
            <h3 style="color: #333; margin-bottom: 0.5rem;">${title}</h3>
            <p style="color: #666; line-height: 1.5;">
                ${message}
            </p>
        </div>
        <div style="display: flex; gap: 1rem; justify-content: center;">
            <button id="custom-alert-close" style="
                background: linear-gradient(45deg, #ff6b9d, #ff8fab);
                color: white;
                border: none;
                padding: 0.8rem 1.2rem;
                border-radius: 25px;
                cursor: pointer;
                font-weight: 500;
                transition: transform 0.2s ease;
            ">確定</button>
        </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    document.getElementById('custom-alert-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// 切換結帳步驟
function switchCheckoutStep(stepNumber) {
    const username = localStorage.getItem('username');
    if (!username) {
        const checkoutPage = document.getElementById('checkout-page');
        if (checkoutPage) {
            checkoutPage.classList.remove('active');
        }
        showLoginRequired();
        return false;
    }

    document.querySelectorAll('.checkout-step-content').forEach(el => el.classList.remove('active'));
    const targetStep = document.querySelector(`#checkout-step-${stepNumber}`);
    if (targetStep) {
        targetStep.classList.add('active');
    }

    document.querySelectorAll('.checkout-steps .step').forEach(el => el.classList.remove('active'));
    const targetStepIndicator = document.querySelector(`.step[data-step="${stepNumber}"]`);
    if (targetStepIndicator) {
        targetStepIndicator.classList.add('active');
    }

    return true;
}

// 更新結帳訂單摘要
function updateCheckoutSummary() {
    const summaryContainer = document.getElementById('checkout-order-summary');
    renderOrderSummary(summaryContainer);
}

// 渲染訂單摘要
function renderOrderSummary(container) {
    if (!container) return;
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">購物車是空的</p>';
        return;
    }

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

// 處理寄送方式變更
function handleShippingMethodChange() {
    const selectedMethod = document.querySelector('input[name="shipping-method"]:checked');
    const homeDeliveryFields = document.getElementById('home-delivery-fields');
    const storePickupFields = document.getElementById('store-pickup-fields');
    const addressInput = document.getElementById('customer-address');
    const storeInput = document.getElementById('pickup-store-info');

    if (!selectedMethod) return;

    const method = selectedMethod.value;
    if (method === 'homedelivery') {
        if (homeDeliveryFields) homeDeliveryFields.style.display = 'block';
        if (storePickupFields) storePickupFields.style.display = 'none';
        if (addressInput) addressInput.required = true;
        if (storeInput) storeInput.required = false;
    } else {
        if (homeDeliveryFields) homeDeliveryFields.style.display = 'none';
        if (storePickupFields) storePickupFields.style.display = 'block';
        if (addressInput) addressInput.required = false;
        if (storeInput) storeInput.required = true;
    }
}

// 渲染確認摘要
function renderConfirmationSummary() {
    const nameInput = document.getElementById('customer-name');
    const phoneInput = document.getElementById('customer-phone');
    const shippingMethodInput = document.querySelector('input[name="shipping-method"]:checked');
    const confirmationSummaryContainer = document.getElementById('confirmation-summary');
    const addressInput = document.getElementById('customer-address');
    const storeInput = document.getElementById('pickup-store-info');

    if (!nameInput || !phoneInput || !shippingMethodInput || !confirmationSummaryContainer) return;

    const name = nameInput.value;
    const phone = phoneInput.value;
    const shippingMethod = shippingMethodInput.value;

    let shippingInfo = '';
    if (shippingMethod === 'homedelivery') {
        const address = addressInput ? addressInput.value : '';
        shippingInfo = `
            <tr>
                <td>寄送方式</td>
                <td>指定地址</td>
            </tr>
            <tr>
                <td>地址</td>
                <td>${address}</td>
            </tr>
        `;
    } else {
        const storeName = shippingMethod === '711' ? '7-11 門市' : '全家門市';
        const storeInfo = storeInput ? storeInput.value : '';
        shippingInfo = `
            <tr>
                <td>寄送方式</td>
                <td>${storeName}</td>
            </tr>
            <tr>
                <td>門市資訊</td>
                <td>${storeInfo}</td>
            </tr>
        `;
    }

    const deliveryDateInput = document.getElementById('delivery-date');
    const orderNotesInput = document.getElementById('order-notes');
    const bankAccountLast5Input = document.getElementById('bank-account-last5');

    const deliveryDate = deliveryDateInput ? deliveryDateInput.value : '';
    const orderNotes = orderNotesInput ? orderNotesInput.value : '';
    const bankAccountLast5 = bankAccountLast5Input ? bankAccountLast5Input.value : '';

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
            ${shippingInfo}
            ${deliveryDate ? `<tr><td>希望到貨日</td><td>${deliveryDate}</td></tr>` : ''}
            ${bankAccountLast5 ? `<tr><td>銀行帳號後5碼</td><td>${bankAccountLast5}</td></tr>` : ''}
            ${orderNotes ? `<tr><td>備註</td><td>${orderNotes}</td></tr>` : ''}
        </table>
    `;

    const orderSummaryContainer = document.getElementById('confirmation-order-summary');
    renderOrderSummary(orderSummaryContainer);
}

// 完成購買
async function finishPurchase() {
    const nameInput = document.getElementById('customer-name');
    const phoneInput = document.getElementById('customer-phone');
    const shippingMethodInput = document.querySelector('input[name="shipping-method"]:checked');
    const addressInput = document.getElementById('customer-address');
    const storeInput = document.getElementById('pickup-store-info');

    if (!nameInput || !phoneInput || !shippingMethodInput) {
        showCustomAlert('請填寫完整資料', 'fas fa-exclamation-circle', '資料填寫提示');
        return;
    }

    const name = nameInput.value;
    const phone = phoneInput.value;
    const shippingMethod = shippingMethodInput.value;

    let recipientName = name;
    let recipientPhone = phone;
    let shippingAddress = '';

    if (shippingMethod === 'homedelivery') {
        shippingAddress = addressInput ? addressInput.value : '';
    } else {
        const storeName = shippingMethod === '711' ? '7-11 門市' : '全家門市';
        const storeInfo = storeInput ? storeInput.value : '';
        shippingAddress = `${storeName}: ${storeInfo}`;
    }

    let subtotal = 0;
    const cartItems = cart.map(item => {
        subtotal += item.price * item.quantity;
        return {
            productId: parseInt(item.id.replace('f', '')),
            productName: item.name,
            quantity: item.quantity,
            price: item.price
        };
    });

    const shippingFee = subtotal >= 600 ? 0 : 60;
    const total = subtotal + shippingFee;

    const deliveryDateInput = document.getElementById('delivery-date');
    const orderNotesInput = document.getElementById('order-notes');
    const bankAccountLast5Input = document.getElementById('bank-account-last5');

    const orderData = {
        customerName: name,
        customerPhone: phone,
        customerEmail: null,
        recipientName: recipientName,
        recipientPhone: recipientPhone,
        shippingAddress: shippingAddress,
        shippingMethod: shippingMethod === 'homedelivery' ? '指定地址' :
            shippingMethod === '711' ? '7-11 門市取貨' : '全家門市取貨',
        shippingFee: shippingFee,
        deliveryDate: deliveryDateInput ? deliveryDateInput.value || null : null,
        orderNotes: orderNotesInput ? orderNotesInput.value || null : null,
        bankAccountLast5: bankAccountLast5Input ? bankAccountLast5Input.value || null : null,
        cartItems: cartItems
    };

    try {
        const response = await fetch(`${API_BASE_URL}/orders/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`訂單建立失敗: ${errorText}`);
        }

        const responseData = await response.json();

        const finalOrderIdElement = document.getElementById('final-order-id');
        if (finalOrderIdElement) {
            finalOrderIdElement.textContent = `#${responseData.orderId}`;
        }

        cart = [];
        localStorage.removeItem('cart');
        updateCartUI();

        switchCheckoutStep(5);

        if (typeof emailjs !== 'undefined') {
            const templateParams = {
                order_id: responseData.orderId,
                customer_name: name,
                customer_phone: phone,
                shipping_address: shippingAddress,
                shipping_method: orderData.shippingMethod,
                delivery_date: orderData.deliveryDate || '未指定',
                bank_account_last5: orderData.bankAccountLast5 || '未提供',
                order_notes: orderData.orderNotes || '無',
                cart_items: cartItems.map(item => `${item.productName} (x${item.quantity}) - NT$ ${item.price}`).join('\n'),
                total_amount: `NT$ ${total.toLocaleString()}`
            };

            emailjs.send('service_y0212', 'template_y0212', templateParams)
                .then(function (response) {
                    console.log('EmailJS SUCCESS!', response.status, response.text);
                }, function (error) {
                    console.error('EmailJS FAILED...', error);
                });
        }

    } catch (error) {
        console.error('完成購買時發生錯誤:', error);
        showCustomAlert(`訂單處理失敗: ${error.message}`, 'fas fa-times-circle', '錯誤');
    }
}