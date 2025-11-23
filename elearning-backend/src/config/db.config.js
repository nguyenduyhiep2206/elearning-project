// src/config/db.config.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Sử dụng DATABASE_URL từ .env hoặc giá trị mặc định
const databaseUrl = process.env.DATABASE_URL || 'postgresql://elearndb_owner:npg_Q3sU7gTEzHup@ep-muddy-mountain-a4bnlpnx-pooler.us-east-1.aws.neon.tech/elearndb?sslmode=require&channel_binding=require';

// Khởi tạo một đối tượng Sequelize mới
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false, // Tắt logging SQL query ra console, có thể bật 'console.log' để debug
  timezone: '+07:00', // Timezone Việt Nam (UTC+7)
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Cần thiết cho các kết nối tới Neon, Heroku Postgres,...
    },
    // Set timezone cho PostgreSQL connection
    application_name: 'elearning-backend',
  },
  // Set timezone khi query
  define: {
    timestamps: false, // Đã tắt timestamps trong models
  },
});

module.exports = sequelize;
