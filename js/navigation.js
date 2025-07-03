// 页面导航管理
class NavigationManager {
    constructor() {
        this.pages = new Map();
        this.currentPage = null;
        this.loadPageTemplates();
    }

    // 加载页面模板
    loadPageTemplates() {
        // 登录页面模板
        this.pages.set('login', `
            <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div class="max-w-md w-full space-y-8">
                    <div class="text-center">
                        <i data-lucide="brain-circuit" class="mx-auto h-16 w-16 text-indigo-500"></i>
                        <h2 class="mt-6 text-3xl font-extrabold text-white">
                            欢迎使用 AI 面试官
                        </h2>
                        <p class="mt-2 text-sm text-gray-400">
                            请登录您的账户或
                            <button onclick="toggleAuthMode()" class="font-medium text-indigo-400 hover:text-indigo-300" id="auth-toggle">
                                创建新账户
                            </button>
                        </p>
                    </div>
                    
                    <!-- 登录表单 -->
                    <form id="login-form" class="mt-8 space-y-6">
                        <div class="space-y-4">
                            <div>
                                <label for="login-email" class="sr-only">邮箱地址</label>
                                <input id="login-email" name="email" type="email" required 
                                       class="relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                       placeholder="邮箱地址">
                            </div>
                            <div>
                                <label for="login-password" class="sr-only">密码</label>
                                <input id="login-password" name="password" type="password" required
                                       class="relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                       placeholder="密码">
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" 
                                       class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-800">
                                <label for="remember-me" class="ml-2 block text-sm text-gray-400">
                                    记住我
                                </label>
                            </div>
                            <div class="text-sm">
                                <a href="#" class="font-medium text-indigo-400 hover:text-indigo-300">
                                    忘记密码？
                                </a>
                            </div>
                        </div>
                        
                        <div>
                            <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                登录
                            </button>
                        </div>
                    </form>
                    
                    <!-- 注册表单 -->
                    <form id="register-form" class="mt-8 space-y-6 hidden">
                        <div class="space-y-4">
                            <div>
                                <label for="register-name" class="sr-only">姓名</label>
                                <input id="register-name" name="name" type="text" required
                                       class="relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                       placeholder="姓名">
                            </div>
                            <div>
                                <label for="register-email" class="sr-only">邮箱地址</label>
                                <input id="register-email" name="email" type="email" required
                                       class="relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                       placeholder="邮箱地址">
                            </div>
                            <div>
                                <label for="register-password" class="sr-only">密码</label>
                                <input id="register-password" name="password" type="password" required
                                       class="relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                       placeholder="密码 (至少6位)">
                            </div>
                            <div>
                                <label for="register-confirm-password" class="sr-only">确认密码</label>
                                <input id="register-confirm-password" name="confirm-password" type="password" required
                                       class="relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                       placeholder="确认密码">
                            </div>
                        </div>
                        
                        <div>
                            <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                注册账户
                            </button>
                        </div>
                    </form>
                    
                    <!-- 错误提示 -->
                    <div id="auth-error" class="hidden mt-4 p-3 bg-red-900/50 border border-red-600 rounded-md">
                        <p class="text-red-400 text-sm text-center" id="auth-error-message"></p>
                    </div>
                    
                    <!-- 成功提示 -->
                    <div id="auth-success" class="hidden mt-4 p-3 bg-green-900/50 border border-green-600 rounded-md">
                        <p class="text-green-400 text-sm text-center" id="auth-success-message"></p>
                    </div>
                </div>
            </div>
        `);

        // 首页模板
        this.pages.set('home', `
            <div class="text-center py-24 px-4 bg-gray-900">
                <h1 class="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
                    多模态智能<span class="text-indigo-400">面试评测系统</span>
                </h1>
                <p class="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
                    结合语音、视频、文本多维度分析，提供科学、全面的能力评估与反馈。
                </p>
                <button onclick="showPage('interview')" class="mt-8 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-transform duration-300">
                    立即开始模拟面试
                </button>
            </div>
            <div class="py-16 bg-gray-800">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center mb-12">
                        <h2 class="text-3xl font-bold text-white">系统特色</h2>
                        <p class="text-gray-400 mt-2">专为企业与求职者打造的下一代面试解决方案</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div class="bg-gray-900 p-8 rounded-xl shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300">
                            <i data-lucide="boxes" class="mx-auto h-12 w-12 text-indigo-400"></i>
                            <h3 class="mt-6 text-xl font-semibold text-white">多场景覆盖</h3>
                            <p class="mt-2 text-gray-400">支持人工智能、大数据、物联网等多个技术岗位。</p>
                        </div>
                        <div class="bg-gray-900 p-8 rounded-xl shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300">
                            <i data-lucide="scan-face" class="mx-auto h-12 w-12 text-indigo-400"></i>
                            <h3 class="mt-6 text-xl font-semibold text-white">多模态分析</h3>
                            <p class="mt-2 text-gray-400">整合语音、视频、文本数据，构建动态评测体系。</p>
                        </div>
                        <div class="bg-gray-900 p-8 rounded-xl shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300">
                            <i data-lucide="file-text" class="mx-auto h-12 w-12 text-indigo-400"></i>
                            <h3 class="mt-6 text-xl font-semibold text-white">简历解析</h3>
                            <p class="mt-2 text-gray-400">上传简历，AI将结合简历内容进行个性化提问。</p>
                        </div>
                        <div class="bg-gray-900 p-8 rounded-xl shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300">
                            <i data-lucide="shield-check" class="mx-auto h-12 w-12 text-indigo-400"></i>
                            <h3 class="mt-6 text-xl font-semibold text-white">数据合规</h3>
                            <p class="mt-2 text-gray-400">符合隐私保护规范，确保用户数据加密存储与合规使用。</p>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    // 显示指定页面
    showPage(pageId) {
        // 权限检查
        if (!authManager.requireAuth(pageId)) {
            return;
        }
        
        const pageContent = document.getElementById('page-content');
        
        // 如果是面试、历史记录或个人中心页面，使用对应的管理器
        if (pageId === 'interview') {
            interviewManager.renderPage();
        } else if (pageId === 'history') {
            historyManager.renderPage();
        } else if (pageId === 'profile') {
            profileManager.renderPage();
        } else {
            // 使用模板页面
            const template = this.pages.get(pageId);
            if (template) {
                pageContent.innerHTML = template;
                // 重新初始化图标
                lucide.createIcons();
                
                // 如果是登录页面，需要重新绑定事件
                if (pageId === 'login') {
                    this.bindLoginEvents();
                }
            }
        }

        // 更新导航栏状态
        this.updateNavigation(pageId);
        
        // 关闭移动端菜单
        document.getElementById('mobile-menu').classList.add('hidden');
        
        this.currentPage = pageId;
    }

    // 绑定登录页面事件
    bindLoginEvents() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                handleLogin(email, password);
            });
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('register-name').value;
                const email = document.getElementById('register-email').value;
                const password = document.getElementById('register-password').value;
                const confirmPassword = document.getElementById('register-confirm-password').value;
                handleRegister(name, email, password, confirmPassword);
            });
        }
    }

    // 更新导航栏状态
    updateNavigation(pageId) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('bg-gray-900', 'text-white');
            link.classList.add('text-gray-300');
            if (link.getAttribute('onclick').includes(pageId)) {
                link.classList.add('bg-gray-900', 'text-white');
                link.classList.remove('text-gray-300');
            }
        });
    }
}

// 创建全局导航管理器实例
const navigationManager = new NavigationManager();

// 全局函数，供HTML中的onclick事件使用
function showPage(pageId) {
    navigationManager.showPage(pageId);
}
