const { port, env } = require('./src/config/vars');
const logger = require('./src/config/logger');
const app = require('./src/config/express.test');
const db = require('./src/config/db');
const rateLimit = require('express-rate-limit');

let server;
let isShuttingDown = false;

// Apply rate limiting (protect against abuse)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,       // 15 minutes
  max: 100,                       // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
});
app.use(globalLimiter);

// Handle uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error.stack || error);
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  setTimeout(() => process.exit(1), 1000);
});

// Graceful shutdown handler
const handleExit = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info(`Received ${signal}, shutting down...`);

  const serverCloseTimeout = setTimeout(() => {
    logger.error('Server close timed out, forcing exit...');
    process.exit(1);
  }, 10000);

  if (server && server.listening) {
    server.close(async () => {
      clearTimeout(serverCloseTimeout);
      try {
        await db.closeConnectionPool();
        logger.info('Database connection pool closed');
      } catch (error) {
        logger.error('Failed to close database connection:', error);
      }
      logger.info('Server shut down successfully.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

// Listen for termination signals
process.once('SIGINT', handleExit);
process.once('SIGTERM', handleExit);

logger.info('Initializing server...');

// Database connection with timeout
const dbConnectionTimeout = setTimeout(() => {
  logger.error('Database connection timed out after 10 seconds');
  process.exit(1);
}, 10000);

db.connect()
  .then(() => {
    clearTimeout(dbConnectionTimeout);
    logger.info('Database connected successfully');

    // Start server only after DB connection
    server = app.listen(port, () => {
      logger.info(`Server running at http://localhost:${port} (${env})`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${port} is already in use.`);
      } else {
        logger.error('Server error:', error);
      }
      process.exit(1);
    });
  })
  .catch((error) => {
    clearTimeout(dbConnectionTimeout);
    logger.error('Failed to connect to the database:', error);
    process.exit(1);
  });

module.exports = app;
