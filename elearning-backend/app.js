import express from 'express';
import dotenv from 'dotenv';
import { sequelize } from './src/models/index.js'; 
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5143;

// Middleware parse JSON
app.use(express.json());

// Route cơ bản
app.get('/', (req, res) => {
  res.send('Hello World from Express!');
});

// Hàm khởi động server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công qua Sequelize!');

    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Không thể kết nối tới database:', error);
    process.exit(1);
  }
};

// Gọi hàm
startServer();
