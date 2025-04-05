const express = require('express');
const rateLimit = require('express-rate-limit');
const healthController = require('../../controllers/health.controller');
console.log('health controller is working...');
const router = express.Router();

// ✅ Apply rate limiting to prevent abuse
const healthCheckLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    logger.warn("suspicious thing trying ddos attack user: " + req.user + "trying suspicious by this ip address: " + req.ip);
});


router.get('/health', healthCheckLimiter, healthController.healthCheck);

module.exports = router;
