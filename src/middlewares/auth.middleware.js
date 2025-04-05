// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const APIError = require('../errors/api-error');
const logger = require('../config/logger');
const { jwtSecretKey } = require('../config/vars');
const userService = require('../services/user.service');
const passport = require('passport');

// Helper function to extract token from the Authorization header
const extractToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new APIError({
      message: 'No token provided or invalid format',
      status: httpStatus.UNAUTHORIZED,
      isPublic: true,
    });
  }
  return authHeader.split(' ')[1];
};

// Middleware to authenticate users using JWT
exports.authenticate = async (req, res, next) => {
  try {
      const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
    // Security: Multi-layer validation
    const decoded = JwtService.verifyToken(token);
    req.user = await User.findById(decoded.userId);

    // Security: Check token version against user (for invalidation)
    if (decoded.tokenVersion !== req.user.tokenVersion) {
      throw new Error('Token revoked');
    }
    const token = extractToken(req.headers.authorization);

    const decoded = jwt.verify(token, jwtSecretKey);

    // Fetch user from the database using the UserService
    const user = await userService.getUserById(decoded.id);
    console.log(user);
    if (!user || user.status !== 'active') {
      throw new APIError({
        message: 'User not found or account is inactive',
        status: httpStatus.UNAUTHORIZED,
        isPublic: true,
      });
    }

    // // Attach the user object to the request
    req.user = user; // Use the transform method to return a clean user object
    next();
    // console.log(user)
  } catch (err) {
    logger.error(`JWT Authentication Error: ${err.name} - ${err.message}`);

    let errorMessage = 'Invalid token';
    let statusCode = httpStatus.UNAUTHORIZED;

    if (err instanceof jwt.TokenExpiredError) {
      errorMessage = 'Token has expired';
    } else if (err instanceof jwt.JsonWebTokenError) {
      errorMessage = 'Malformed or invalid token';
    }

    next(new APIError({
      message: errorMessage,
      status: statusCode,
      isPublic: true,
    }));
  }
};

// Middleware to authorize users based on roles
exports.authorize = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) {
    return next(new APIError({
      message: 'Unauthorized access',
      status: httpStatus.UNAUTHORIZED,
      isPublic: true,
    }));
  }

  if (!Array.isArray(allowedRoles) || !allowedRoles.includes(req.user.roleId)) {
    logger.warn(`Unauthorized access attempt: ${req.method} ${req.originalUrl} by User ID ${req.user.id}, IP: ${req.ip}`);
    return next(new APIError({
      message: 'Forbidden access due to insufficient roles',
      status: httpStatus.FORBIDDEN,
      isPublic: true,
    }));
  }

  next();
};

// Middleware to enforce email verification
exports.ensureEmailVerified = (req, res, next) => {
  if (!req.user || !req.user.emailVerified) {
    return next(new APIError({
      message: 'Please verify your email to access this resource',
      status: httpStatus.FORBIDDEN,
      isPublic: true,
    }));
  }

  next();
};

// Middleware to enforce Two-Factor Authentication (2FA)
exports.ensure2FA = (req, res, next) => {
  if (req.user && req.user.twoFaVerified !== undefined && !req.user.twoFaVerified) {
    return next(new APIError({
      message: 'Two-factor authentication required to access this resource',
      status: httpStatus.FORBIDDEN,
      isPublic: true,
    }));
  }

  next();
};

// Export roles for use in other parts of the application
exports.ROLES = require('../config/roles');
