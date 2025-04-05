const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { jwtSecretKey, jwtExpirationInterval } = require('../config/vars');
const service = require('./user.service');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const RefreshToken = require('../models/RefreshToken.model');

class AuthService {
    static async register(userData, ipAddress) {
        // 1. Fraud check
        const fraudCheck = await FraudDetection.checkRisk(userData.email, ipAddress);
        if (fraudCheck.isSuspicious) {
            throw new Error('Registration requires verification');
        }

        // 2. Hash password (with cost factor 12)
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        // 3. Create user
        const user = await User.create({
            id: uuidv4(),
            email: userData.email,
            password: hashedPassword,
            status: 'pending_verification',
            registrationIp: ipAddress,
            metadata: {
                // Encrypted PII
                phone: SecurityUtil.encrypt(userData.phone)
            }
        });

        // 4. Generate verification token (JWT with 24h expiry)
        const verificationToken = VerificationService.generateToken(user.id);

        // 5. Audit log
        await AuditLog.registration(user.id, ipAddress);

        return {
            user: User.sanitize(user),
            verificationToken,
            requiresCaptcha: fraudCheck.risks.includes('high_velocity')
        };
    }

    static async login(email, password) {
        // 1. Validate user exists
        const user = await service.findByEmail(email);
        if (!user) throw new Error('User not found');

        // 2. Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new Error('Invalid credentials');

        // 3. Generate JWT (access token)
        const accessToken = jwt.sign({ userId: user.id }, jwtSecretKey, { expiresIn: jwtExpirationInterval });

        // 4. Generate & store refresh token (using your RefreshToken class)
        const refreshToken = await RefreshToken.generate(user);

        return { accessToken, refreshToken };
    }

    static async generate(user, ipAddress) {
        const token = crypto.randomBytes(64).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

        return await RefreshToken.create({
            token,
            userId: user.id,
            expiresAt,
            createdByIp: ipAddress,
            isActive: true
        });
    }

    static async revoke(token, ipAddress) {
        return await RefreshToken.invalidate(token, ipAddress);
    }

}

//==============Generate jwt access and refresh tokens==============
// #/services/authSerivces.js // handle jwt signing with jwt access secret
// #/services/authServices.js // handles refresh token signing with jwtKey

//==============Store refresh tokens in database=====================
// #/models/refreshTokenModle.js //save tokens in mysql for security.

//==============Verify access token==============
// #/middlewares/authmiddleware.js // middleware to protect routes
//==============Handle token refresh login==============
// #/controllers/authController.js // Check rifresh and new access token
//==============Authenticate user login==============
// #/controllers/authController.js  // Validates user and jwt token
//==============Define Api routes==============
// #/routes/authRoutes.js //Maps endpoints like/login, refresh/

// const jwt = require('jsonwebtoken');
// const { jwt_access_secret, jwt_refresh_secret } = require('../config/vars');

// function generateAccessToken(user) {
//     return jwt.sign({ id: user.id, role: user.role }, jwt_access_secret, { expiresIn: "15m" });
// }

// function generateRefreshToken(user) {
//     return jwt.sign({ id: user.id }, jwt_refresh_secret, { expiresIn: '7d' });
// }

// module.exports = { generateAccessToken, generateRefreshToken };


