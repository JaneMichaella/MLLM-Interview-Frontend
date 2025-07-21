# 多模态智能面试评测系统 - 前端界面

## 项目简介

基于多模态大模型的智能面试评测系统前端界面，整合语音、视频、文本三维度分析，为企业和求职者提供科学的面试评估解决方案。

## 核心功能

### 用户注册/登录功能
- 用户名、密码、邮箱注册
- 使用localStorage保存登录状态
- 未登录用户无法访问面试、历史记录、个人中心

### 首页展示
- 系统介绍与品牌展示
- 四大特色：多场景覆盖、多模态分析、简历解析、数据合规

### 智能面试
- **面试准备**：15+技术岗位选择、简历上传与解析（支持拖拽、格式校验）、隐私授权
- **面试进行**：AI实时提问（可结合简历内容）、视频录制、10分钟计时、动态追问
- **结果分析**：综合评分、六维雷达图、多模态分析报告、HR复核

### 历史记录
- 面试记录管理
- 能力对比图表
- 成长趋势分析
- 视频回放（开发中）

### 个人中心
- 用户信息管理
- 密码修改

## 技术特点

- **响应式设计**：Tailwind CSS + 深色主题
- **数据可视化**：Chart.js 图表库（雷达图、柱状图、折线图）
- **现代UI**：Lucide Icons + 流畅动画效果
- **单页应用**：无刷新页面切换
- **音视频传输**：实时音视频流传输接口，支持WebSocket双通道数据传输

## 音视频接口实现

音视频传输接口已完全集成到前端系统中，供后端对接使用：

### 主要接口文件
- **核心类**：`js/interview.js` 中的 `InterviewManager` 类
- **音频处理器**：`static/audio-processor.js` (AudioWorklet处理器)

### 具体接口方法
1. **会话管理接口**
   - `createInterviewSession()` - 创建面试会话（POST `/interviews/start`）
   
2. **WebSocket连接接口**
   - `connectWebSockets()` - 建立双通道WebSocket连接
   - 音频通道：`/ws/audio/{session_id}`
   - 视频通道：`/ws/video/{session_id}`

3. **音频传输接口**
   - `startAudioStreaming()` - 启动实时音频流传输
   - 格式：16-bit PCM，采样率16kHz
   - 支持AudioWorklet + ScriptProcessor备用方案

4. **视频传输接口**
   - `startVideoStreaming()` - 启动视频帧传输
   - 格式：JPEG base64编码，5FPS
   - 包含时间戳标记

5. **流控制接口**
   - `stopStreamingToBackend()` - 停止所有音视频传输

### 后端连接配置
- **API地址**：`http://localhost:8000`
- **WebSocket地址**：`ws://localhost:8000`

## 简历解析服务

本项目包含一个独立的 Node.js 后端服务，专门用于处理和解析用户上传的简历文件（PDF, DOCX），提取其纯文本内容以供 AI 进行后续分析。

## 多模态分析维度

- **文本分析**：回答结构、逻辑性、STAR原则
- **语音分析**：语速、情感、自信度
- **视频分析**：眼神交流、表情、行为模式

## 快速部署

### 环境要求
- 现代浏览器（Chrome、Firefox、Safari、Edge）
- Node.js v16+ 和 npm

### 部署步骤

#### 启动前端
1. 下载项目文件
2. 用浏览器直接打开 `index.html`
3. 开始使用系统

> **注意**: 前端页面通过 `file://` 协议打开即可，无需 Web 服务器。

#### 启动后端简历解析服务
为了使简历解析功能正常工作，您需要启动附带的后端服务。

1. **进入后端目录**:
   ```bash
   cd backend
   ```
2. **安装依赖**:
   ```bash
   npm install
   ```
3. **启动服务**:
   ```bash
   npm start
   ```
> 服务启动后，您会在终端看到 `简历解析服务正在监听 http://localhost:3000`。请保持此终端窗口在后台运行。

```bash
# 方式一：直接双击文件
index.html

# 方式二：命令行启动
start index.html    # Windows
open index.html     # macOS
xdg-open index.html # Linux
```

## 项目结构

```
MLLM-Interview-Frontend/
├── backend/             # 简历解析后端服务
│   ├── node_modules/    # (自动生成)
│   ├── package.json     # 后端依赖与脚本
│   └── server.js        # Express 服务器与解析逻辑
├── js/                  # 前端功能模块目录
│   ├── auth.js          # 用户认证（登录/注册/登出/资料）
│   ├── navigation.js    # 页面导航与内容切换
│   ├── interview.js     # 面试流程与音视频传输接口
│   ├── history.js       # 历史记录页逻辑
│   ├── profile.js       # 个人中心页逻辑
│   └── main.js          # 入口初始化、全局事件
├── static/              # 静态资源
│   └── audio-processor.js # 音频处理器(AudioWorklet)
├── index.html           # 主入口页面（骨架，动态加载内容）
├── styles.css           # 自定义样式
├── AUDIO_VIDEO_INTEGRATION.md # 音视频接口技术文档
└── README.md            # 项目说明文档
```

## 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 开发说明

当前版本为演示原型，包含：
- 完整的UI界面和交互逻辑
- 模拟数据展示
- 前端状态管理

生产环境需要：
- 后端API接口
- 视频/音频处理服务
- 多模态AI分析引擎
- 数据库存储

## 许可证

© 2025 多模态智能面试评测系统. All rights reserved.