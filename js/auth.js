// 用户认证相关功能
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthMode = 'login'; // 'login' 或 'register'
    }

    // 检查用户登录状态
    checkAuthStatus() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUserInterface(true);
            return true;
        }
        return false;
    }

    // 更新用户界面
    updateUserInterface(isLoggedIn) {
        const userInfo = document.getElementById('user-info');
        const loginButton = document.getElementById('login-button');
        const mobileUserInfo = document.getElementById('mobile-user-info');
        const mobileLoginButton = document.getElementById('mobile-login-button');
        
        if (isLoggedIn && this.currentUser) {
            // 显示用户信息
            document.getElementById('user-name').textContent = `欢迎，${this.currentUser.name}`;
            document.getElementById('mobile-user-name').textContent = `欢迎，${this.currentUser.name}`;
            
            userInfo.classList.remove('hidden');
            loginButton.classList.add('hidden');
            mobileUserInfo.classList.remove('hidden');
            mobileLoginButton.classList.add('hidden');
            
            // 更新个人中心信息
            if (document.getElementById('username')) {
                document.getElementById('username').value = this.currentUser.name;
                document.getElementById('email').value = this.currentUser.email;
            }
            
            // 更新个人中心头像区域
            if (document.getElementById('profile-display-name')) {
                document.getElementById('profile-display-name').textContent = this.currentUser.name;
                document.getElementById('profile-display-email').textContent = this.currentUser.email;
            }
        } else {
            // 显示登录按钮
            userInfo.classList.add('hidden');
            loginButton.classList.remove('hidden');
            mobileUserInfo.classList.add('hidden');
            mobileLoginButton.classList.remove('hidden');
        }
    }

    // 切换登录/注册模式
    toggleAuthMode() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const authToggle = document.getElementById('auth-toggle');
        
        if (this.isAuthMode === 'login') {
            this.isAuthMode = 'register';
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            authToggle.textContent = '已有账户？登录';
            document.querySelector('h2').textContent = '创建新账户';
        } else {
            this.isAuthMode = 'login';
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            authToggle.textContent = '创建新账户';
            document.querySelector('h2').textContent = '欢迎使用 AI 面试官';
        }
        
        this.hideAuthMessages();
    }

    // 显示认证错误信息
    showAuthError(message) {
        const errorDiv = document.getElementById('auth-error');
        const errorMessage = document.getElementById('auth-error-message');
        const successDiv = document.getElementById('auth-success');
        
        errorMessage.textContent = message;
        errorDiv.classList.remove('hidden');
        successDiv.classList.add('hidden');
    }

    // 显示认证成功信息
    showAuthSuccess(message) {
        const successDiv = document.getElementById('auth-success');
        const successMessage = document.getElementById('auth-success-message');
        const errorDiv = document.getElementById('auth-error');
        
        successMessage.textContent = message;
        successDiv.classList.remove('hidden');
        errorDiv.classList.add('hidden');
    }

    // 隐藏认证消息
    hideAuthMessages() {
        document.getElementById('auth-error').classList.add('hidden');
        document.getElementById('auth-success').classList.add('hidden');
    }

    // 登录处理
    handleLogin(email, password) {
        // 模拟登录验证
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = { ...user };
            delete this.currentUser.password; // 不在内存中保存密码
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            this.showAuthSuccess('登录成功！正在跳转...');
            this.updateUserInterface(true);
            
            setTimeout(() => {
                navigationManager.showPage('home');
            }, 1000);
            
            return true;
        } else {
            this.showAuthError('邮箱或密码错误');
            return false;
        }
    }

    // 注册处理
    handleRegister(name, email, password, confirmPassword) {
        // 基础验证
        if (password.length < 6) {
            this.showAuthError('密码至少需要6位字符');
            return false;
        }
        
        if (password !== confirmPassword) {
            this.showAuthError('两次输入的密码不一致');
            return false;
        }
        
        // 检查邮箱是否已存在
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(u => u.email === email)) {
            this.showAuthError('该邮箱已被注册');
            return false;
        }
        
        // 创建新用户
        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        this.showAuthSuccess('注册成功！请登录您的账户');
        
        // 切换到登录模式
        setTimeout(() => {
            this.toggleAuthMode();
            document.getElementById('login-email').value = email;
        }, 1500);
        
        return true;
    }

    // 退出登录
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUserInterface(false);
        navigationManager.showPage('login');
    }

    // 页面访问权限检查
    requireAuth(pageId) {
        if (!this.currentUser && ['interview', 'history', 'profile'].includes(pageId)) {
            navigationManager.showPage('login');
            this.showAuthError('请先登录后使用该功能');
            return false;
        }
        return true;
    }

    // 更新个人资料
    updateProfile(event) {
        event.preventDefault();
        
        if (!this.currentUser) return;
        
        const newName = document.getElementById('username').value;
        const newEmail = document.getElementById('email').value;
        const newPassword = document.getElementById('password').value;
        
        // 更新用户信息
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex].name = newName;
            users[userIndex].email = newEmail;
            
            if (newPassword && newPassword.length >= 6) {
                users[userIndex].password = newPassword;
            }
            
            // 更新存储
            localStorage.setItem('users', JSON.stringify(users));
            
            // 更新当前用户信息
            this.currentUser.name = newName;
            this.currentUser.email = newEmail;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            // 更新所有界面显示
            this.updateUserInterface(true);
            
            // 清空密码字段
            document.getElementById('password').value = '';
            
            // 显示成功提示
            alert('个人信息已更新！');
        }
    }
}

// 创建全局认证管理器实例
const authManager = new AuthManager();

// 全局函数，供HTML中的onclick事件使用
function toggleAuthMode() {
    authManager.toggleAuthMode();
}

function handleLogin(email, password) {
    return authManager.handleLogin(email, password);
}

function handleRegister(name, email, password, confirmPassword) {
    return authManager.handleRegister(name, email, password, confirmPassword);
}

function logout() {
    authManager.logout();
}

function updateProfile(event) {
    authManager.updateProfile(event);
}
