// 历史记录页面相关功能
class HistoryManager {
    constructor() {
        this.mockHistoryData = [
            { id: 1, title: '机器学习工程师', date: '2025-07-01', score: 82, data: [85, 80, 90, 88, 70, 75] },
            { id: 2, title: '大数据工程师', date: '2025-06-15', score: 78, data: [70, 85, 80, 75, 80, 78] },
            { id: 3, title: '公务员选拔（拓展）', date: '2025-06-02', score: 92, data: [90, 95, 85, 90, 95, 98] },
        ];
        this.historyBarChartInstance = null;
        this.historyLineChartInstance = null;
        this.CORE_METRICS = ['专业知识', '技能匹配', '语言表达', '逻辑思维', '创新能力', '抗压能力'];
    }

    renderPage() {
        const pageContent = document.getElementById('page-content');
        pageContent.innerHTML = this.getHistoryTemplate();
        lucide.createIcons();
        this.loadHistoryList();
    }

    getHistoryTemplate() {
        return `
        <div class="max-w-7xl mx-auto p-4 md:p-8">
            <h2 class="text-3xl font-bold text-white mb-6">面试历史记录</h2>
            <div class="flex flex-col lg:flex-row gap-8">
                <div class="lg:w-1/3 bg-gray-900 rounded-xl p-4 h-full">
                    <div class="mb-4">
                        <input type="text" placeholder="搜索面试记录..." class="w-full bg-gray-800 border-gray-700 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <div id="history-list" class="space-y-3 max-h-[60vh] overflow-y-auto pr-2"></div>
                </div>
                <div id="history-detail" class="lg:w-2/3 bg-gray-900 rounded-xl p-6 hidden">
                    <h3 id="detail-title" class="text-2xl font-bold text-white mb-2"></h3>
                    <p id="detail-date" class="text-gray-400 mb-6"></p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 class="font-semibold text-white mb-3 text-lg">能力对比</h4>
                            <canvas id="historyBarChart"></canvas>
                        </div>
                        <div>
                            <h4 class="font-semibold text-white mb-3 text-lg">视频回放</h4>
                            <div class="aspect-video bg-black rounded-lg flex items-center justify-center">
                                <i data-lucide="play-circle" class="h-16 w-16 text-gray-500"></i>
                            </div>
                            <p class="text-xs text-gray-500 mt-2 text-center">时间轴标记功能开发中...</p>
                        </div>
                    </div>
                    <div class="mt-8">
                        <h4 class="font-semibold text-white mb-3 text-lg">综合能力趋势</h4>
                        <canvas id="historyLineChart"></canvas>
                    </div>
                </div>
                <div id="history-placeholder" class="lg:w-2/3 flex items-center justify-center bg-gray-900 rounded-xl p-6">
                    <p class="text-gray-500">请从左侧选择一个记录查看详情</p>
                </div>
            </div>
        </div>
        `;
    }

    loadHistoryList() {
        const listEl = document.getElementById('history-list');
        listEl.innerHTML = '';
        this.mockHistoryData.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-indigo-900/50 transition-colors';
            itemEl.onclick = () => this.showHistoryDetail(item.id);
            itemEl.innerHTML = `
                <div class="flex justify-between items-center">
                    <h4 class="font-semibold text-white">${item.title}</h4>
                    <span class="text-sm font-bold text-indigo-400">${item.score}分</span>
                </div>
                <p class="text-sm text-gray-400 mt-1">${item.date}</p>
            `;
            listEl.appendChild(itemEl);
        });
    }

    showHistoryDetail(id) {
        document.getElementById('history-placeholder').style.display = 'none';
        document.getElementById('history-detail').style.display = 'block';
        const data = this.mockHistoryData.find(item => item.id === id);
        if (!data) return;
        document.getElementById('detail-title').textContent = data.title;
        document.getElementById('detail-date').textContent = `面试日期: ${data.date}`;
        this.renderHistoryCharts(data);
    }

    renderHistoryCharts(detailData) {
        const barCtx = document.getElementById('historyBarChart').getContext('2d');
        const lineCtx = document.getElementById('historyLineChart').getContext('2d');
        if (this.historyBarChartInstance) this.historyBarChartInstance.destroy();
        if (this.historyLineChartInstance) this.historyLineChartInstance.destroy();
        this.historyBarChartInstance = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: this.CORE_METRICS,
                datasets: [{
                    label: '本次得分',
                    data: detailData.data,
                    backgroundColor: 'rgba(99, 102, 241, 0.6)',
                }]
            },
            options: {
                indexAxis: 'y',
                scales: {
                    x: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#d1d5db' } },
                    y: { grid: { display: false }, ticks: { color: '#d1d5db' } }
                },
                plugins: { legend: { display: false } }
            }
        });
        this.historyLineChartInstance = new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: this.mockHistoryData.map(d => d.date.substring(5)).reverse(),
                datasets: [{
                    label: '综合得分趋势',
                    data: this.mockHistoryData.map(d => d.score).reverse(),
                    fill: true,
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    tension: 0.3
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: false, min: 50, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#d1d5db' } },
                    x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#d1d5db' } }
                },
                plugins: { legend: { labels: { color: '#d1d5db' } } }
            }
        });
    }
}

// 全局实例
const historyManager = new HistoryManager();
