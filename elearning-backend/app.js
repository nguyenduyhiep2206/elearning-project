const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('./src/config/passport.js');
const socketHandler = require("./src/config/socket.js");
const { Server } = require("socket.io");
const http = require("http");

require('dotenv').config();

const { sequelize } = require('./src/models/index.js');
const apiV1Router = require('./src/api/v1');

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
  }
});

socketHandler(io);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use('/api/v1', apiV1Router);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.query("SET timezone = 'Asia/Ho_Chi_Minh'");
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!');

    server.listen(PORT, () => {
      console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ Không kết nối được DB:', err);
    process.exit(1);
  }
};

startServer();
