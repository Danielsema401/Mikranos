const { executeQuery } = require('../helpers/db.helper');
const logger = require('../config/logger');
const User = require('../models/user.model');

class UserRepository {
    async save(user) {
        try {
            const query = `INSERT INTO users (id, first_name, last_name, email, hashed_password, phone, role_id, status, email_verified, verification_token, reset_password_token, reset_password_expires, two_fa_secret, two_fa_verified, profile_picture_url, date_of_birth, seller_request_status, created_at, updated_at, last_login) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

            const { id, firstName, lastName, email, hashedPassword, phone, roleId, status, emailVerified, verificationToken, resetPasswordToken, resetPasswordExpires, twoFaSecret, twoFaVerified, profilePictureUrl, dateOfBirth, sellerRequestStatus, createdAt, updatedAt, lastLogin } = user;

            const values = [id, firstName, lastName, email, hashedPassword, phone, roleId, status, emailVerified, verificationToken,  resetPasswordToken, resetPasswordExpires, twoFaSecret, twoFaVerified, profilePictureUrl, dateOfBirth, sellerRequestStatus, createdAt, updatedAt, lastLogin];

            const result = await executeQuery(query, values);
            if (result.affectedRows === 1) {
                delete user.hashedPassword
                // return { id: user.id, roleId: user.roleId, email: user.email };
                return { ...user };
            }
            return null;
        } catch (error) {
            logger.error(`Database error: ${error.message}`);
            throw new Error('DATABASE_ERROR');
        }
    }

    async findByEmail(email) {
        try {
            const query = `SELECT * FROM users WHERE email = ? LIMIT 1`;
            const result = await executeQuery(query, [email]);
            return result.length ? User.fromDatabase(result[0]) : null;
        } catch (error) {
            logger.error('Failed to find user by email:', error);
            throw new Error('Failed to find user by email');
        }
    }

    async findById(id) {
        try {
            const query = `SELECT * FROM users WHERE id = ? LIMIT 1`;
            const result = await executeQuery(query, [id]);
            return result.length ? User.fromDatabase(result[0]) : null;
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

module.exports = new UserRepository();

///////////////////////////////////////////////////////
// class UserRepository {
//     async save(user) {
//         try {
//             // const query = `INSERT INTO secend_users (id, first_name, last_name, email, password, phone, role_id, status, created_at, updated_at, last_login) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//             // const values = [user.id, user.firstName, user.lastName, user.email, user.hashedPassword, user.phone, user.roleId, user.status, user.createdAt, user.updatedAt, user.lastLogin];
//             const query = `
//                 INSERT INTO secend_users
//                 (id, first_name, last_name, email, password, phone, role_id, status, email_verified,
//                 verification_token, token, refresh_token_expires, reset_password_token, reset_password_expires, two_fa_secret, two_fa_verified,
//                 profile_picture_url, date_of_birth, seller_request_status, created_at, updated_at, last_login)
//                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
//             `;

//             const values = [
//                 user.id, user.firstName, user.lastName, user.email, user.hashedPassword, user.phone, user.roleId,
//                 user.status, user.emailVerified, user.verificationToken, user.token, user.refreshTokenExpires, user.resetPasswordToken,
//                 user.resetPasswordExpires, user.twoFaSecret, user.twoFaVerified, user.profilePictureUrl,
//                 user.dateOfBirth, user.sellerRequestStatus, user.createdAt, user.updatedAt, user.lastLogin
//             ];

//             const result = await executeQuery(query, values);
//             return result.affectedRows === 1 ? user.id : null;
//         } catch (error) {
//             logger.error(`Database error: ${error.message}`);
//             throw new Error('DATABASE_ERROR');
//         }
//     }

//     async findByEmail(email) {
//         try {
//             const query = `SELECT id, first_name, last_name, email, phone, role_id, status FROM secend_users WHERE email = ?`;

//             const result = await executeQuery(query, [email]);
//             console.log(result);
//             return result.length ? result[0] : null;
//         } catch (error) {
//             logger.error('Failed to find user by email:', error);
//             throw new Error('Failed to find user by email');
//         }
//     }

//     async findById(id) {
//         try {
//             const query = `SELECT id, first_name, last_name, email, phone, profile_picture_url, date_of_birth, status FROM secend_users WHERE id = ?`;
//             const result = await executeQuery(query, [id]);
//             return result.length > 0 ? result[0] : null;
//         } catch (error) {
//             logger.error('Failed to find user by ID:', error);
//             throw new Error('Failed to find user by ID');
//         }
//     }

//     async updateUser(user) {
//         try {
//             const query = `UPDATE secend_users SET first_name = ?, last_name = ?, email = ?, phone = ?, profile_picture_url = ?, date_of_birth = ?, updated_at = ? WHERE id = ?`;
//             const values = [user.firstName, user.lastName, user.email, user.phone, user.profilePictureUrl, user.dateOfBirth, user.updatedAt, user.id];

//             const result = await executeQuery(query, values);
//             return result.affectedRows > 0;
//         } catch (error) {
//             logger.error('Failed to update user:', error);
//             throw new Error('Failed to update user');
//         }
//     }

//     ///////////////////////////-Temporary-////////////////////////////////////
//     // async findAllUsers() {
//     //     let query = 'SELECT * FROM secend_users';
//     //     const values = [];
//     //     return await executeQuery(query, values);
//     // }

//     // async findByEmail(email) {
//     //     try {
//     //         const query = 'SELECT * FROM secend_users WHERE email = ?';
//     //         const result = await executeQuery(query, [email]);
//     //         return result[0];
//     //     } catch (error) {
//     //         logger.error('Failed to find user by email:', error);
//     //         throw new Error('Failed to find user by email');
//     //     }
//     // }
// }

// module.exports = UserRepository;
