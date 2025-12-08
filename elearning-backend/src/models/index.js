'use strict';

const sequelize = require('../config/db.config.js'); 
const initModels = require('./init-models');    

const models = initModels(sequelize);

module.exports = {
  sequelize,
  ...models 
};