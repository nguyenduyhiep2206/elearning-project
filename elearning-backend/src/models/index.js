'use strict';

const sequelize = require('../config/db.config'); 
const initModels = require('./init-models');    

const models = initModels(sequelize);

module.exports = {
  sequelize,
  ...models 
};