require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  DATABASE_URL: process.env.DATABASE_URL || '',

  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  SESSION_SECRET: process.env.SESSION_SECRET || '',

  CULTUREFRAME_API_URL: process.env.CULTUREFRAME_API_URL || 'https://jennycultureframe-1.onrender.com',
  CULTUREFRAME_API_TOKEN: process.env.CULTUREFRAME_API_TOKEN || '',
  CULTUREFRAME_API_TIMEOUT_MS: parseInt(process.env.CULTUREFRAME_API_TIMEOUT_MS || '15000', 10),
  CULTUREFRAME_INTEGRATION_ENABLED: process.env.CULTUREFRAME_INTEGRATION_ENABLED === 'true',

  // "mock" | "live" | "snapshot"
  DATA_MODE: process.env.CULTUREMETRICS_DATA_MODE || 'mock',

  isProduction: () => process.env.NODE_ENV === 'production',
  isDevelopment: () => process.env.NODE_ENV === 'development',
};

function validateEnv() {
  const required = ['JWT_SECRET', 'SESSION_SECRET', 'DATABASE_URL'];
  const missing = required.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  if (env.isProduction() && env.DATA_MODE === 'mock') {
    console.warn('[ENV] WARNING: CULTUREMETRICS_DATA_MODE is "mock" in production. Set to "live" when CultureFrame integration is ready.');
  }
}

module.exports = { env, validateEnv };
