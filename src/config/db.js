const mysql = require('mysql2');
const logger = require('./logger');
const { db, env } = require('./vars');

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: db.host,
  user: db.user,
  password: db.password,
  database: db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true, // Optional: Enable keep-alive to prevent connection timeouts
  keepAliveInitialDelay: 10000, // Optional: Initial delay for keep-alive
});

// Handle database errors
pool.on('error', (err) => {
  logger.error(`MySQL connection error: ${err.message}`);
  logger.error(err.stack);
  process.exit(-1);
});

// Log queries in development
if (env === 'development') {
  pool.on('connection', (connection) => {
    logger.info(`MySQL connection established with thread ID: ${connection.threadId}`);
  });
}

// **Test database connection on startup**
const connect = async () => {
  try {
    const connection = await pool.promise().getConnection();
    // logger.info('Successfully connected to the database');
    connection.release();
  } catch (err) {
    logger.error('Failed to connect to the database:', err.message);
    process.exit(-1);
  }
};

// **Gracefully close the connection pool**
const closeConnectionPool = async () => {
  // logger.info('Closing database connection pool...');
  try {
    await pool.promise().end();
    // logger.info('Database connection pool closed');
  } catch (err) {
    logger.error('Error closing the database connection pool:', err.message);
  }
};

// **Optional: Ping the database to check connectivity**
const ping = async () => {
  try {
    const connection = await pool.promise().getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (err) {
    logger.error('Database ping failed:', err.message);
    return false;
  }
};


module.exports = {
  connect,
  pool, // Export the pool directly
  closeConnectionPool,
  ping, // Optional: Export the ping method
};
