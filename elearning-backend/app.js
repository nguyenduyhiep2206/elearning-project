const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
require('dotenv').config();
const { sequelize } = require('./src/models'); // Import sequelize instance

// Middleware để parse JSON body và cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Cho phép cả frontend và backend
  credentials: true
}));
// Routes
app.use('/api/v1', require('./src/api/v1'));

const PORT = process.env.PORT;

// Hàm để khởi động server
const startServer = async () => {
  try {
    // Set timezone cho PostgreSQL connection
    await sequelize.query("SET timezone = 'Asia/Ho_Chi_Minh'");
    
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