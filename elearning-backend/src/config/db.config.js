// src/config/db.config.js

const { Pool } = require('pg');
require('dotenv').config();

const config = {
    connectionString: process.env.DATABASE_URL,
};

if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')) {
    config.ssl = {
        rejectUnauthorized: false
    };
}

const pool = new Pool(config);

// ---- THÊM ĐOẠN NÀY VÀO ----
pool.on('connect', () => {
  console.log('✅ Đã kết nối thành công tới database Neon!');
});
// --------------------------

module.exports = pool;