const express = require('express');
const app = express();
require('dotenv').config();
const { sequelize } = require('./src/models'); // Import sequelize instance

// Middleware để parse JSON body
app.use(express.json()); 

// Routes
app.use('/api/v1', require('./src/api/v1'));

const PORT = process.env.PORT || 3000;

// Hàm để khởi động server
const startServer = async () => {
  try {
    // Kiểm tra kết nối database
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công qua Sequelize!');
    
    // Khởi động server sau khi kết nối DB thành công
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Không thể kết nối tới database:', error);
    process.exit(1); // Thoát khỏi tiến trình nếu không kết nối được DB
  }
};

// Gọi hàm để khởi động server
startServer();