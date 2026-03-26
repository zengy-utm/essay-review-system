#!/bin/bash

# Essay Review System - Quick Start Script for macOS

echo "🚀 英澳硕士作业评审系统 - 快速启动"
echo "==================================\n"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 14+"
    exit 1
fi

echo "✓ Node.js 已安装: $(node -v)"
echo "✓ npm 已安装: $(npm -v)\n"

# 检查后端配置
echo "📝 检查后端配置..."
if [ ! -f "./backend/.env" ]; then
    echo "⚠️  后端 .env 文件不存在"
    echo "即将创建 .env 文件，请按提示输入 Gemini API Key"
    
    cp ./backend/.env.example ./backend/.env
    
    # 引导用户编辑.env
    echo "\n📌 需要手动编辑 ./backend/.env 文件："
    echo "   1. 打开文件: ./backend/.env"
    echo "   2. 填入你的 Gemini API Key"
    echo "   3. 保存文件\n"
    echo "按回车键继续..."
    read
fi

# 安装依赖
echo "📦 安装依赖...\n"

echo ">> 安装前端依赖..."
cd ./my-website
npm install
cd ..

echo "\n>> 安装后端依赖..."
cd ./backend
npm install
cd ..

echo "\n✓ 依赖安装完成！\n"

# 启动服务
echo "🎬 启动服务...\n"
echo "后端将在 http://localhost:3001"
echo "前端将在 http://localhost:5173\n"

# 启动后端
echo "启动后端服务..."
cd ./backend
npm start &
BACKEND_PID=$!
sleep 2

# 启动前端
echo "启动前端服务..."
cd ../my-website
npm run dev &
FRONTEND_PID=$!

echo "\n✓ 服务已启动！"
echo "📱 前端: http://localhost:5173"
echo "🔌 后端: http://localhost:3001\n"
echo "按 Ctrl+C 停止服务\n"

# 等待用户中断
wait
