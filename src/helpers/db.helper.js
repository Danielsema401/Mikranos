// src/helpers/db.helper.js
const db = require('../config/db').pool.promise();
const logger = require('../config/logger');

const executeQuery = async (query, values, connection = null, timeout = 5000) => {
    try {
        logger.debug('Executing database query:', { query, values: values || 'No values' });
        const [result] = connection
            ? await connection.query({ sql: query, values, timeout })
            : await db.query({ sql: query, values, timeout });
        return result;
    } catch (error) {
        logger.error('Database Query failed:', { query, values: values || 'No values', error: error.message });
        throw error;
    }
};

const beginTransaction = async () => {
    const connection = await db.getConnection();
    await connection.beginTransaction();
    return connection;
};

const commitTransaction = async (connection) => {
    await connection.commit();
    connection.release();
};

const rollbackTransaction = async (connection) => {
    await connection.rollback();
    connection.release();
};

module.exports = {
    executeQuery,
    beginTransaction,
    commitTransaction,
    rollbackTransaction,
};
