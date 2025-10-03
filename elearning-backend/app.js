const express = require('express');
const app = express();
require('dotenv').config();

// ... các cấu hình khác ...

// ✅ THÊM DÒNG NÀY VÀO ĐÂY
// Middleware để parse JSON body
app.use(express.json());

// Routes phải được định nghĩa SAU middleware
app.use('/api/v1', require('./src/api/v1'));

// ... middleware xử lý lỗi và app.listen() ...

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});