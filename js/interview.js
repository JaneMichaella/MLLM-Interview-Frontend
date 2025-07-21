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
        this.isMicEnabled = true; // 麦克风状态
        this.isCameraEnabled = true; // 摄像头状态
        
        // --- 新增：音视频传输相关属性 ---
        this.sessionId = null; // 面试会话ID
        this.audioSocket = null; // 音频WebSocket连接
        this.videoSocket = null; // 视频WebSocket连接
        this.audioContext = null; // 音频上下文
        this.audioWorkletNode = null; // 音频处理节点
        this.audioSource = null; // 音频源
        this.videoFrameInterval = null; // 视频帧发送定时器
        this.isStreamingToBackend = false; // 是否正在向后端传输数据
        
        // 后端配置
        this.API_BASE_URL = "http://localhost:8000";
        this.WS_BASE_URL = "ws://localhost:8000";
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
                        <button id="toggle-mic-btn" class="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
                            <i data-lucide="mic" class="text-white w-5 h-5"></i>
                        </button>
                        <button id="toggle-camera-btn" class="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
                            <i data-lucide="video" class="text-white w-5 h-5"></i>
                        </button>
                    </div>
                </div>
                <div class="bg-gray-900 rounded-xl p-4 text-center">
                    <h3 class="text-lg font-semibold text-white">面试计时</h3>
                    <p id="interview-timer" class="text-3xl font-mono text-indigo-400 mt-2">10:00</p>
                    <p id="time-reminder" class="text-sm text-yellow-400 font-bold hidden mt-1">剩余时间不足1分钟</p>
                </div>
                <div class="bg-gray-900 rounded-xl p-4">
                    <h3 class="text-lg font-semibold text-white mb-2 text-center">传输状态</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex items-center justify-between">
                            <span class="text-gray-300">会话ID:</span>
                            <span id="session-id-display" class="text-gray-400 font-mono text-xs">未连接</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-300">音频传输:</span>
                            <span id="audio-status" class="text-red-400">●</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-300">视频传输:</span>
                            <span id="video-status" class="text-red-400">●</span>
                        </div>
                    </div>
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
        const toggleMicBtn = document.getElementById('toggle-mic-btn');
        const toggleCameraBtn = document.getElementById('toggle-camera-btn');

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
        if (toggleMicBtn) {
            toggleMicBtn.addEventListener('click', () => this.toggleMicrophone());
        }
        if (toggleCameraBtn) {
            toggleCameraBtn.addEventListener('click', () => this.toggleCamera());
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
        this.isMicEnabled = true;
        this.isCameraEnabled = true;
        document.getElementById('resume-upload').value = '';
        this.resetUploadArea();
        
        // --- 新增：清理音视频传输相关状态 ---
        this.stopStreamingToBackend();
        this.sessionId = null;
        
        // 确保完全停止摄像头
        this.stopCamera();
    }

    async proceedToInterview() {
        // 先切换到面试界面，确保按钮元素存在
        document.getElementById('interview-setup').style.display = 'none';
        document.getElementById('interview-in-progress').style.display = 'flex';
        
        // --- 新增：创建后端面试会话 ---
        try {
            await this.createInterviewSession();
            console.log("后端面试会话创建成功:", this.sessionId);
        } catch (error) {
            console.error("创建后端面试会话失败:", error);
            alert("无法连接到后端服务器，请检查后端服务是否启动。");
            // 如果创建会话失败，返回到设置页面
            document.getElementById('interview-setup').style.display = 'flex';
            document.getElementById('interview-in-progress').style.display = 'none';
            return;
        }
        
        // --- 启动摄像头 ---
        try {
            await this.startCamera();
            console.log("摄像头和麦克风已成功启动");
        } catch (error) {
            console.error("无法启动媒体设备:", error);
            alert("无法访问您的摄像头和麦克风。请检查设备权限，然后重试。");
            // 如果启动失败，返回到设置页面
            document.getElementById('interview-setup').style.display = 'flex';
            document.getElementById('interview-in-progress').style.display = 'none';
            return;
        }
        
        // --- 新增：连接音视频传输 ---
        try {
            this.connectWebSockets();
            await this.startStreamingToBackend();
            console.log("音视频传输已开始");
        } catch (error) {
            console.error("启动音视频传输失败:", error);
            // 传输失败不中断面试，但记录错误
            alert("音视频传输启动失败，面试将继续进行，但可能无法进行AI分析。");
        }
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

            // 更新按钮状态
            this.updateMediaButtons();

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
            // 停止所有轨道
            this.localStream.getTracks().forEach(track => {
                track.stop();
                console.log(`Stopped ${track.kind} track`);
            });
            this.localStream = null;
            
            const videoPreview = document.getElementById('user-video-preview');
            const videoIcon = videoPreview?.nextElementSibling;
            
            if(videoPreview) {
                videoPreview.srcObject = null;
                videoPreview.classList.add('hidden');
                if(videoIcon) videoIcon.classList.remove('hidden');
            }
            
            // 重置状态
            this.isMicEnabled = true;
            this.isCameraEnabled = true;
            this.updateMediaButtons();
            
            console.log("所有媒体轨道已停止，资源已释放");
        }
    }

    // --- 新增：切换麦克风状态 ---
    toggleMicrophone() {
        if (!this.localStream) return;
        
        const audioTrack = this.localStream.getAudioTracks()[0];
        if (audioTrack) {
            this.isMicEnabled = !this.isMicEnabled;
            audioTrack.enabled = this.isMicEnabled;
            this.updateMediaButtons();
            console.log(`麦克风 ${this.isMicEnabled ? '开启' : '关闭'}`);
        }
    }

    // --- 新增：切换摄像头状态 ---
    toggleCamera() {
        if (!this.localStream) return;
        
        const videoTrack = this.localStream.getVideoTracks()[0];
        const videoPreview = document.getElementById('user-video-preview');
        const videoIcon = videoPreview?.nextElementSibling;
        
        if (videoTrack) {
            this.isCameraEnabled = !this.isCameraEnabled;
            videoTrack.enabled = this.isCameraEnabled;
            
            // 更新视频显示
            if (this.isCameraEnabled) {
                videoPreview?.classList.remove('hidden');
                videoIcon?.classList.add('hidden');
            } else {
                videoPreview?.classList.add('hidden');
                videoIcon?.classList.remove('hidden');
            }
            
            this.updateMediaButtons();
            console.log(`摄像头 ${this.isCameraEnabled ? '开启' : '关闭'}`);
        }
    }

    // --- 修改：更新媒体控制按钮状态 新增使用/未使用摄像头和麦克风的图标状态切换---
    updateMediaButtons() {
        const toggleMicBtn = document.getElementById('toggle-mic-btn');
        const toggleCameraBtn = document.getElementById('toggle-camera-btn');
    
        if (toggleMicBtn) {
            const micIcon = toggleMicBtn.querySelector('i');
            micIcon?.setAttribute('data-lucide', this.isMicEnabled ? 'mic' : 'mic-off');
            toggleMicBtn.classList.toggle('bg-red-600', !this.isMicEnabled);
            toggleMicBtn.classList.toggle('bg-gray-700', this.isMicEnabled);
        }
    
        if (toggleCameraBtn) {
            const camIcon = toggleCameraBtn.querySelector('i');
            camIcon?.setAttribute('data-lucide', this.isCameraEnabled ? 'video' : 'video-off');
            toggleCameraBtn.classList.toggle('bg-red-600', !this.isCameraEnabled);
            toggleCameraBtn.classList.toggle('bg-gray-700', this.isCameraEnabled);
        }
    
        // 重新渲染图标
        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
    }
    
    // --- 新增：创建后端面试会话 ---
    async createInterviewSession() {
        const position = document.getElementById('position-select').value;
        const requestBody = {
            user_id: `user_${Date.now()}`, // 生成临时用户ID
            metadata: {
                position: position,
                hasResume: !!this.parsedResumeText,
                timestamp: new Date().toISOString()
            }
        };

        try {
            const response = await fetch(`${this.API_BASE_URL}/interviews/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`服务器错误: ${response.status}`);
            }

            const data = await response.json();
            this.sessionId = data.session_id;
            console.log("面试会话创建成功:", this.sessionId);
        } catch (error) {
            console.error("创建面试会话失败:", error);
            throw error;
        }
    }

    // --- 新增：连接WebSocket ---
    connectWebSockets() {
        if (!this.sessionId) {
            console.error("无法连接WebSocket，缺少会话ID");
            return;
        }

        // 更新会话ID显示
        const sessionIdDisplay = document.getElementById('session-id-display');
        if (sessionIdDisplay) {
            sessionIdDisplay.textContent = this.sessionId.substring(0, 8) + '...';
        }

        // 连接音频WebSocket
        const audioUrl = `${this.WS_BASE_URL}/ws/audio/${this.sessionId}`;
        this.audioSocket = new WebSocket(audioUrl);
        
        this.audioSocket.onopen = () => {
            console.log("音频WebSocket已连接");
            this.updateConnectionStatus('audio', true);
        };
        
        this.audioSocket.onclose = () => {
            console.log("音频WebSocket已断开");
            this.updateConnectionStatus('audio', false);
        };
        
        this.audioSocket.onerror = (error) => {
            console.error("音频WebSocket错误:", error);
            this.updateConnectionStatus('audio', false);
        };
        
        this.audioSocket.onmessage = (event) => {
            console.log("收到音频服务器消息:", event.data);
        };

        // 连接视频WebSocket
        const videoUrl = `${this.WS_BASE_URL}/ws/video/${this.sessionId}`;
        this.videoSocket = new WebSocket(videoUrl);
        
        this.videoSocket.onopen = () => {
            console.log("视频WebSocket已连接");
            this.updateConnectionStatus('video', true);
        };
        
        this.videoSocket.onclose = () => {
            console.log("视频WebSocket已断开");
            this.updateConnectionStatus('video', false);
        };
        
        this.videoSocket.onerror = (error) => {
            console.error("视频WebSocket错误:", error);
            this.updateConnectionStatus('video', false);
        };
        
        this.videoSocket.onmessage = (event) => {
            console.log("收到视频服务器消息:", event.data);
        };
    }

    // --- 新增：更新连接状态显示 ---
    updateConnectionStatus(type, isConnected) {
        const statusElement = document.getElementById(`${type}-status`);
        if (statusElement) {
            statusElement.textContent = '●';
            statusElement.className = isConnected ? 'text-green-400' : 'text-red-400';
        }
    }

    // --- 新增：开始音视频传输 ---
    async startStreamingToBackend() {
        if (!this.localStream) {
            throw new Error("本地媒体流未初始化");
        }

        try {
            // 启动音频传输
            await this.startAudioStreaming();
            
            // 启动视频传输
            this.startVideoStreaming();
            
            this.isStreamingToBackend = true;
            console.log("音视频传输已启动");
        } catch (error) {
            console.error("启动音视频传输失败:", error);
            throw error;
        }
    }

    // --- 新增：音频传输处理 ---
    async startAudioStreaming() {
        if (!this.localStream || !this.audioSocket || this.audioSocket.readyState !== WebSocket.OPEN) {
            throw new Error("无法启动音频传输：缺少媒体流或WebSocket未连接");
        }

        try {
            // 创建音频上下文
            this.audioContext = new AudioContext({ sampleRate: 16000 });

            // 加载音频处理器
            try {
                await this.audioContext.audioWorklet.addModule('./static/audio-processor.js');
                
                // 创建音频源和工作站节点
                this.audioSource = this.audioContext.createMediaStreamSource(this.localStream);
                this.audioWorkletNode = new AudioWorkletNode(this.audioContext, 'audio-recorder-processor');

                // 处理音频数据并发送
                this.audioWorkletNode.port.onmessage = (event) => {
                    if (this.audioSocket && 
                        this.audioSocket.readyState === WebSocket.OPEN && 
                        this.isMicEnabled) {
                        this.audioSocket.send(event.data);
                    }
                };

                // 连接音频处理链
                this.audioSource.connect(this.audioWorkletNode);
                this.audioWorkletNode.connect(this.audioContext.destination);
                
            } catch (workletError) {
                console.warn("AudioWorklet加载失败，使用备用方案:", workletError);
                
                // 备用方案：使用ScriptProcessorNode
                this.audioSource = this.audioContext.createMediaStreamSource(this.localStream);
                const processor = this.audioContext.createScriptProcessor(4096, 1, 1);
                
                processor.onaudioprocess = (event) => {
                    if (this.audioSocket && 
                        this.audioSocket.readyState === WebSocket.OPEN && 
                        this.isMicEnabled) {
                        const inputData = event.inputBuffer.getChannelData(0);
                        
                        // 将Float32Array转换为Int16Array（16位PCM）
                        const int16Data = new Int16Array(inputData.length);
                        for (let i = 0; i < inputData.length; i++) {
                            int16Data[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
                        }
                        
                        // 发送音频数据
                        this.audioSocket.send(int16Data.buffer);
                    }
                };

                // 连接音频处理链
                this.audioSource.connect(processor);
                processor.connect(this.audioContext.destination);
            }
            
            console.log("音频传输已启动");
        } catch (error) {
            console.error("启动音频传输失败:", error);
            throw error;
        }
    }

    // --- 新增：视频传输处理 ---
    startVideoStreaming() {
        const videoPreview = document.getElementById('user-video-preview');
        if (!videoPreview || !this.videoSocket) {
            throw new Error("无法启动视频传输：缺少视频元素或WebSocket未连接");
        }

        // 创建画布用于截取视频帧
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        // 定时发送视频帧
        this.videoFrameInterval = setInterval(() => {
            if (this.videoSocket && 
                this.videoSocket.readyState === WebSocket.OPEN && 
                this.isCameraEnabled &&
                videoPreview.videoWidth > 0) {
                
                try {
                    // 设置画布尺寸
                    canvas.width = videoPreview.videoWidth;
                    canvas.height = videoPreview.videoHeight;
                    
                    // 在画布上绘制当前视频帧
                    context.drawImage(videoPreview, 0, 0, canvas.width, canvas.height);
                    
                    // 转换为JPEG格式的base64数据
                    const frameData = canvas.toDataURL('image/jpeg', 0.7);
                    
                    // 添加时间戳并发送
                    const message = `${Date.now()}:${frameData}`;
                    this.videoSocket.send(message);
                } catch (error) {
                    console.error("发送视频帧失败:", error);
                }
            }
        }, 200); // 每200ms发送一帧，即5FPS

        console.log("视频传输已启动");
    }

    // --- 新增：停止音视频传输 ---
    stopStreamingToBackend() {
        // 停止视频传输
        if (this.videoFrameInterval) {
            clearInterval(this.videoFrameInterval);
            this.videoFrameInterval = null;
        }

        // 停止音频传输
        if (this.audioContext) {
            this.audioContext.close().then(() => {
                console.log("音频上下文已关闭");
            }).catch(error => {
                console.error("关闭音频上下文失败:", error);
            });
            this.audioContext = null;
        }

        // 关闭WebSocket连接
        if (this.audioSocket) {
            this.audioSocket.close();
            this.audioSocket = null;
        }

        if (this.videoSocket) {
            this.videoSocket.close();
            this.videoSocket = null;
        }

        this.isStreamingToBackend = false;
        console.log("音视频传输已停止");
    }
    
    finishInterview() {
        clearInterval(this.interviewTimerInterval);
        clearInterval(this.dynamicThinkingInterval);
        
        // --- 新增：停止音视频传输 ---
        this.stopStreamingToBackend();
        
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
