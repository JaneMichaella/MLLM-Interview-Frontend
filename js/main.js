// 主入口，初始化页面
window.addEventListener('DOMContentLoaded', () => {
    // 检查登录状态
    if (authManager.checkAuthStatus()) {
        navigationManager.showPage('home');
    } else {
        navigationManager.showPage('login');
    }
    // 移动端菜单按钮
    const mobileMenuBtn = document.getElementById('mobile-menu-button');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            document.getElementById('mobile-menu').classList.toggle('hidden');
        });
    }
    // 隐私弹窗按钮
    window.closePrivacyModal = function() {
        document.getElementById('privacy-modal').classList.add('hidden');
    };
    window.agreeAndStart = function() {
        const privacyCheckbox = document.getElementById('privacy-checkbox');
        if (privacyCheckbox) privacyCheckbox.checked = true;
        closePrivacyModal();
        if (typeof interviewManager !== 'undefined') {
            interviewManager.proceedToInterview();
        }
    };
});
