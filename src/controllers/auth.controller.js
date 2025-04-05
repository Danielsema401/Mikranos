// ======================================================
//               AUTH.CONTROLLER
// ======================================================
const httpStatus = require('http-status');
const AuthResponseDTO = require('../dtos/auth-response.dto');
const RegisterDTO = require('../dtos/register.dto');
const service = require('../services/user.service');
const logger = require('../config/logger');
const httpStatus = require('http-status');
const moment = require('moment-timezone');
const { omit } = require('lodash');
const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const PasswordResetToken = require('../models/passwordResetToken.model');
const { jwtExpirationInterval } = require('../config/vars');
const APIError = require('../errors/api-error');
const emailProvider = require('../services/email.service');

exports.register = async (req, res, next) => {
    try {
        // 1. Data Validation
        const userData = new RegisterDTO(req.body);

        // 2. Business Logic Delegation
        const { user, auth } = await service.registerUser(userData);

        // 3. Response Formatting
        const response = AuthResponseDTO.format(user, auth);

        // 4. Send Response
        res.status(httpStatus.CREATED).json(response);

        // 5. Side Effects (non-blocking)
        // await sendVerificationEmail(user); // Extracted to separate function
        // Generate the refresh token
const refreshToken = await RefreshToken.generate(newUser);

// Send a welcome email
const emailSubject = 'Welcome to Yegna!';
const emailHtml = `<p>Hi ${newUser.name},</p><p>Welcome to Yegna!</p>`;
await sendEmail(newUser.email, emailSubject, emailHtml);


    } catch (error) {
        logger.error(`Registration error: ${error.message}`, {
            email: req.body.email,
            stack: error.stack
        });
        next(error);
    }
};
