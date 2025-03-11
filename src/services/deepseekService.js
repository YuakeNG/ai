import axios from 'axios';

// 使用正确的 DeepSeek API URL
const DEEPSEEK_API_URL = 'https://api.deepseek.com';  // 改回官方文档的地址

export default class DeepseekService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.model = 'deepseek-chat';  // 默认模型
    this.client = axios.create({
      baseURL: DEEPSEEK_API_URL,
      headers: {
        'Authorization': `Bearer ${apiKey.replace(/['"]/g, '')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  setModel(model) {
    this.model = model;
  }

  async sendMessage(messages) {
    try {
      console.log('Using API Key:', this.apiKey); // 添加日志检查 token
      const response = await this.client.post('/v1/chat/completions', {
        model: this.model,  // 使用当前设置的模型
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: 0.7,
        stream: false,
        max_tokens: 1000
      });
      return response.data;
    } catch (error) {
      console.error('DeepSeek API 错误:', error);
      if (error.response) {
        console.error('错误状态码:', error.response.status);
        console.error('错误响应:', error.response.data);
        console.error('错误头信息:', error.response.headers);
      } else if (error.request) {
        console.error('请求错误:', error.request);
      } else {
        console.error('错误信息:', error.message);
      }
      throw error;
    }
  }
} 