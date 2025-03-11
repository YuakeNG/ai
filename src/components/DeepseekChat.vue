<template>
  <div class="chat-container">
    <!-- Token 输入界面 -->
    <div v-if="!deepseekService" class="login-container">
      <div class="cyber-card">
        <div class="card-header">
          <div class="cyber-title">微微 AI</div>
          <div class="cyber-subtitle">智能对话系统</div>
        </div>
        <div class="cyber-form">
          <div class="input-group">
            <el-input
              v-model="apiKey"
              type="password"
              placeholder="输入 API Token"
              show-password
              class="cyber-input"
            >
              <template slot="prefix">
                <i class="el-icon-key"></i>
              </template>
            </el-input>
          </div>
          <el-button 
            @click="initializeService" 
            class="cyber-button"
            type="primary"
          >
            <span class="button-content">
              <i class="el-icon-connection"></i>
              初始化连接
            </span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 聊天界面 -->
    <template v-else>
      <div class="chat-interface">
        <!-- 顶部栏 -->
        <div class="cyber-header">
          <div class="header-left">
            <div class="cyber-logo">微微智能小助手</div>
            <div class="status-indicator">
              <span class="dot"></span>
              已连接
            </div>
          </div>
          <div class="header-right">
            <el-switch
              v-model="isDeepThinking"
              active-text="深度思考"
              inactive-text="普通模式"
              active-color="#13ce66"
              @change="handleModeChange"
              class="mode-switch"
            >
            </el-switch>
            <el-button 
              type="text" 
              @click="clearChat" 
              class="clear-btn"
            >
              <i class="el-icon-delete"></i>
              清空对话
            </el-button>
          </div>
        </div>

        <!-- 消息区域 -->
        <div class="messages-container" ref="messagesContainer">
          <div class="cyber-welcome" v-if="messages.length === 0">
            <div class="welcome-icon">🤖</div>
            <div class="welcome-text">
              <h3>微微智能小助手</h3>
              <p>让我们开始智能对话吧...</p>
            </div>
          </div>

          <div v-for="(message, index) in messages" 
               :key="index" 
               :class="['message-wrapper', message.role]">
            <div class="message-bubble">
              <div class="avatar">
                <el-avatar 
                  :size="40"
                  :class="message.role === 'user' ? 'user-avatar' : 'ai-avatar'"
                  :src="message.role === 'user' ? '' : aiAvatar"
                >
                  {{ message.role === 'user' ? '👤' : '' }}
                </el-avatar>
              </div>
              <div class="content">
                <div class="message-header">
                  <span class="role-name">
                    {{ message.role === 'user' ? '用户' : '微微' }}
                  </span>
                  <span class="time">{{ getCurrentTime() }}</span>
                </div>
                <div v-if="message.thinking" class="thinking-process">
                  <div v-for="(step, stepIndex) in message.steps" 
                       :key="stepIndex" 
                       class="thinking-step">
                    <div class="step-header">
                      <span class="step-number">{{ step.step }}</span>
                      <span class="step-title">{{ step.title }}</span>
                    </div>
                    <div class="step-content">{{ step.content }}</div>
                  </div>
                </div>
                <div v-else class="message-text">
                  {{ message.content }}
                </div>
              </div>
            </div>
          </div>

          <!-- 思考动画 -->
          <div v-if="isLoading" class="thinking-wrapper">
            <div class="thinking-bubble">
              <div class="avatar">
                <el-avatar 
                  :size="40"
                  class="ai-avatar"
                  :src="aiAvatar"
                />
              </div>
              <div class="thinking-content">
                <div class="thinking-step" v-if="currentThinkingStep">
                  <div class="step-header">
                    <span class="step-number">{{ currentThinkingStep.number }}</span>
                    <span class="step-title">{{ currentThinkingStep.title }}</span>
                  </div>
                  <div class="thinking-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-panel">
          <div class="input-area">
            <el-input
              type="textarea"
              v-model="userInput"
              :rows="3"
              :disabled="isLoading"
              placeholder="输入您的问题，按回车发送"
              @keydown.enter.prevent="handleEnterPress"
              resize="none"
              class="cyber-textarea"
            />
            <el-button 
              @click="sendMessage"
              :loading="isLoading"
              :disabled="!userInput.trim()"
              class="send-button"
              type="primary"
            >
              发送
            </el-button>
          </div>
        </div>
      </div>
    </template>

    <!-- 全局进度条 -->
    <div v-if="isLoading" class="cyber-progress">
      <div class="progress-line"></div>
    </div>
  </div>
</template>

<script>
import DeepseekService from '../services/deepseekService';

export default {
  name: 'DeepseekChat',
  data() {
    return {
      deepseekService: null,
      apiKey: '',
      messages: [],
      userInput: '',
      isLoading: false,
      loadingProgress: 0,
      progressInterval: null,
      aiAvatar: null,
      isDeepThinking: false,
      thinkingSteps: [
        { number: 1, title: '理解问题要点' },
        { number: 2, title: '分析关键信息' },
        { number: 3, title: '思考解决方案' },
        { number: 4, title: '组织语言输出' }
      ],
      currentThinkingStep: null
    };
  },
  created() {
    // 加载头像
    try {
      this.aiAvatar = require('@/assets/h.jpg');
    } catch (e) {
      console.error('头像加载失败:', e);
      this.aiAvatar = '';
    }
    
    const envApiKey = process.env.VUE_APP_DEEPSEEK_API_KEY;
    console.log('API Key from env:', envApiKey);
    if (envApiKey && envApiKey !== 'your_api_key_here') {
      this.apiKey = envApiKey;
      this.initializeService();
    }
  },
  methods: {
    initializeService() {
      if (this.apiKey.trim()) {
        this.deepseekService = new DeepseekService(this.apiKey.trim());
        this.$message.success('连接成功');
      }
    },
    handleModeChange(value) {
      if (this.deepseekService) {
        const model = value ? 'deepseek-reasoner' : 'deepseek-chat';
        this.deepseekService.setModel(model);
        this.$message({
          type: 'success',
          message: `已切换至${value ? '深度思考' : '普通'}模式`
        });
      }
    },
    async sendMessage() {
      if (!this.userInput.trim() || this.isLoading) return;
      
      const userMessage = {
        role: 'user',
        content: this.userInput.trim()
      };
      
      this.messages.push(userMessage);
      this.isLoading = true;
      this.userInput = '';

      try {
        // 创建思考消息
        const thinkingMessage = {
          role: 'assistant',
          content: '',
          thinking: true,
          steps: []
        };
        this.messages.push(thinkingMessage);

        if (this.isDeepThinking) {
          // 深度思考模式的步骤
          const thinkingSteps = [
            { step: 1, title: '问题理解', content: '分析问题的核心要点和约束条件...' },
            { step: 2, title: '知识检索', content: '搜索相关领域的专业知识库...' },
            { step: 3, title: '逻辑推理', content: '基于已知信息进行多维分析...' },
            { step: 4, title: '方案生成', content: '整合分析结果，形成最优解决方案...' }
          ];

          // 逐步显示思考过程
          for (const step of thinkingSteps) {
            await new Promise(resolve => setTimeout(resolve, 800));
            thinkingMessage.steps.push(step);
            this.$forceUpdate();
          }
        } else {
          // 普通模式的思考步骤
          const simpleSteps = [
            { step: 1, title: '思考中', content: '正在处理您的问题...' },
            { step: 2, title: '生成回答', content: '组织语言，形成回复...' }
          ];

          // 显示简单的思考过程
          for (const step of simpleSteps) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            thinkingMessage.steps.push(step);
            this.$forceUpdate();
          }
        }

        // 发送实际请求
        const response = await this.deepseekService.sendMessage(
          this.messages.filter(m => !m.thinking)
        );
        
        // 移除思考过程消息
        this.messages.pop();

        // 添加实际回复
        const assistantMessage = {
          role: 'assistant',
          content: response.choices[0].message.content,
          timestamp: new Date()
        };
        
        this.messages.push(assistantMessage);
      } catch (error) {
        console.error('发送消息失败:', error);
        this.$message.error('发送消息失败，请重试');
      } finally {
        this.isLoading = false;
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      container.scrollTop = container.scrollHeight;
    },
    clearChat() {
      this.$confirm('确认清空所有对话记录?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.messages = [];
        this.$message.success('已清空对话记录');
      }).catch(() => {});
    },
    startProgress() {
      this.loadingProgress = 0;
      this.progressInterval = setInterval(() => {
        if (this.loadingProgress < 90) {
          this.loadingProgress += Math.random() * 10;
        }
      }, 200);
    },
    stopProgress() {
      clearInterval(this.progressInterval);
      this.loadingProgress = 100;
      setTimeout(() => {
        this.loadingProgress = 0;
      }, 200);
    },
    getCurrentTime() {
      const now = new Date();
      return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    },
    handleEnterPress(e) {
      // 如果正在加载或者输入为空，不处理
      if (this.isLoading || !this.userInput.trim()) return;
      
      // 如果按下 shift + enter，允许换行
      if (e.shiftKey) {
        return;
      }
      
      // 阻止默认换行行为
      e.preventDefault();
      // 发送消息
      this.sendMessage();
    }
  }
};
</script>

<style>
/* 全局变量 */
:root {
  --primary-color: #00a8ff;
  --secondary-color: #192a56;
  --accent-color: #0097e6;
  --background-color: #1e1e2e;  /* 深色背景 */
  --text-color: #f5f6fa;
  --border-color: rgba(255, 255, 255, 0.1);
}

/* 修改全局背景 */
body {
  margin: 0;
  padding: 0;
  background-color: var(--background-color);
  color: var(--text-color);
}

#app {
  padding: 0 !important;  /* 移除默认内边距 */
}

/* 聊天容器样式 */
.chat-container {
  height: 100vh;
  background: var(--background-color);
  display: flex;
  flex-direction: column;
}

/* 登录界面样式 */
.login-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #192a56 0%, #1e272e 100%);
}

.cyber-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: 15px;
  padding: 2rem;
  width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.cyber-title {
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.cyber-subtitle {
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 2rem;
}

/* 聊天界面样式 */
.chat-interface {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}

.cyber-header {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.cyber-logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.status-indicator .dot {
  width: 8px;
  height: 8px;
  background: #2ecc71;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

/* 消息区域样式 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.2);  /* 稍微深一点的背景 */
}

.message-wrapper {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}

.message-bubble {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  max-width: 80%;
}

/* 用户消息靠右 */
.user {
  align-items: flex-end;
}

.user .message-bubble {
  flex-direction: row-reverse;
  margin-left: auto;
}

/* 助手消息靠左 */
.assistant {
  align-items: flex-start;
}

.content {
  flex: 1;
  min-width: 0; /* 防止内容溢出 */
}

.avatar {
  flex-shrink: 0; /* 防止头像被压缩 */
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.role-name {
  font-weight: bold;
  color: var(--primary-color);
}

.time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

/* 输入区域样式 */
.input-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--border-color);
}

.input-area {
  display: flex;
  gap: 12px;
  align-items: stretch; /* 改为 stretch 使高度一致 */
  padding: 16px;
}

.cyber-textarea {
  flex: 1; /* 让输入框占据剩余空间 */
}

.cyber-textarea >>> .el-textarea__inner {
  background-color: rgba(0, 0, 0, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: var(--text-color) !important;
  resize: none !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px !important;
  line-height: 1.6 !important;
  padding: 12px !important;
  height: 100% !important; /* 确保高度填满 */
  min-height: 80px !important; /* 设置最小高度 */
}

.cyber-textarea >>> .el-textarea__inner:focus {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.send-button {
  height: 80px !important; /* 与输入框高度一致 */
  align-self: stretch !important; /* 拉伸到与输入框一样高 */
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 24px !important;
  background: #1890ff !important;
  border: none !important;
  border-radius: 4px !important;
  font-size: 14px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  margin-top: 0 !important; /* 移除顶部边距 */
}

.send-button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.send-button:not(:disabled):active {
  transform: translateY(0);
}

/* 动画效果 */
@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.cyber-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  overflow: hidden;
}

.progress-line {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%,
    var(--primary-color) 50%,
    transparent 100%
  );
  animation: progress-animation 1.5s infinite linear;
}

@keyframes progress-animation {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* 思考动画样式 */
.thinking-wrapper {
  display: flex;
  justify-content: flex-start;
  margin: 1rem 0;
  width: 100%;
}

.thinking-bubble {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  max-width: 80%;
}

.thinking-content {
  flex: 1;
}

.thinking-dots {
  display: flex;
  gap: 4px;
}

.thinking-dots span {
  width: 8px;
  height: 8px;
  background: var(--primary-color);
  border-radius: 50%;
  display: inline-block;
  margin: 0 2px;
  animation: bounce 1.4s infinite ease-in-out;
}

.thinking-dots span:nth-child(1) { animation-delay: 0s; }
.thinking-dots span:nth-child(2) { animation-delay: 0.32s; }
.thinking-dots span:nth-child(3) { animation-delay: 0.64s; }

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-8px); }
}

.thinking-text {
  font-size: 12px;
  color: #909399;
  animation: fade 2s infinite;
}

@keyframes fade {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cyber-card {
    width: 90%;
    margin: 1rem;
  }

  .message-bubble {
    max-width: 90%;
  }
}

/* 添加欢迎界面样式 */
.cyber-welcome {
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  margin: 2rem auto;
  max-width: 500px;
}

.welcome-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

.welcome-text h3 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.welcome-text p {
  color: rgba(255, 255, 255, 0.6);
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 添加头像样式 */
.ai-avatar {
  border: 2px solid var(--primary-color) !important;
  box-shadow: 0 0 10px rgba(0, 168, 255, 0.3);
  background-size: cover !important;
  background-position: center !important;
}

.user-avatar {
  border: 2px solid var(--accent-color) !important;
}

/* 添加头像加载失败时的样式 */
.el-avatar > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 3px;
}

/* 添加模式切换开关样式 */
.mode-switch {
  margin-right: 20px;
}

.el-switch__label {
  color: var(--text-color) !important;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* 思考过程样式优化 */
.thinking-process {
  margin-top: 1rem;
  width: 100%;
}

.thinking-step {
  margin-bottom: 1rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 1rem;
  opacity: 0;
  transform: translateY(10px);
  animation: fadeInUp 0.5s forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.step-number {
  background: var(--primary-color);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
  font-size: 12px;
}

.step-title {
  font-weight: bold;
  font-size: 14px;
}

.step-content {
  color: var(--text-color);
  opacity: 0.8;
  font-size: 14px;
  line-height: 1.6;
}

/* 消息文本样式 */
.message-text {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-color);
  white-space: pre-wrap;
  word-break: break-word; /* 防止长文本破坏布局 */
}
</style> 