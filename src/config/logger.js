const winston = require('winston');
const path = require('path');

// Log file paths dynamically based on the environment
const logDirectory = process.env.NODE_ENV === 'production' ? 'logs' : 'development_logs';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    // Write to all logs with level `info` and below to `combined.log`
    // Write all logs error (and below) to `error.log`
    new winston.transports.File({ filename: path.join(logDirectory, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDirectory, 'combined.log') }),
  ],
});

// In non-production environments, log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;