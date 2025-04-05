const crypto = require('crypto');
const moment = require('moment-timezone');
const { executeQuery, beginTransaction, commitTransaction, rollbackTransaction, } = require('../helpers/db.helper');

class PasswordResetToken {
  constructor(resetTokenData) {
    this.resetToken = resetTokenData.resetToken;
    this.userId = resetTokenData.userId;
    this.expires = resetTokenData.expires;
  }

  /** ✅ Save the reset token to the database */
  async save() {
    try {
      const query = `
        INSERT INTO password_reset_tokens (id, user_id, reset_token, expires_at)
        VALUES (UUID(), ?, ?, ?)
      `;
      await executeQuery(query, [this.userId, this.resetToken, this.expires]);
      return this;
    } catch (error) {
      throw new Error(`Error saving reset token: ${error.message}`);
    }
  }

  /** ✅ Generate a reset token and save it to the database */
  static async generate(user) {
    try {
      const resetToken = `${user.id}.${crypto.randomBytes(40).toString('hex')}`;
      const expires = moment().add(2, 'hours').toDate();

      const resetTokenObject = new PasswordResetToken({
        resetToken,
        userId: user.id,
        expires,
      });

      await resetTokenObject.save(); // Save the token in the DB
      return resetTokenObject;
    } catch (error) {
      throw new Error(`Error generating reset token: ${error.message}`);
    }
  }

  /** ✅ Find a reset token by token and user ID, then delete it */
  static async findOneAndRemove({ userId, resetToken }) {
    const connection = await beginTransaction(); // Start a transaction

    try {
      // Check if the token exists and is valid
      const query = `
        SELECT * FROM password_reset_tokens WHERE user_id = ? AND reset_token = ?
          AND expires_at > NOW()`;
      const [rows] = await executeQuery(query, [userId, resetToken]);

      if (rows.length === 0) {
        throw new Error('Invalid or expired reset token.');
      }

      const token = rows[0];

      // Delete the token from the database
      await executeQuery(
        `DELETE FROM password_reset_tokens WHERE id = ?`,
        [token.id]
      );

      await commitTransaction(connection); // Commit the transaction

      return token;
    } catch (error) {
      await rollbackTransaction(connection); // Rollback in case of error
      throw new Error(`Error removing reset token: ${error.message}`);
    }
  }

  /** ✅ Check if the reset token is expired */
  static isExpired(expiresAt) {
    return moment(expiresAt).isBefore(moment());
  }
}

module.exports = PasswordResetToken;
