// 面试流程相关功能
class InterviewManager {
    constructor() {
        this.uploadedFile = null;
        this.parsedResumeText = null;
        this.isParsing = false;
        this.MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        this.ALLOWED_TYPES = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        this.TOTAL_INTERVIEW_TIME = 600;
        this.interviewTimerInterval = null;
        this.dynamicThinkingInterval = null;
        this.resultRadarChartInstance = null;
        this.CORE_METRICS = ['专业知识', '技能匹配', '语言表达', '逻辑思维', '创新能力', '抗压能力'];
        this.localStream = null; // 用于存储本地音视频流
    }

    renderPage() {
        const pageContent = document.getElementById('page-content');
        pageContent.innerHTML = this.getInterviewTemplate();
        lucide.createIcons();
        this.bindEvents();
        this.resetInterviewPage();
    }

    getInterviewTemplate() {
        return `
        <div id="interview-setup" class="flex flex-col items-center justify-center min-h-[70vh] text-center p-4">
            <div class="w-full max-w-lg bg-gray-900 p-8 rounded-xl shadow-2xl">
                <h2 class="text-3xl font-bold text-white mb-6">面试设置</h2>
                <div class="space-y-6 text-left">
                    <div>
                        <label for="position-select" class="block text-sm font-medium text-gray-300 mb-2">1. 选择面试岗位</label>
                        <select id="position-select" class="w-full bg-gray-800 border-gray-700 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500">
                            <option>算法工程师</option>
                            <option>后端工程师</option>
                            <option>前端工程师</option>
                            <option>测试工程师</option>
                            <option>大数据工程师</option>
                            <option>硬件工程师</option>
                            <option>基础架构工程师</option>
                            <option>安全工程师</option>
                            <option>机器学习工程师</option>
                            <option>多媒体工程师</option>
                            <option>计算机视觉工程师</option>
                            <option>运维工程师</option>
                            <option>数据挖掘工程师</option>
                            <option>自然语言处理工程师</option>
                            <option>公务员选拔（拓展）</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">2. 上传你的简历 (可选)</label>
                        <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                            <div class="space-y-1 text-center">
                                <i data-lucide="file-up" class="mx-auto h-12 w-12 text-gray-500"></i>
                                <div class="flex text-sm text-gray-400">
                                    <label for="resume-upload" class="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-500 focus-within:outline-none">
                                        <span>选择文件</span>
                                        <input id="resume-upload" name="resume-upload" type="file" class="sr-only">
                                    </label>
                                    <p class="pl-1">或拖拽到此处</p>
                                </div>
                                <p id="resume-filename" class="text-xs text-gray-500">支持 DOC, DOCX, PDF 格式，最大 10MB</p>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <input id="privacy-checkbox" type="checkbox" class="h-4 w-4 text-indigo-600 border-gray-600 rounded mt-1 focus:ring-indigo-500">
                        <label for="privacy-checkbox" class="ml-3 text-sm text-gray-400">我已阅读并同意<a href="#" class="text-indigo-400 hover:underline">《隐私政策》</a>，并授权系统分析我的面试数据。</label>
                    </div>
                </div>
                <button id="start-interview-btn" class="mt-8 w-full py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700">
                    开始面试
                </button>
            </div>
        </div>
        <div id="interview-in-progress" class="hidden flex flex-col lg:flex-row p-4 md:p-8 gap-8 min-h-[80vh]">
            <div class="flex-grow bg-gray-900 rounded-xl p-6 flex flex-col">
                <div class="flex items-center justify-between mb-4">
                    <h3 id="interview-title" class="text-xl font-semibold text-white"></h3>
                    <div class="flex items-center space-x-2 text-red-500 animate-pulse">
                        <i data-lucide="radio" class="h-5 w-5"></i>
                        <span>正在录制中</span>
                    </div>
                </div>
                <div class="flex-grow bg-black rounded-lg flex items-center justify-center relative">
                    <i data-lucide="bot" class="h-32 w-32 text-indigo-500"></i>
                    <p id="dynamic-thinking" class="absolute bottom-4 text-sm text-gray-500 opacity-0 transition-opacity duration-500">AI 正在生成追问...</p>
                </div>
                <div class="mt-4 bg-gray-800 p-4 rounded-lg">
                    <p id="ai-question" class="text-lg text-white">你好，请先做个自我介绍吧。</p>
                </div>
            </div>
            <div class="w-full lg:w-1/3 flex flex-col gap-4">
                <div class="bg-gray-900 rounded-xl p-4 flex-grow flex flex-col justify-between">
                    <h3 class="text-lg font-semibold text-white mb-2 text-center">你的画面</h3>
                    <div class="aspect-video bg-black rounded-lg flex items-center justify-center">
                        <video id="user-video-preview" class="w-full h-full object-cover rounded-lg hidden" autoplay muted playsinline></video>
                        <i data-lucide="video" class="h-16 w-16 text-gray-600"></i>
                    </div>
                    <div class="mt-4 flex justify-center space-x-4">
                        <button class="p-3 bg-gray-700 rounded-full hover:bg-gray-600"><i data-lucide="mic-off" class="text-white"></i></button>
                        <button class="p-3 bg-gray-700 rounded-full hover:bg-gray-600"><i data-lucide="video-off" class="text-white"></i></button>
                    </div>
                </div>
                <div class="bg-gray-900 rounded-xl p-4 text-center">
                    <h3 class="text-lg font-semibold text-white">面试计时</h3>
                    <p id="interview-timer" class="text-3xl font-mono text-indigo-400 mt-2">10:00</p>
                    <p id="time-reminder" class="text-sm text-yellow-400 font-bold hidden mt-1">剩余时间不足1分钟</p>
                </div>
                <button id="finish-interview-btn" class="w-full py-3 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700">
                    结束面试
                </button>
            </div>
        </div>
        <div id="interview-results" class="hidden max-w-5xl mx-auto p-4 md:p-8">
            <div class="text-center mb-8">
                <h2 class="text-3xl font-bold text-white">面试分析报告</h2>
                <p class="text-gray-400 mt-2">这是本次面试的综合评估结果。</p>
            </div>
            <div class="bg-gray-900 rounded-xl p-8 shadow-2xl">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-gray-700 pb-8">
                    <div class="text-center">
                        <p class="text-gray-400 text-lg">综合评分</p>
                        <p class="text-7xl font-bold text-indigo-400 my-2">82</p>
                        <p class="text-xl font-semibold text-green-400">潜力优秀</p>
                    </div>
                    <div>
                        <h4 class="font-semibold text-white mb-3 text-center">核心能力雷达图</h4>
                        <canvas id="resultRadarChart"></canvas>
                    </div>
                </div>
                <div class="mt-8 border-b border-gray-700 pb-8">
                    <h4 class="font-semibold text-white mb-4 text-xl flex items-center"><i data-lucide="briefcase" class="mr-2"></i>给企业的决策参考</h4>
                    <div class="space-y-4">
                        <div class="bg-gray-800 p-4 rounded-lg">
                            <h5 class="font-semibold text-indigo-300">多模态分析亮点</h5>
                            <p class="text-gray-300 mt-2"><b class="text-green-400">文本分析:</b> 针对“项目挑战”问题，回答内容结构完整，符合STAR原则。</p>
                            <p class="text-gray-300 mt-1"><b class="text-green-400">语音分析:</b> 整体语速适中，情感积极，表现出自信。</p>
                            <p class="text-gray-300 mt-1"><b class="text-yellow-400">视频分析:</b> 在回答“缺点”问题时，出现约3秒的眼神躲闪，可能是不自信或紧张的表现。</p>
                        </div>
                        <div class="bg-gray-800 p-4 rounded-lg">
                            <h5 class="font-semibold text-indigo-300">待考察点</h5>
                            <p class="text-gray-300 mt-1">在“创新能力”方面表现平平，建议在二面中深入考察其解决开放性问题的能力。</p>
                        </div>
                    </div>
                </div>
                <div class="mt-8 border-b border-gray-700 pb-8">
                    <h4 class="font-semibold text-white mb-4 text-xl flex items-center"><i data-lucide="user-check" class="mr-2"></i>给求职者的提升建议</h4>
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <p class="text-gray-300 mt-1"><b>1. 眼神交流：</b> 尝试在回答时更稳定地注视摄像头，这能有效提升沟通的真诚度和专业度。</p>
                        <p class="text-gray-300 mt-1"><b>2. 成果量化：</b> 在描述项目时，多使用数字来量化你的贡献，例如“将处理效率提升了20%”，而不是“显著提升了效率”。</p>
                        <p class="text-gray-300 mt-1"><b>3. 创新思维展现：</b> 准备一两个能体现你创新思维或独特见解的案例，在适当时候主动分享。</p>
                    </div>
                </div>
                <div class="mt-8">
                    <h4 class="font-semibold text-white mb-4 text-xl flex items-center"><i data-lucide="users" class="mr-2"></i>HR 协同复核</h4>
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <textarea class="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" rows="3" placeholder="在此输入您的复核意见..."></textarea>
                        <div class="mt-3 flex justify-end space-x-3">
                            <button class="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500">暂存</button>
                            <button class="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">提交复核意见</button>
                        </div>
                    </div>
                </div>
                <div class="mt-8 text-center">
                    <button id="retry-interview-btn" class="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">再试一次</button>
                </div>
            </div>
        </div>
        `;
    }

    bindEvents() {
        // 文件上传
        const resumeUploadInput = document.getElementById('resume-upload');
        const resumeFilenameEl = document.getElementById('resume-filename');
        const uploadArea = resumeFilenameEl.closest('.border-dashed');
        const privacyCheckbox = document.getElementById('privacy-checkbox');
        const startBtn = document.getElementById('start-interview-btn');
        const finishBtn = document.getElementById('finish-interview-btn');
        const retryBtn = document.getElementById('retry-interview-btn');

        if (resumeUploadInput) {
            resumeUploadInput.addEventListener('change', (e) => {
                this.handleFileUpload(e.target.files[0]);
            });
        }
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('border-indigo-500', 'bg-indigo-50/10');
            });
            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('border-indigo-500', 'bg-indigo-50/10');
            });
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('border-indigo-500', 'bg-indigo-50/10');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileUpload(files[0]);
                }
            });
        }
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (privacyCheckbox.checked) {
                    this.proceedToInterview();
                } else {
                    document.getElementById('privacy-modal').classList.remove('hidden');
                }
            });
        }
        if (finishBtn) {
            finishBtn.addEventListener('click', () => this.finishInterview());
        }
        if (retryBtn) {
            retryBtn.addEventListener('click', () => navigationManager.showPage('interview'));
        }
    }

    handleFileUpload(file) {
        const resumeFilenameEl = document.getElementById('resume-filename');
        if (!file) return;

        if (this.isParsing) {
            this.showUploadError('正在处理上一个文件，请稍候...');
            return;
        }

        if (!this.ALLOWED_TYPES.includes(file.type)) {
            this.showUploadError('仅支持 PDF、DOC、DOCX 格式的文件');
            return;
        }
        if (file.size > this.MAX_FILE_SIZE) {
            this.showUploadError('文件大小不能超过 10MB');
            return;
        }
        this.uploadedFile = file;
        this.showUploadSuccess(file);
        this.parseResume(file);
    }

    async parseResume(file) {
        this.isParsing = true;
        const resumeFilenameEl = document.getElementById('resume-filename');
        
        const statusDiv = document.createElement('div');
        statusDiv.id = 'parsing-status';
        statusDiv.className = 'text-xs text-yellow-400 mt-1';
        statusDiv.textContent = '正在解析简历...';
        resumeFilenameEl.appendChild(statusDiv);

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await fetch('http://localhost:3000/api/upload-resume', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || '未知错误');
            }
            
            this.parsedResumeText = result.parsedText;
            console.log('简历解析成功:', this.parsedResumeText);

            statusDiv.textContent = '简历解析成功！';
            statusDiv.className = 'text-xs text-green-400 mt-1 font-bold';

        } catch (error) {
            console.error('简历解析失败:', error);
            statusDiv.textContent = `解析失败: ${error.message}`;
            statusDiv.className = 'text-xs text-red-400 mt-1 font-bold';
        } finally {
            this.isParsing = false;
        }
    }

    showUploadSuccess(file) {
        const resumeFilenameEl = document.getElementById('resume-filename');
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        resumeFilenameEl.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="text-green-400 font-medium">${file.name}</span>
                <button onclick="interviewManager.removeUploadedFile()" class="ml-2 text-red-400 hover:text-red-300">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>
            <div class="text-xs text-gray-500 mt-1">
                大小: ${fileSize}MB | 类型: ${this.getFileTypeText(file.type)}
            </div>
        `;
        resumeFilenameEl.classList.add('text-green-400');
        lucide.createIcons();
    }

    showUploadError(message) {
        const resumeFilenameEl = document.getElementById('resume-filename');
        resumeFilenameEl.innerHTML = `
            <div class="text-red-400 font-medium">${message}</div>
            <div class="text-xs text-gray-500 mt-1">请选择有效的文件重新上传</div>
        `;
        resumeFilenameEl.classList.remove('text-green-400');
        resumeFilenameEl.classList.add('text-red-400');
        setTimeout(() => {
            this.resetUploadArea();
        }, 3000);
    }

    removeUploadedFile() {
        this.uploadedFile = null;
        this.parsedResumeText = null;
        document.getElementById('resume-upload').value = '';
        this.resetUploadArea();
    }

    resetUploadArea() {
        const resumeFilenameEl = document.getElementById('resume-filename');
        resumeFilenameEl.textContent = '支持 DOC, DOCX, PDF 格式，最大 10MB';
        resumeFilenameEl.classList.remove('text-green-400', 'text-red-400');
    }

    getFileTypeText(mimeType) {
        const typeMap = {
            'application/pdf': 'PDF',
            'application/msword': 'DOC',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX'
        };
        return typeMap[mimeType] || '未知';
    }

    resetInterviewPage() {
        document.getElementById('interview-setup').style.display = 'flex';
        document.getElementById('interview-in-progress').style.display = 'none';
        document.getElementById('interview-results').style.display = 'none';
        clearInterval(this.interviewTimerInterval);
        clearInterval(this.dynamicThinkingInterval);
        document.getElementById('interview-timer').textContent = '10:00';
        document.getElementById('interview-timer').classList.remove('flashing-warning');
        document.getElementById('time-reminder').classList.add('hidden');
        document.getElementById('privacy-checkbox').checked = false;
        this.uploadedFile = null;
        this.parsedResumeText = null;
        document.getElementById('resume-upload').value = '';
        this.resetUploadArea();
    }

    async proceedToInterview() {
        // --- 新增：启动摄像头 ---
        try {
            await this.startCamera();
            console.log("摄像头和麦克风已成功启动");
        } catch (error) {
            console.error("无法启动媒体设备:", error);
            alert("无法访问您的摄像头和麦克风。请检查设备权限，然后重试。");
            return; // 如果无法启动摄像头，则中断流程
        }

        document.getElementById('interview-setup').style.display = 'none';
        document.getElementById('interview-in-progress').style.display = 'flex';
        const position = document.getElementById('position-select').value;
        document.getElementById('interview-title').textContent = position;
        let remainingSeconds = this.TOTAL_INTERVIEW_TIME;
        this.interviewTimerInterval = setInterval(() => {
            remainingSeconds--;
            if (remainingSeconds < 0) {
                this.finishInterview();
                return;
            }
            const mins = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
            const secs = String(remainingSeconds % 60).padStart(2, '0');
            document.getElementById('interview-timer').textContent = `${mins}:${secs}`;
            if (remainingSeconds <= 60) {
                document.getElementById('time-reminder').classList.remove('hidden');
                document.getElementById('interview-timer').classList.add('flashing-warning');
            }
        }, 1000);
        let questions;
        if (this.parsedResumeText) {
            questions = [
                "我看到您上传了简历，请结合简历中提到的项目，详细介绍一下您最有成就感的工作经历。",
                "从您的简历来看，您在某个技术领域有深入研究，能谈谈您是如何持续学习和提升的吗？",
                "您简历中的经历很丰富，请谈谈您认为自己最大的优势和需要改进的地方。",
                "结合您的背景，您觉得自己适合我们这个岗位的哪些方面？"
            ];
        } else {
            questions = [
                "请先做个自我介绍吧。",
                "谈谈您最近参与的一个项目或学习经历。",
                "您认为您最大的优点和缺点是什么？",
                "未来5年您的职业规划是什么？"
            ];
        }
        let q_idx = 0;
        document.getElementById('ai-question').textContent = questions[0];
        this.dynamicThinkingInterval = setInterval(() => {
            const thinkingEl = document.getElementById('dynamic-thinking');
            thinkingEl.style.opacity = '1';
            setTimeout(() => {
                q_idx = (q_idx + 1) % questions.length;
                document.getElementById('ai-question').textContent = questions[q_idx];
                thinkingEl.style.opacity = '0';
            }, 2000);
        }, 15000);
    }

    // --- 新增：启动摄像头和麦克风的函数 ---
    async startCamera() {
        const videoPreview = document.getElementById('user-video-preview');
        const videoIcon = videoPreview.nextElementSibling; // 获取图标

        if (!videoPreview) {
            console.error("未找到 video 元素");
            return;
        }

        try {
            // 请求访问音视频设备
            this.localStream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            // 将视频流设置到 video 元素的 srcObject 属性上
            videoPreview.srcObject = this.localStream;
            videoPreview.classList.remove('hidden'); // 显示 video 元素
            if(videoIcon) videoIcon.classList.add('hidden'); // 隐藏占位图标

        } catch (err) {
            console.error("getUserMedia 错误: ", err);
            // 向用户显示错误信息，例如弹窗提示
            alert(`无法访问摄像头和麦克风: ${err.name} - ${err.message}`);
            throw err; // 抛出错误以便调用者处理
        }
    }

    // --- 新增：停止媒体流的函数 ---
    stopCamera() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                track.stop(); // 停止每个轨道（视频和音频）
            });
            this.localStream = null;
            const videoPreview = document.getElementById('user-video-preview');
            const videoIcon = videoPreview.nextElementSibling; // 获取图标
            if(videoPreview) {
                videoPreview.srcObject = null;
                videoPreview.classList.add('hidden');
                if(videoIcon) videoIcon.classList.remove('hidden'); // 显示占位图标
            }
        }
    }

    finishInterview() {
        clearInterval(this.interviewTimerInterval);
        clearInterval(this.dynamicThinkingInterval);
        document.getElementById('interview-in-progress').style.display = 'none';
        document.getElementById('interview-results').style.display = 'block';
        this.renderResultRadarChart();
        this.stopCamera(); // 停止摄像头和麦克风
    }

    renderResultRadarChart() {
        const ctx = document.getElementById('resultRadarChart').getContext('2d');
        if (this.resultRadarChartInstance) this.resultRadarChartInstance.destroy();
        this.resultRadarChartInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: this.CORE_METRICS,
                datasets: [{
                    label: '本次面试得分',
                    data: [85, 80, 90, 88, 70, 75],
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 2,
                }]
            },
            options: {
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' },
                        pointLabels: { color: '#d1d5db', font: { size: 12 } },
                        ticks: { display: false, stepSize: 20 },
                        min: 0,
                        max: 100,
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
}

// 全局实例
const interviewManager = new InterviewManager();
