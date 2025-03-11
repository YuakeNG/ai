# 微微智能助手

一个基于 Vue.js 和 DeepSeek API 开发的智能对话系统，支持普通对话和深度思考模式。

## 功能特点

- 🤖 智能对话：支持自然语言交互
- 🧠 深度思考：可切换至深度分析模式，获得更详细的思考过程
- 💫 优雅动画：流畅的思考动画和交互效果
- 🌓 深色主题：护眼的深色界面设计
- ⌨️ 快捷操作：支持回车发送，Shift + Enter 换行
- 🔄 实时反馈：直观的思考过程展示
- 📱 响应式设计：完美适配各种屏幕尺寸

## 技术栈

- Vue.js 2.x
- Element UI
- Axios
- Express
- PM2

## 快速开始

### 环境要求

- Node.js >= 12.x
- npm >= 6.x

2.配置环境变量
  bash
  
3.创建 .env.local 文件
VUE_APP_DEEPSEEK_API_KEY=your_api_key_here

4.开发模式

npm run serve

5. 生产构建
npm run build

6. 使用 PM2 部署
pm2 start ecosystem.config.js

## 项目结构
deepseek-chat/
├── src/
│ ├── assets/ # 静态资源
│ ├── components/ # 组件
│ ├── services/ # API 服务
│ ├── App.vue # 根组件
│ └── main.js # 入口文件
├── public/ # 公共文件
├── server.js # Express 服务器
└── ecosystem.config.js # PM2 配置


## 使用说明

1. 初始化连接：
   - 输入 DeepSeek API Token
   - 点击"初始化连接"按钮

2. 对话模式：
   - 普通模式：直接对话
   - 深度思考：点击右上角开关切换

3. 快捷键：
   - Enter：发送消息
   - Shift + Enter：换行
   - 清空对话：点击右上角清空按钮

## 自定义配置

### API 配置
修改 `.env` 文件：
  VUE_APP_API_BASE_URL=https://api.deepseek.com

### PM2 配置
修改 `ecosystem.config.js`：
javascript
  module.exports = {
  apps: [{
  name: 'deepseek-chat',
  script: 'server.js',
  instances: 1,
  autorestart: true,
  watch: false,
  max_memory_restart: '1G'
}]
};


## 开发建议

1. 组件开发
   - 遵循 Vue.js 最佳实践
   - 使用 Element UI 组件库
   - 保持代码风格一致

2. 样式开发
   - 使用 CSS 变量管理主题
   - 保持响应式设计
   - 注意动画性能

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交代码
4. 发起 Pull Request

## 许可证

[MIT License](LICENSE)

## 联系方式

- 作者：[你的名字]
- 邮箱：[你的邮箱]

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基础对话功能
- 添加深度思考模式
- 实现动画效果
