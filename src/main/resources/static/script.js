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

// 認證相關功能
function initializeAuth() {
    const authModal = document.getElementById('authModal');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const closeBtn = document.querySelector('.close-button');
    const tabButtons = document.querySelectorAll('.tab-button');

    // 開啟登入模態框
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            authModal.style.display = 'block';
            showTab('login');
        });
    }

    // 開啟註冊模態框
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            authModal.style.display = 'block';
            showTab('register');
        });
    }

    // 關閉模態框
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            authModal.style.display = 'none';
        });
    }

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
    const loginForm = document.getElementById('loginFormElement');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // 註冊表單提交
    const registerForm = document.getElementById('registerFormElement');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // 登出
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
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

    console.log('Attempting login with:', loginData.username); // 除錯用

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json' // 添加這行
            },
            body: new URLSearchParams(loginData),
            credentials: 'include'
        });

        console.log('Login response status:', response.status); // 除錯用

        if (response.ok) {
            const responseData = await response.json();
            console.log('Login response:', responseData); // 除錯用

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
            e.target.reset();
        } else {
            const error = await response.text();
            showMessage('registerMessage', error || '註冊失敗', 'error');
        }
    } catch (error) {
        console.error('註冊錯誤:', error);
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

// 購物車功能
function setupShoppingCart() {
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    const openCartBtn = document.querySelector('.nav-cart');
    const closeCartBtn = document.querySelector('.close-cart-btn');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const cartItemsContainer = document.querySelector('.cart-items');

    // 開啟購物車
    if (openCartBtn) {
        openCartBtn.addEventListener('click', () => {
            console.log('Cart icon clicked!'); // 除錯用
            if (cartSidebar && cartOverlay) {
                cartSidebar.classList.add('active');
                cartOverlay.classList.add('active');
            }
        });
    }
    // 完整的購物車除錯
    console.log('=== 購物車除錯 ===');
    console.log('購物車數據:', cart);
    console.log('購物車圖示:', document.querySelector('.nav-cart'));
    console.log('購物車側邊欄:', document.querySelector('.cart-sidebar'));
    console.log('購物車遮罩:', document.querySelector('.cart-overlay'));

    // 檢查事件監聽器
    const cartIcon = document.querySelector('.nav-cart');
    if (cartIcon) {
        console.log('購物車圖示存在，添加點擊測試');
        cartIcon.onclick = function () {
            console.log('購物車被點擊！');
            const sidebar = document.querySelector('.cart-sidebar');
            const overlay = document.querySelector('.cart-overlay');
            if (sidebar && overlay) {
                sidebar.classList.add('active');
                overlay.classList.add('active');
                console.log('購物車應該已打開');
            } else {
                console.log('找不到購物車元素');
            }
        };
    }
    // 關閉購物車
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            if (cartSidebar && cartOverlay) {
                cartSidebar.classList.remove('active');
                cartOverlay.classList.remove('active');
            }
        });
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
            cartOverlay.classList.remove('active');
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
}

// 加入購物車
function addToCart(e) {
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

// 結帳功能設置
function setupCheckout() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    const checkoutPage = document.getElementById('checkout-page');
    const closeCheckoutBtn = document.querySelector('.close-checkout-btn');

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async function (e) {
            e.preventDefault();

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
                // 清除前端狀態
                localStorage.removeItem('username');
                updateUIForLoggedOutUser();
                showLoginRequired();
                return;
            }

            // 同步前端狀態
            localStorage.setItem('username', authData.username);
            updateUIForLoggedInUser(authData.username);

            // 進入結帳流程
            if (checkoutPage) {
                // 設定日期選擇器的最小日期為明天，最大日期為半年後
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

                // 關閉購物車
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
        closeCheckoutBtn.addEventListener('click', () => {
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

    // 如果已經初始化，先銷毀舊的實例
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

    // 自定義中文語言包，月份顯示為數字
    const customLocale = Object.assign({}, flatpickr.l10ns.zh_tw, {
        months: {
            shorthand: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
            longhand: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        }
    });

    flatpickr(deliveryDateInput, {
        minDate: new Date().fp_incr(1),
        maxDate: new Date().fp_incr(180), // 改為半年（180天）
        locale: customLocale,
        dateFormat: "Y-m-d",

        onChange: function (selectedDates, dateStr, instance) {
            removeExistingWarning();
            // 移除週末限制，所有日期都可以選擇
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

    // 只有在指定地址被選中時才需要驗證
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

    // 按鈕事件
    document.getElementById('login-required-login').addEventListener('click', () => {
        document.body.removeChild(modal);

        // 關閉購物車
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

        // 關閉購物車
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

    // 點擊外部關閉
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
    // 檢查登入狀態
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

    // 計算金額
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

    // 準備訂單資料
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
        // 發送訂單到後端 API
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

        // 解析回應
        const responseData = await response.json();

        // 在感謝頁面顯示訂單編號
        const finalOrderIdElement = document.getElementById('final-order-id');
        if (finalOrderIdElement) {
            finalOrderIdElement.textContent = `#${responseData.orderId}`;
        }

        // 清空購物車
        cart = [];
        localStorage.removeItem('cart');
        updateCartUI();

        // 切換到完成頁面
        switchCheckoutStep(5);

        // 發送 EmailJS
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