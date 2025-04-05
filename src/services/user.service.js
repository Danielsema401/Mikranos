// src/services/user.service.js
const httpStatus = require('http-status');
const APIError = require('../errors/api-error');
const logger = require('../config/logger');
const repo = require('../models/user.model');
const UserDto = require('../dto/user.dto');
const RefreshToken = require('../models/refreshToken.model');
const { generateToken } = require('./generateTokenResponse.service');
const { hashPassword, comparePassword } = require('../helpers/auth.helper');
const { omitFields, generateUUID, isValidEmail } = require('../utils/index');
const moment = require('moment-timezone');


class UserService {
    constructor(userModel) {
        this.userModel = userModel;
    }

    async createUser(userData) {
        try {
            const requiredFields = ['firstName', 'lastName', 'password', 'email', 'phone'];
            for (const field of requiredFields) {
                if (!userData[field]) {
                    throw new APIError(`${field} is required`, httpStatus.BAD_REQUEST);
                }
            }

            const hashedPassword = await hashPassword(userData.password);

            const user = new UserDto({
                ...userData,
                id: generateUUID(),
                hashedPassword,
                roleId: 3,
                status: 'pending',
                createdAt: this.getCurrentTime(),
                updatedAt: null,
            });

            const existingUser = await this.userModel.findByEmail(user.email);
            if (existingUser) {
                throw new APIError('Email already exists', httpStatus.CONFLICT);
            }

            const savedUser = UserDto.fromDatabase(await this.userModel.save(user));
            const token = generateToken(savedUser.id);
            const refreshToken = await RefreshToken.generate(savedUser);

            // Omit sensitive fields from response
            const userResponse = omitFields(savedUser, ['password', 'hashedPassword', 'verificationToken']);

            return {
                user: userResponse,
                token,
                refreshToken: refreshToken.token
            };
        } catch (error) {
            logger.error(`Failed to create user. Email: ${userData.email}, Error: ${error.message}`);
            throw new APIError('Database error occurred', httpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getUserByEmail(email) {
        try {
            if (!email) {
                throw new APIError('User Email is required', httpStatus.BAD_REQUEST);
            }
            const userData = await this.userModel.findByEmail(email);
            if (!userData) {
                logger.warn(`User not found with ID: ${email}`);
                return null;
            }
            return UserDto.fromDatabase(userData);
        } catch (error) {
            logger.error(`Failed to fetch user by Email: ${email}, Error: ${error.message}`);
            throw new APIError('Failed to fetch user', httpStatus.INTERNAL_SERVER_ERROR);
        }
    };
   async  getUserById(id) {
       try {
           if (!id) {
               throw new APIError('User ID is required', httpStatus.BAD_REQUEST);
           }
           const userData = UserDto.fromDatabase(await this.userModel.findById(id));
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

    async updateUser(id, userData) {
        try {
            const existingUser = await this.userModel.findById(id);
            if (!existingUser) {
                throw new APIError('User not found', httpStatus.NOT_FOUND);
            }

            // Convert from snake_case (DB) to camelCase (User object)
            const user = User.fromDatabase(existingUser);

            // Only update allowed fields
            const allowedUpdates = { ...user, ...userData, updatedAt: this.getCurrentTime() };

            // Ensure restricted fields are NOT modified
            const restrictedFields = [
                'roleId', 'status', 'emailVerified', 'verificationToken',
                'resetPasswordToken', 'resetPasswordExpires', 'lastLogin',
                'twoFaSecret', 'twoFaVerified', 'sellerRequestStatus', 'password',
                'hashedPassword'
            ];

            restrictedFields.forEach(field => delete allowedUpdates[field]);

            // Apply updates
            user.update(allowedUpdates);

            const newUser = new UserDto({ ...allowedUpdates });
            const isUpdated = await this.userModel.updateUser(newUser);

            if (isUpdated) {
                logger.info(`User updated successfully. ID: ${id}`);
                return user;
            } else {
                logger.warn(`Failed to update user. ID: ${id}`);
                return null;
            }
        } catch (error) {
            logger.error(`User update failed for ID ${id}: ${error.message}`);
            throw new APIError('Failed to update user', httpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async authenticate(email, password) {
        try {
            if (!email || !password) {
                throw new APIError('Email and password are required', httpStatus.BAD_REQUEST);
            }

            const userData = await this.userModel.findByEmail(email);
            if (!userData || !userData.hashedPassword) {
                logger.warn(`Authentication failed for email: ${email}. User not found or password missing.`);
                return null;
            }

            const isMatch = await comparePassword(password, userData.password);
            if (isMatch) {
                logger.info(`User authenticated successfully: ${email}`);
                return new UserDto({ ...userData });
            } else {
                logger.warn(`Authentication failed for email: ${email}. Incorrect password.`);
                return null;
            }
        } catch (error) {
            logger.error(`Authentication failed. Email: ${email}, Error: ${error.message}`);
            throw new APIError('Failed to authenticate user', httpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAndGenerateToken({ email, password, refreshObject }) {
        if (!email) throw new APIError('An email is required to generate a token');

        const user = await this.userModel.findByEmail(email);
        if (!user) throw new APIError('Incorrect email or password', httpStatus.UNAUTHORIZED);

        if (password && await this.passwordMatches(password, user.hashedPassword)) {
            return { user, accessToken: this.generateToken(user.id) };
        }

        if (refreshObject && refreshObject.userEmail === email) {
            if (moment(refreshObject.expires).isBefore()) {
                throw new APIError('Invalid refresh token.', httpStatus.UNAUTHORIZED);
            }
            return { user, accessToken: this.generateToken(user.id) };
        }

        throw new APIError('Incorrect email or refreshToken', httpStatus.UNAUTHORIZED);
    }

    async passwordMatches(inputPassword, storedPassword) {
        return comparePassword(inputPassword, storedPassword);
    }

async generateTokenResponse(user, accessToken) {
    try {
        const refreshToken = await RefreshToken.generate(user);

        return {
            tokenType: 'Bearer',
            accessToken,
            refreshToken: refreshToken.token,
            expiresIn: Math.floor(Date.now() / 1000) + jwtExpirationInterval * 60, // Unix timestamp
        };
    } catch (error) {
        logger.error('Failed to generate token response:', error);
        throw new APIError('Failed to generate token response', httpStatus.INTERNAL_SERVER_ERROR, true);
    }
}

    generateToken(userId) {
        const payload = {
            exp: moment().add(jwtExpirationInterval, 'minutes').unix(),
            iat: moment().unix(),
            sub: userId,
        };
        return jwt.encode(payload, jwtSecret);
    }

    getCurrentTime() {
        return moment().tz("Africa/Addis_Ababa").format("YYYY-MM-DD HH:mm:ss A");
    }

    checkDuplicateEmail(error) {
        if (error.name === 'Duplicate') {
            return new APIError({
                message: 'Validation Error',
                errors: [{
                    field: 'email',
                    location: 'body',
                    messages: ['"email" already exists'],
                }],
                status: httpStatus.CONFLICT,
                isPublic: true,
                stack: error.stack,
            });
        }
        return error;
    }

    async list({ page = 1, perPage = 30, name, email, role }) {
        const offset = (page - 1) * perPage;
        let query = 'SELECT * FROM users WHERE 1';
        const params = [];
        if (name) { query += ' AND name LIKE ?'; params.push(`%${name}%`); }
        if (email) { query += ' AND email LIKE ?'; params.push(`%${email}%`); }
        if (role) { query += ' AND role = ?'; params.push(role); }
        query += ' ORDER BY created_at DESC LIMIT ?, ?';
        params.push(offset, perPage);

        const [rows] = await db.execute(query, params);
        return rows;
    }

    transform(data) {
        const newUser = new UserDto({ ...data });
        return newUser.toJSON();
    }
}


module.exports = new UserService(repo);







/////////////////////////////////////////////
