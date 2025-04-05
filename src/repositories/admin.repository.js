const { executeQuery } = require('../helpers/db.helper');
const logger = require('../config/logger');

class AdminRepository {
    async save(user) {
        try {
            const query = `
                INSERT INTO secend_users
                (id, first_name, last_name, email, password, phone, role_id, status, email_verified,
                verification_token, token, refresh_token_expires, reset_password_token, reset_password_expires, two_fa_secret, two_fa_verified,
                profile_picture_url, date_of_birth, seller_request_status, created_at, updated_at, last_login)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
            `;

            const values = [
                user.id, user.firstName, user.lastName, user.email, user.hashedPassword, user.phone, user.roleId,
                user.status, user.emailVerified, user.verificationToken, user.token, user.refreshTokenExpires ,user.resetPasswordToken,
                user.resetPasswordExpires, user.twoFaSecret, user.twoFaVerified, user.profilePictureUrl,
                user.dateOfBirth, user.sellerRequestStatus, user.createdAt, user.updatedAt, user.lastLogin
            ];

            const result = await executeQuery(query, values);
            if (result.affectedRows === 1) {
                return user.id; // ✅ Return user ID if successful
            } else {
                throw new Error('User insertion failed'); // ✅ Handle unexpected cases
            }
        } catch (error) {
            logger.error(`Database error: ${error.message}`);

            if (error.code === 'ER_DUP_ENTRY') {  // ✅ Use MySQL error code for duplicate entry
                throw new Error('DUPLICATE_EMAIL'); // ✅ Custom error code for service layer
            }

            throw new Error('DATABASE_ERROR'); // ✅ Generic error
        }
    }


    async findById(id) {
        try {
            const query = `
            SELECT id, first_name, last_name, email, phone, profile_picture_url, date_of_birth, role_id, status, email_verified, verification_token, reset_password_token, reset_password_expires, last_login, two_fa_secret, two_fa_verified, seller_request_status, created_at, updated_at FROM secend_users WHERE id = ?`;
            const result = await executeQuery(query, [id]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            logger.error('Admin failed to find user by ID:', error.message);
            throw new Error('Admin failed to find user by ID');
        }
    }

    async findByEmail(email) {
        try {
            const query = 'SELECT * FROM secend_users WHERE email = ?';
            const result = await executeQuery(query, [email]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            logger.error('Failed to find user by email:', error);
            throw new Error('Failed to find user by email');
        }
    }

    async updateUser(user) {
      try {
          const query = 'UPDATE secend_users SET  first_name = ?, last_name = ?, email = ?, phone = ?, status = ?, email_verified = ?, verification_token = ?, reset_password_token = ?, reset_password_expires = ?, last_login = ?, two_fa_secret = ?, two_fa_verified = ?, profile_picture_url = ?, date_of_birth = ?, seller_request_status = ?, updated_at = ? WHERE id = ?';
          const values = [user.firstName, user.lastName, user.email, user.phone, user.status, user.emailVerified, user.verificationToken, user.resetPasswordToken, user.resetPasswordExpires, user.lastLogin, user.twoFaSecret, user.twoFaVerified, user.profilePictureUrl, user.dateOfBirth, user.sellerRequestStatus, user.updatedAt, user.id];

          const result = await executeQuery(query, values);
          return result.affectedRows > 0 || null;
      } catch (error) {
        logger.error('Failed to update user as admin:', error);
        throw new Error('Failed to update user as admin');
      }
    }

    async updateUserRole(userId, newRoleId) {
        try {
            const query = `UPDATE secend_users SET role_id = ? WHERE id = ?`;
            const result = await executeQuery(query, [newRoleId, userId]);
            return result.affectedRows > 0;
        } catch (error) {
            logger.error('Failed to update user role:', error);
            throw new Error('Failed to update user role');
        }
    }

    async findAllUsers(adminId, { page = 1, limit = 10, filters = {} }) {
        try {
            // ✅ Ensure the requester is an admin
            const adminCheck = await executeQuery('SELECT role_id FROM secend_users WHERE id = ?', [adminId]);
            if (adminCheck.length === 0 || adminCheck[0].role_id !== 2) {
                throw new Error('UNAUTHORIZED_ACTION');
            }

            const offset = (page - 1) * limit;
            const allowedFilters = ['status', 'role_id', 'email_verified'];
            const whereConditions = [];
            const values = [];

            for (let key in filters) {
                if (allowedFilters.includes(key)) {
                    whereConditions.push(`${key} = ?`);
                    values.push(filters[key]);
                }
            }

            let query = 'SELECT id, first_name, last_name, email, phone, role_id, status FROM secend_users';
            if (whereConditions.length > 0) {
                query += ' WHERE ' + whereConditions.join(' AND ');
            }
            query += ' LIMIT ? OFFSET ?';
            values.push(limit, offset);

            return await executeQuery(query, values);
        } catch (error) {
            logger.error('Failed to fetch users:', error);
            throw new Error('Failed to fetch users');
        }
    }
    async deleteUser(userId, adminId) {
        try {
            // ✅ Ensure the requester is an admin
            const adminCheck = await executeQuery('SELECT role_id FROM secend_users WHERE id = ?', [adminId]);
            if (adminCheck.length === 0 || adminCheck[0].role_id !== 1) {
                throw new Error('UNAUTHORIZED_ACTION');
            }

            const query = 'DELETE FROM secend_users WHERE id = ?';
            const result = await executeQuery(query, [userId]);
            return result.affectedRows > 0;
        } catch (error) {
            logger.error('Failed to delete user:', error);
            throw new Error('Failed to delete user');
        }
    }

}

module.exports = AdminRepository;
