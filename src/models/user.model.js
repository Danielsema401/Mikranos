const { executeQuery } = require('../helpers/db.helper');
const logger = require('../config/logger');

class UserModel {
  async save(user) {
    try {
      const query = `INSERT INTO users (id, first_name, last_name, email, hashed_password, phone, role_id, status, email_verified, verification_token, reset_password_token, reset_password_expires, two_fa_secret, two_fa_verified, profile_picture_url, date_of_birth, seller_request_status, created_at, updated_at, last_login) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

      const values = [user.id, user.firstName, user.lastName, user.email, user.hashedPassword, user.phone, user.roleId, user.status, user.emailVerified, user.verificationToken, user.resetPasswordToken, user.resetPasswordExpires, user.twoFaSecret, user.twoFaVerified, user.profilePictureUrl, user.dateOfBirth, user.sellerRequestStatus, user.createdAt, user.updatedAt, user.lastLogin];

      const result = await executeQuery(query, values);
      if (result.affectedRows === 1) {
        delete user.hashedPassword
        return { ...user };
        // return { id: user.id, roleId: user.roleId, email: user.email };
      } else {
        return null;
      };
    } catch (error) {
      logger.error(`Database error: ${error.message}`);
      throw new Error('DATABASE_ERROR');
    }
  }

  async findByEmail(email) {
    try {
      const query = `SELECT * FROM users WHERE email = ? LIMIT 1`;
      const result = await executeQuery(query, [email]);
      return result.length[0];
    } catch (error) {
      logger.error('Failed to find user by email:', error);
      throw new Error('Failed to find user by email');
    }
  }
  async findById(id) {
    try {
      const query = `SELECT * FROM users WHERE id = ? LIMIT 1`;
      const result = await executeQuery(query, [id]);
      return result[0];
    } catch (error) {
      logger.error('Failed to find user by ID:', error);
      throw new Error('Failed to find user by ID');
    }
  }
  async updateUser(user) {
    try {
      const query = `
                UPDATE secend_users SET
                first_name = ?, last_name = ?, email = ?, phone = ?, profile_picture_url = ?,
                date_of_birth = ?, updated_at = ?
                WHERE id = ?
            `;

      const { firstName, lastName, email, phone, profilePictureUrl, dateOfBirth, updatedAt, id } = user;
      const values = [firstName, lastName, email, phone, profilePictureUrl, dateOfBirth, updatedAt, id];

      const result = await executeQuery(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Failed to update user:', error);
      throw new Error('Failed to update user');
    }
  }
}

module.exports = new UserModel();
