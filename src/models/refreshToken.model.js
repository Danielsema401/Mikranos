// models/refreshToken.model.js
const crypto = require('crypto');
const moment = require('moment-timezone');
const { executeQuery, beginTransaction, commitTransaction, rollbackTransaction } = require('../helpers/db.helper');
const logger = require('../config/logger');
const { generateUUID } = require('../utils/index');

class RefreshToken {
  constructor({ id, token, userId, userEmail, expires }) {
    this.id = id || generateUUID();
    this.token = token;
    this.userId = userId;
    this.userEmail = userEmail;
    this.expires = expires;
  }

  static async save(userId, token, expires) {
    const connection = await beginTransaction();
    try {
      const checkQuery = 'SELECT id FROM user_tokens WHERE user_id = ?';
      const tokenExists = await executeQuery(checkQuery, [userId]);

      let query, values;
      const now = moment().tz('Africa/Addis_Ababa').format('YYYY-MM-DD HH:mm:ss');

      if (tokenExists && tokenExists.length > 0) {
        query = `
          UPDATE user_tokens
          SET token = ?, expires = ?, updated_at = ?
          WHERE user_id = ?`;
        values = [token, expires, now, userId];
      } else {
        query = `
          INSERT INTO user_tokens (id, user_id, token, expires, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)`;
        values = [generateUUID(), userId, token, expires, now, now];
      }

      await executeQuery(query, values);
      await commitTransaction(connection);
      return { userId, token, expires };
    } catch (error) {
      await rollbackTransaction(connection);
      logger.error('Error saving refresh token:', error);
      throw new APIError('Failed to save refresh token', httpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      if (connection) await connection.release();
    }
  }

  static async generate(user) {
    if (!user || !user.id) {
      throw new APIError('Invalid user: ID is required', httpStatus.BAD_REQUEST);
    }

    const token = `${user.id}.${crypto.randomBytes(40).toString('hex')}`;
    const expires = moment().add(30, 'days').toDate();

    logger.info(`Generated refresh token for user ${user.id}`);

    try {
      await RefreshToken.save(user.id, token, expires);
      return new RefreshToken({
        token,
        userId: user.id,
        userEmail: user.email,
        expires,
      });
    } catch (error) {
      logger.error('Error generating refresh token:', error);
      throw new APIError('Failed to generate refresh token', httpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  static async findOneAndRemove(token) {
    if (!token) {
      throw new Error('Token is required');
    }

    const connection = await beginTransaction();

    try {
      // First verify the token exists
      const selectQuery = `
        SELECT user_id, expires
        FROM users_token
        WHERE token = ?`;
      const rows = await executeQuery(selectQuery, [token]);

      if (!rows || rows.length === 0) {
        await commitTransaction(connection);
        return null;
      }

      const tokenData = rows[0];
      const userId = tokenData.user_id;
      const expires = tokenData.expires;

      // Delete the token
      const deleteQuery = `
        DELETE FROM users_token
        WHERE token = ?`;
      await executeQuery(deleteQuery, [token]);

      await commitTransaction(connection);
      return { userId, token: null, expires };
    } catch (error) {
      await rollbackTransaction(connection);
      logger.error('Error removing refresh token:', error);
      throw new Error('Failed to remove refresh token');
    } finally {
      if (connection) await connection.release();
    }
  }

  static async findByToken(token) {
    if (!token) {
      return null;
    }

    try {
      const query = `
        SELECT id, token, user_id as userId, expires
        FROM users_token
        WHERE token = ?`;
      const rows = await executeQuery(query, [token]);

      if (!rows || rows.length === 0) {
        return null;
      }

      const tokenData = rows[0];
      return new RefreshToken({
        id: tokenData.id,
        token: tokenData.token,
        userId: tokenData.userId,
        expires: tokenData.expires
      });
    } catch (error) {
      logger.error('Error finding refresh token:', error);
      throw new Error('Failed to find refresh token');
    }
  }

  static async revokeAllForUser(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const connection = await beginTransaction();

    try {
      const deleteQuery = `
        DELETE FROM users_token
        WHERE user_id = ?`;
      await executeQuery(deleteQuery, [userId]);

      await commitTransaction(connection);
      return true;
    } catch (error) {
      await rollbackTransaction(connection);
      logger.error('Error revoking all tokens for user:', error);
      throw new Error('Failed to revoke tokens');
    } finally {
      if (connection) await connection.release();
    }
  }
}

module.exports = RefreshToken;
