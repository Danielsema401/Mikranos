// src/services/admin.service.js
const AdminRepository = require('../repositories/admin.repository');
const User = require('../models/user.model');
const httpStatus = require('http-status');
const logger = require('../config/logger');
const APIError = require('../errors/api-error');
const { hashPassword, comparePassword } = require('../helpers/auth.helper');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');
const now = moment().tz("Africa/Addis_Ababa").format("YYYY-MM-DD HH:mm:ss A");


class AdminService {
    constructor(adminRepository) {
        this.adminRepository = adminRepository;
    }
    async createUser(userData) {
        try {
            // ✅ Validate required fields
            const requiredFields = ['firstName', 'lastName', 'password', 'email', 'phone'];
            for (const field of requiredFields) {
                if (!userData[field]) {
                    throw new APIError(`${field} is required`, httpStatus.BAD_REQUEST);
                }
            }

            const hashedPassword = await hashPassword(userData.password);
            const now = moment().tz("Africa/Addis_Ababa").format("YYYY-MM-DD HH:mm A");
            const user = new User({
                ...userData, hashedPassword, id: uuidv4(), createdAt: now, updatedAt: null
            });

            // // ✅ Check if email already exists (prevents DB duplicate error)
            const existingUser = await this.adminRepository.findByEmail(user.email);
            if (existingUser) {
                throw new APIError('Email already exists', httpStatus.CONFLICT);
            }

            // ✅ Save user and return the created user ID
            const savedUserId = await this.adminRepository.save(user);
            return savedUserId;
        } catch (error) {
            logger.error(`Failed to create user. Email: ${userData.email}, Error: ${error.message} status: ${httpStatus.CONFLICT}`);

            if (error.message === 'DUPLICATE_EMAIL') {  // ✅ Check for the custom error
                throw new APIError('Email already exists', httpStatus.CONFLICT);
            }

            throw new APIError('Database error occurred', httpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getUserByEmail(email) {
    try {
        const user = await this.adminRepository.findByEmail(email);
        if (!user) {
            throw new APIError({message: 'No found user by email', email, status: httpStatus.CONFLICT});
        }
        return user;
    } catch (error) {
        // logger.info(`Not found by this email ${email} and error: ${error.message} ${error.status} `);
        return {message: error.message, status: error.status};
    }
}
    async getUserById(id) {
        try {
            if (!id) {
                throw new APIError('User ID is required', httpStatus.BAD_REQUEST);
            }

            const userData = await this.adminRepository.findById(id);
            if (!userData) {
                logger.warn(`User not found with ID: ${id}`);
                return null;
            }
            return userData;
        } catch (error) {
            logger.error(`Failed to fetch user by ID: ${id}, Error: ${error.message}`);
            throw new APIError('Failed to fetch user', httpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateUser(id, adminData) {
        try {
            const existingUser = await this.adminRepository.findById(id); // Fetch all fields
            if (!existingUser) {
                throw new APIError('User not found', httpStatus.NOT_FOUND);
            }
            const convertedData = User.fromDatabase(existingUser);
            const allowedUpdates = { ...convertedData, ...adminData, updatedAt: now };
            delete allowedUpdates.password;
            delete allowedUpdates.hashedPassword;

            const isUpdated = await this.adminRepository.updateUser(allowedUpdates);
            if (isUpdated) {
                logger.info(`User updated successfully. ID: ${id}`);
                return isUpdated;
            } else {
                logger.warn(`Failed to update user. ID: ${id}`);
                return null;
            }

        } catch (error) {
            logger.error(`Admin update failed for user ID ${id}: ${error.message}`);
            throw new APIError('Failed to update user as admin', httpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllUsers(queryParams) {
        try {
            return await this.adminRepository.getAllUsers(queryParams);
        } catch (error) {
            logger.error('Failed to fetch users:', error);
            throw new APIError('Failed to fetch users', httpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateUserRole(userId, newRoleId) {
        try {
            return await this.adminRepository.updateUserRole(userId, newRoleId);
        } catch (error) {
            logger.error('Failed to update user role:', error);
            throw new APIError('Failed to update user role', httpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteUser(id) {
        try {
            if (!id) {
                throw new APIError('User ID is required', httpStatus.BAD_REQUEST);
            }

            const isDeleted = await this.adminRepository.deleteUser(id);
            return isDeleted;
        } catch (error) {
            logger.error(`Failed to delete user. ID: ${id}, Error: ${error.message}`);
            throw new APIError('Failed to delete user', httpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async delete(id, adminId) {
        try {
            // ✅ Only admin can delete users
            const adminCheck = await executeQuery('SELECT role_id FROM secend_users WHERE id = ?', [adminId]);
            if (adminCheck.length === 0 || adminCheck[0].role_id !== 2) {
                throw new Error('UNAUTHORIZED_ACTION');
            }

            const query = 'DELETE FROM secend_users WHERE id = ?';
            const result = await executeQuery(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            logger.error('Failed to delete user:', error);
            throw new Error('Failed to delete user');
        }
    }

    async verifyEmail(token) {
        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await this.userRepository.findById(decoded.id);

        if (!user) throw new Error("User not found");

        user.emailVerified = true;
        await this.userRepository.update(user);

        return user;
    }

    async updateLastLogin(id) {
        try {
            const now = getEthiopiaTime();  // ✅ Get Ethiopian time
            await this.userRepository.update(id, { lastLogin: now });
        } catch (error) {
            logger.error(`Failed to update lastLogin. ID: ${id}, Error: ${error.message}`);
        }
    }

    async authenticate(email, password) {
        try {
            if (!email || !password) {
                throw new APIError({
                    message: 'Email and password are required',
                    status: httpStatus.BAD_REQUEST
                });

                throw new APIError('Email and password are required', httpStatus.BAD_REQUEST);
            }

            const userData = await this.userRepository.findByEmail(email);
            if (!userData || !userData.hashed_password) {
                logger.warn(`Authentication failed for email: ${email}. User not found or password missing.`);
                return null;
            }

            const user = new User({ ...userData, hashedPassword: userData.hashed_password });
            const isMatch = await comparePassword(password, user.hashedPassword);

            if (isMatch) {
                logger.info(`User authenticated successfully: ${email}`);
                return user;
            } else {
                logger.warn(`Authentication failed for email: ${email}. Incorrect password.`);
                return null;
            }
        } catch (error) {
            logger.error(`Authentication failed. Email: ${email}, Error: ${error.message}`);
            return ({ message: error.message, status: error.status });
            throw new APIError('Failed to authenticate user', httpStatus.INTERNAL_SERVER_ERROR);
            return next(new APIError({ message: error.message, status: error.status }));
        }
    }


}

module.exports = AdminService;
