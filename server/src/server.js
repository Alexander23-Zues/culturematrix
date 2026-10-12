'use strict';

require('dotenv').config();
const { validateEnv } = require('./config/environment');

// Validate required environment variables before starting
try {
  validateEnv();
} catch (err) {
  console.error('[Server] Environment validation failed:', err.message);
  process.exit(1);
}

const app = require('./app');
const { sequelize } = require('./models');
const { env } = require('./config/environment');

const PORT = env.PORT;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('[DB] PostgreSQL connection established.');
  } catch (err) {
    console.error('[DB] Unable to connect to PostgreSQL:', err.message);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`[Server] CultureMetrics API running on port ${PORT} (${env.NODE_ENV})`);
    console.log(`[Server] Data mode: ${env.DATA_MODE}`);
    console.log(`[Server] CultureFrame integration: ${env.CULTUREFRAME_INTEGRATION_ENABLED ? 'ENABLED' : 'DISABLED'}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      sequelize.close().then(() => {
        console.log('[Server] Database connection closed. Goodbye.');
        process.exit(0);
      });
    });
  });
}

start();
