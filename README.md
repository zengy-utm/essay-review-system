# 英澳硕士作业评审系统 - 完整开发指南

## 📋 项目概述

这是一个针对英澳硕士学生的AI驱动作业评审系统，支持上传作业和要求文件，通过Gemini API进行智能评审，输出专业级评审报告。

## 🏗️ 项目结构

```
cloud code/
├── my-website/              # 前端项目 (React + TypeScript + Vite)
│   ├── src/
│   │   ├── pages/          # 页面组件
│   │   ├── components/     # 可复用组件
│   │   ├── styles/         # CSS样式
│   │   ├── utils/          # 工具函数
│   │   ├── types/          # TypeScript类型定义
│   │   └── App.tsx         # 主应用
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/                 # 后端服务 (Node.js + Gemini)
│   ├── server.js           # 主服务器文件
│   ├── package.json
│   ├── .env.example        # 环境配置示例
│   └── .env                # 环境配置（需要手动创建）
└── README.md(本文件)
```

## 🚀 快速开始

### 前置要求

- Node.js 14+ 和 npm
- Gemini API Key (从 https://makersuite.google.com/app/apikey 获取)
- 现代网络浏览器 (Chrome, Edge, Safari等)

### 第一步：安装依赖

#### 前端项目
```bash
cd "cloud code"/my-website
npm install
```

#### 后端项目
```bash
cd "cloud code"/backend
npm install
```

### 第二步：配置环境变量

#### 后端配置
复制 `.env.example` 为 `.env`：

```bash
cd "cloud code"/backend
cp .env.example .env
```

编辑 `.env` 文件，填入你的Gemini API Key：

```env
GEMINI_API_KEY=your_actual_api_key_here
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**如何获取Gemini API Key:**
1. 访问 https://makersuite.google.com/app/apikey
2. 登录Google账号
3. 创建新的API Key
4. 复制密钥到 `.env` 文件

### 第三步：启动服务

#### 启动后端 (新的终端窗口)
```bash
cd "cloud code"/backend
npm start
# 或开发模式（自动重启）
npm run dev
```
你应该看到：
```
🚀 Essay Review Backend Server is running on port 3001
```

#### 启动前端 (另一个终端窗口)
```bash
cd "cloud code"/my-website
npm run dev
```
你应该看到：
```
  VITE v4.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### 第四步：访问应用

打开浏览器访问：**http://localhost:5173**

## 💡 使用指南

### 基础流程

1. **选择学位等级和专业**
   - 学位：预科/本科/硕士/博士
   - 专业：商科/教育/传媒/计算机

2. **上传作业文件**
   - 支持格式：.txt, .doc, .docx, .pdf, .ppt, .pptx, .mp4, .mov, .avi, .mp3, .wav
   - 文件大小限制：普通文件 ≤ 20MB，视频/音频 ≤ 50MB

3. **上传或选择要求文件**
   - 上传新要求：支持 .txt, .doc, .docx, .pdf, .ppt, .pptx
   - 或从历史要求库快速选择

4. **启动评审**
   - 点击"启动评审"按钮
   - 实时查看评审进度（进度条显示）
   - 等待AI生成评审报告（通常30-60秒）

5. **查看报告**
   - 在线浏览完整评审报告
   - 查看评分、评级、问题清单、改进建议
   - 下载为TXT格式保存

### 历史要求库

**创建历史要求：**
- 首次上传要求文件时，可自定义命名（如"商科Essay-特斯拉财务分析"）
- 自动保存到历史要求库

**快速选择：**
- 后续评审时，直接从"历史要求库"选择
- 无需重复上传，评审速度提升50%以上

**管理：**
- 访问"要求库"页面，可重命名、删除、搜索历史要求

### 历史记录

- 访问"评审历史"页面查看所有过往评审
- 查看评分、评级、专业、日期等信息
- 点击查看详情重新浏览评审报告

## 🔧 API文档

### 后端API端点

#### 1. 健康检查
```http
GET /health
```

**响应示例：**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

#### 2. 提交评审
```http
POST /api/review
Content-Type: application/json
```

**请求体：**
```json
{
  "essay": "作业内容文本",
  "essayFileName": "论文.docx",
  "requirements": "要求内容文本",
  "requirementsFileName": "作业要求.docx",
  "educationLevel": "master",
  "major": "business",
  "historyRequirementId": "可选的历史要求ID"
}
```

**响应示例：**
```json
{
  "id": "unique-id",
  "essayName": "论文.docx",
  "requirementsName": "作业要求.docx",
  "educationLevel": "master",
  "major": "business",
  "totalScore": 85,
  "grade": "good",
  "reviewDuration": 30000,
  "reviewedAt": "2026-03-27T10:30:00.000Z",
  "breakdown": {
    "personalityMatchScore": 50,
    "personalityMatchDetails": [...],
    "universalStandardScore": 35,
    "universalStandardDetails": [...],
    "basicComplianceDetails": [...]
  },
  "suggestions": [...]
}
```

## 📊 评分标准

### 总分：100分

- **个性要求匹配度：60分**
  - 基于作业要求文件进行评审
  - 满足/部分满足/未满足三个等级

- **通用标准：40分**
  组成：
  - 学术格式评审（15%）：Harvard/APA引用格式、DOI标注
  - 作业禁忌评审（15%）：抄袭检查、口语化、语法错误、逻辑混乱
  - 专业内容通用评审（10%）：专业术语、知识点覆盖

### 评级标准

| 分数 | 评级 | 描述 |
|------|------|------|
| 90+ | 优秀 | 符合或超过所有要求 |
| 80-89 | 良好 | 大部分要求符合，个别改进 |
| 60-79 | 合格 | 基本符合要求，需要多处改进 |
| <60 | 不合格 | 未符合关键要求 |

## 🔐 隐私与安全

- ✓ 所有用户数据默认存储在浏览器本地（localStorage）
- ✓ 文件仅在评审时发送到服务器，评审完成可删除
- ✓ 历史记录、历史要求库均存储在本地
- ✓ 无需注册登录，完全匿名使用
- ✓ 支持浏览器隐私模式

## 📝 环境变量详解

```env
# Gemini API Key - 必需！从 https://makersuite.google.com/app/apikey 获取
GEMINI_API_KEY=your_key_here

# 服务器端口
PORT=3001

# 运行环境 (development/production)
NODE_ENV=development

# CORS配置 - 前端URL
CORS_ORIGIN=http://localhost:5173
```

## 🐛 常见问题

### Q1: 后端报错 "GEMINI_API_KEY not set"
**A:** 确保在 `backend/.env` 文件中填入了有效的Gemini API Key。检查：
1. 文件存在且名称为 `.env`
2. `GEMINI_API_KEY` 不为空
3. API Key 有效（从 makersuite.google.com 获取最新的）

### Q2: 前端无法连接到后端
**A:** 检查：
1. 后端服务是否运行在 `http://localhost:3001`
2. Chrome DevTools Network标签中查看CORS错误
3. 确保 `CORS_ORIGIN` 环境变量设置正确

### Q3: 评审超时
**A:** 可能原因：
1. Gemini API响应缓慢
2. 作业文件过大
3. 网络连接不稳定

解决：缩小文件大小，检查网络，重试评审

### Q4: 历史记录丢失
**A:** localStorage的数据绑定到浏览器，改浏览器/清除缓存会丢失。解决方案：
1. 使用私密模式前导出重要数据
2. 定期下载评审报告

## 🚀 部署指南

### 部署前端到Vercel

1. 推送代码到GitHub
2. 在 Vercel 连接你的 GitHub 仓库
3. 设置环境变量：`REACT_APP_API_URL=https://your-backend-url`
4. 部署完成

### 部署后端

#### 使用Vercel (推荐)
```bash
npm install -g vercel
cd backend
vercel
```

#### 使用Railway
1. 连接GitHub仓库
2. 添加环境变量
3. 自动部署

#### 使用自己的服务器
```bash
# 在服务器上
git clone <repo>
cd backend
npm install
npm start
```

## 📞 技术支持

如遇问题，请：
1. 查看本文档的"常见问题"部分
2. 检查浏览器的 DevTools (F12) 控制台和Network标签
3. 查看backend服务器的日志输出
4. 通过应用内的"反馈"功能提交问题报告

## 📦 依赖项

### 前端
- React 17.x - UI库
- React Router 5.x - 路由管理
- TypeScript 4.x - 类型系统
- Vite 2.x - 构建工具
- Axios - HTTP客户端

### 后端
- Express.js - Web框架
- CORS - 跨域资源共享
- @google/generative-ai - Gemini API SDK
- dotenv - 环境变量管理
- Nodemon - 开发热重载

## 🎓 学位等级和专业

### 支持的学位等级
- 预科 (Foundation)
- 本科 (Undergraduate)
- 硕士 (Master) - 默认推荐
- 博士 (PhD)

### 支持的专业
- 商科 (Business) - 会计、金融、管理
- 教育 (Education) - TESOL、教育管理
- 传媒 (Media) - 数字传媒、传播学
- 计算机 (Computer) - 新增专业

## 📄 许可证

ISC License

---

**版本：** 1.0.0  
**最后更新：** 2026年3月27日  
**维护者：** AI助手
