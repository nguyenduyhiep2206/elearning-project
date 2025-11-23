const express = require('express');
const dotenv = require("dotenv");
dotenv.config();
const passport = require('passport');
const {sequelize} = require('./src/models/index.js');
const apiV1Routes = require('./src/api/v1/index.js');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5143;

app.use(express.json());

app.use(passport.initialize());

app.use('/api/v1', apiV1Routes);

app.get('/', (req, res) => {
  res.send('Hello World from Express!');
});

// ✅ Hàm khởi động server
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

startServer();
