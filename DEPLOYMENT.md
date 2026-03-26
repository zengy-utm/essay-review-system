# 英澳硕士评审系统 - 部署指南

## 🚀 部署前清单

在部署到生产环境前，请确保：

- [ ] 所有代码已提交到Git
- [ ] .env文件已创建且配置正确
- [ ] 本地测试全部通过（见 TESTING.md）
- [ ] 已购买域名（可选）
- [ ] 已准备好Gemini API Key

## 📋 部署方案对比

| 方案 | 前端 | 后端 | 成本 | 难度 | 推荐度 |
|------|------|------|------|------|--------|
| **Vercel + Railway** | ✓ | ✓ | 免费/低 | 简单 | ⭐⭐⭐⭐⭐ |
| **Netlify + Heroku** | ✓ | ✓ | 免费/低 | 简单 | ⭐⭐⭐⭐ |
| **自建服务器** | ✓ | ✓ | 中 | 复杂 | ⭐⭐⭐ |
| **AWS/阿里云** | ✓ | ✓ | 中/高 | 很复杂 | ⭐⭐⭐ |

## ✅ 方案1: Vercel + Railway (推荐)

### 前提条件
- GitHub账号
- Vercel账号（免费注册）
- Railway账号（免费注册）

### 第一步：准备代码库

将代码推送到GitHub：

```bash
cd /Users/yea/Desktop/"cloud code"
git init
git add .
git commit -m "Initial commit: Essay review system"
git remote add origin https://github.com/yourusername/essay-review.git
git branch -M main
git push -u origin main
```

### 第二步：部署前端到Vercel

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 使用GitHub账号登录

2. **导入项目**
   - 点击 "New Project"
   - 选择你的 essay-review 仓库
   - 选择 "my-website" 文件夹

3. **配置环境变量**
   - 在 "Environment Variables" 中添加：
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```

4. **部署**
   - 点击 "Deploy"
   - 等待部署完成（约2-3分钟）

获得的前端URL: `https://your-app-name.vercel.app`

### 第三步：部署后端到Railway

1. **访问 Railway**
   - 打开 https://railway.app
   - 使用GitHub或其他方式登录

2. **创建项目**
   - 点击 "Create a new project"
   - 选择 "Deploy from GitHub"
   - 选择你的仓库

3. **配置环境变量**
   在Railway项目设置中，添加：
   ```
   GEMINI_API_KEY=your_actual_api_key
   PORT=3000
   NODE_ENV=production
   CORS_ORIGIN=https://your-app-name.vercel.app
   ```

4. **指定启动文件**
   - 设置 "Root Directory": `backend`
   - 设置 "Start Command": `npm start`

5. **部署**
   - Railway自动部署
   - 等待完成

获得的后端URL: `https://xxxx.railway.app`

### 第四步：更新前端配置

回到Vercel项目，更新环境变量：
```
REACT_APP_API_URL=https://xxxx.railway.app
```

重新部署前端。

## ✅ 方案2: Netlify + Heroku

### 前端部署到Netlify

```bash
# 构建前端
cd my-website
npm run build

# 推送到Netlify（选项1: CLI）
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

或在Netlify.com：
1. 连接GitHub仓库
2. 设置Build命令: `npm run build`
3. 设置发布目录: `dist`
4. 部署

### 后端部署到Heroku

```bash
# 安装Heroku CLI
brew install heroku/brew/heroku

# 登录
heroku login

# 创建应用
cd backend
heroku create your-app-name

# 配置环境变量
heroku config:set GEMINI_API_KEY=your_key
heroku config:set CORS_ORIGIN=https://your-netlify-app.netlify.app

# 推送部署
git push heroku main

# 查看日志
heroku logs --tail
```

## ✅ 方案3: 自建服务器（Linux VPS）

### 前端部署

```bash
# 构建
cd my-website
npm run build

# 使用nginx服务
sudo apt-get install nginx
sudo cp -r dist/* /var/www/html/
sudo systemctl restart nginx
```

### 后端部署

```bash
# SSH连接到服务器
ssh root@your-server-ip

# 克隆项目
git clone https://github.com/yourusername/essay-review.git
cd essay-review/backend

# 安装依赖
npm install

# 配置环境变量
nano .env

# 使用PM2管理进程
npm install -g pm2
pm2 start server.js --name "essay-review"
pm2 startup
pm2 save

# 配置Nginx反向代理
sudo nano /etc/nginx/sites-available/default

# 添加以下配置：
# upstream backend {
#   server localhost:3001;
# }
# server {
#   server_name api.yourdomain.com;
#   location / {
#     proxy_pass http://backend;
#   }
# }

sudo systemctl restart nginx
```

## 🔐 生产环境安全设置

### 1. 环境变量安全

✓ **不要在代码中硬编码密钥**
```javascript
// ❌ 错误
const API_KEY = "sk-abc123xyz"

// ✓ 正确
const API_KEY = process.env.GEMINI_API_KEY
```

### 2. CORS配置

```javascript
// 只允许生产域名
const corsOptions = {
  origin: [
    'https://your-app-name.vercel.app',
    'https://custom-domain.com'
  ],
  credentials: true
}
```

### 3. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制100个请求
});

app.post('/api/review', limiter, (req, res) => {
  // ...
});
```

### 4. HTTPS

所有部署平台都默认使用HTTPS。

## 📊 监控和维护

### 1. 错误监控 (Sentry)

```bash
# 安装Sentry
npm install @sentry/node

# 初始化
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "your-sentry-dsn" });
```

### 2. 日志

```javascript
// 后端日志配置
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 3. 性能监控

使用Google Analytics或Mixpanel跟踪用户行为：

```javascript
// 前端
import { gtag } from '@react-ga/core';

gtag.pageview({
  page_path: '/review'
});
```

## 🔄 持续部署 (CI/CD)

### GitHub Actions 自动化部署

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node
      uses: actions/setup-node@v2
      with:
        node-version: 16
    
    - name: Install and build frontend
      run: |
        cd my-website
        npm install
        npm run build
    
    - name: Deploy to Vercel
      run: npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
    
    - name: Deploy backend
      if: success()
      run: |
        cd backend
        npm install
        git push heroku main
```

## 🌍 自定义域名

### 使用Vercel + Railway

1. **购买域名** (Namecheap, Google Domains等)

2. **Vercel配置**
   - 项目设置 > Domains
   - 添加自定义域名
   - 按提示配置DNS

3. **Railway配置**
   - 项目设置
   - 添加自定义域名或使用Railway生成的URL

4. **使用CNAME或A记录指向**

## ⚠️ 常见部署问题

### 问题1: API连接失败

```
错误: Failed to fetch from API
```

**解决：**
- 检查 REACT_APP_API_URL 是否设置正确
- 检查CORS配置中是否包含前端域名
- 验证后端服务是否运行

### 问题2: Gemini API在生产环境失败

```
错误: API Key invalid
```

**解决：**
- 确保API Key传递给后端环境变量
- 检查API Key是否过期
- 验证API Key有正确的权限

### 问题3: 静态资源404错误

```
404 Not Found: /styles/Header.css
```

**解决：**
- 确保构建过程包含所有资源
- 检查Vite配置中的publicDir设置
- 清除CDN缓存

### 问题4: 冷启动超时

```
504 Gateway Timeout
```

**解决：**
- 使用高性能计划（Railway Starter Plan或以上）
- 优化Gemini API提示词长度
- 考虑使用缓存

## 📈 性能优化

### 前端优化

```javascript
// 代码分割
const Report = React.lazy(() => import('./pages/Report'));

// 图片优化
import { Image } from '@components';

// 缓存优化
const cacheKey = `essay_${id}_v1`;
```

### 后端优化

```javascript
// 响应缓存
app.use(compression());

// 数据库连接池
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000
});

// 评审结果缓存（可选）
const cache = new Map();
```

## 🎉 部署完成后

1. **测试生产环境**
   - 访问前端URL
   - 测试完整工作流
   - 检查所有功能

2. **配置自定义域名** (如需要)

3. **设置备份和回滚计划**

4. **监控系统状态**
   - 设置告警
   - 定期检查日志
   - 监控API配额使用

5. **宣传和分享**
   - 创建使用教程视频
   - 收集用户反馈
   - 持续改进

## 📚 其他资源

- Vercel文档: https://vercel.com/docs
- Railway文档: https://docs.railway.app
- Netlify文档: https://docs.netlify.com
- Heroku文档: https://devcenter.heroku.com/articles/git

---

**版本**: 1.0  
**最后更新**: 2026年3月27日
