// src/config/db.config.js
const { Pool } = require('pg');
require('dotenv').config();

const config = {
  connectionString: process.env.DATABASE_URL,
};

if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')) {
  config.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = new Pool(config);

// ✅ Kiểm tra kết nối ngay khi khởi động
pool
  .connect()
  .then(client => {
    console.log('✅ Đã kết nối thành công tới database Neon!');
    client.release(); // trả lại connection về pool
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối database:', err.message);
  });

module.exports = pool;
