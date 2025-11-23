// src/config/db.config.js
require('dotenv').config();

const { Sequelize } = require('sequelize');

if (!process.env.DATABASE_URL) {
  throw new Error('FATAL ERROR: DATABASE_URL is not defined in .env file.');
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false, 
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false 
    }
  },
});

module.exports = sequelize;
