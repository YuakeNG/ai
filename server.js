const express = require('express');
const path = require('path');
const history = require('connect-history-api-fallback');
const app = express();

// 支持 history 模式
app.use(history());

// 静态文件服务
app.use(express.static(path.join(__dirname, 'dist')));

// 环境变量端口或默认 3000
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 