'use strict';
const { Sequelize } = require('sequelize');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const config = require('../config/database')[env];

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.Admin = require('./Admin')(sequelize, Sequelize.DataTypes);
db.IntegrationConfig = require('./IntegrationConfig')(sequelize, Sequelize.DataTypes);
db.IntegrationSyncRun = require('./IntegrationSyncRun')(sequelize, Sequelize.DataTypes);
db.AnalyticsSnapshot = require('./AnalyticsSnapshot')(sequelize, Sequelize.DataTypes);

module.exports = db;
