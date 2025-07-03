// 个人中心页面相关功能
class ProfileManager {
    renderPage() {
        const pageContent = document.getElementById('page-content');
        pageContent.innerHTML = this.getProfileTemplate();
        lucide.createIcons();
        this.bindEvents();
        // 填充当前用户信息
        if (authManager.currentUser) {
            document.getElementById('profile-display-name').textContent = authManager.currentUser.name;
            document.getElementById('profile-display-email').textContent = authManager.currentUser.email;
            document.getElementById('username').value = authManager.currentUser.name;
            document.getElementById('email').value = authManager.currentUser.email;
        }
    }

    getProfileTemplate() {
        return `
        <div class="max-w-3xl mx-auto p-4 md:p-8">
            <h2 class="text-3xl font-bold text-white mb-8">个人中心</h2>
            <div class="bg-gray-900 rounded-xl p-8 shadow-lg">
                <div class="flex items-center space-x-6 mb-8">
                    <img class="h-24 w-24 rounded-full object-cover" src="https://placehold.co/100x100/312e81/ffffff?text=User" alt="用户头像">
                    <div>
                        <h3 id="profile-display-name" class="text-2xl font-bold text-white">张三</h3>
                        <p id="profile-display-email" class="text-gray-400">zhangsan@example.com</p>
                    </div>
                </div>
                <form class="space-y-6" id="profile-form">
                    <div>
                        <label for="username" class="block text-sm font-medium text-gray-300">用户名</label>
                        <input type="text" id="username" class="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-300">邮箱</label>
                        <input type="email" id="email" class="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-300">修改密码</label>
                        <input type="password" id="password" placeholder="输入新密码（留空则不修改）" class="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <div class="pt-4">
                        <button type="submit" class="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">保存更改</button>
                    </div>
                </form>
            </div>
        </div>
        `;
    }

    bindEvents() {
        const form = document.getElementById('profile-form');
        if (form) {
            form.onsubmit = updateProfile;
        }
    }
}

// 全局实例
const profileManager = new ProfileManager();
