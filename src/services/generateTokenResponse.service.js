// service/generateTokenResponse.service.js
const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const RefreshToken = require('../models/refreshToken.model');
const APIError = require('../errors/api-error');
const logger = require('../config/logger');
const { jwtSecretKey, jwtExpirationInterval } = require('../config/vars');
const moment = require('moment-timezone');

async function generateTokenResponse(user) {
  try {
    if (!user || !user.id) {
      throw new APIError('Invalid user data', httpStatus.BAD_REQUEST);
    }

    const accessToken = generateToken(user.id);
    const refreshToken = await RefreshToken.generate(user);

    return {
      tokenType: 'Bearer',
      accessToken,
      refreshToken: refreshToken.token,
      expiresIn: moment().add(jwtExpirationInterval, 'minutes').unix(),
      userId: user.id // Changed from _id to id for consistency
    };
  } catch (error) {
    logger.error('Failed to generate token response:', error);
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to generate token response', httpStatus.INTERNAL_SERVER_ERROR, true);
  }
}

function generateToken(userId) {
  if (!userId) {
    throw new APIError('User ID is required', httpStatus.BAD_REQUEST);
  }

  return jwt.sign(
    {
      sub: userId,
      iat: moment().unix(),
      exp: moment().add(jwtExpirationInterval, 'minutes').unix()
    },
    jwtSecretKey
  );
}

module.exports = { generateToken, generateTokenResponse };
/**
 * const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken.model');

class RefreshTokenService {
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
 */
