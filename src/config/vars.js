const path = require('path');

// Import .env variables
require('dotenv-safe').config({
  path: path.join(__dirname, '../../.env'),
  example: path.join(__dirname, '../../.env.example'),
});

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'SESSION_SECRET', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

module.exports = {
  enableCsrf: process.env.ENABLE_CSRF === 'true', // Convert to boolean
  port: parseInt(process.env.PORT, 10) || 3000, // Ensure port is a number
  env: process.env.NODE_ENV || 'development',
  jwtSecretKey: process.env.JWT_SECRET,
  jwtExpirationInterval: parseInt(process.env.JWT_EXPIRATION_MINUTES, 10) || 30, // Ensure number
  sessionSecret: process.env.SESSION_SECRET,

  // Database configuration
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },

  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev', // Log format based on env

  // Email configuration
  emailConfig: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587, // Default SMTP port
    username: process.env.SMTP_USER,
    password: process.env.SMTP_PASS,
    fromEmail: process.env.FROM_EMAIL || 'noreply@yourdomain.com', // Default from email
  },
};
// console.log('jwt', process.env.JWT_EXPIRATION_MINUTES);
