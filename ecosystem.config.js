module.exports = {
  apps: [{
    name: 'deepseek-chat',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      VUE_APP_DEEPSEEK_API_KEY: process.env.VUE_APP_DEEPSEEK_API_KEY
    }
  }]
}; 