const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const { validate, ValidationError } = require('express-validation');
const routes = require('../api/routes/v1');
const logger = require('./logger');
const { logs, env, enableCsrf, sessionSecret } = require('./vars'); // Import variables from vars.js
const error = require('../api/middlewares/error');
const passport = require('passport').stratagy();

const app = express();

// Logging only in development
if (env === 'development') {
    app.use(morgan(logs));
}

app.use(passport())

// Secure HTTP Headers
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", 'trusted-cdn.com'],
                styleSrc: ["'self'", 'fonts.googleapis.com'],
                imgSrc: ["'self'", 'data:', 'trusted-cdn.com'],
                fontSrc: ["'self'", 'fonts.gstatic.com'],
                connectSrc: ["'self'", 'api.yourdomain.com'],
            },
        },
        hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }, // Enforce HTTPS
        xssFilter: true, // Prevent XSS
        noSniff: true, // Prevent MIME sniffing
        frameguard: { action: 'deny' }, // Prevent Clickjacking
        referrerPolicy: { policy: 'same-origin' },
    })
);

// Body parsing (limit payload size)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Compression for performance
app.use(compression());

// Allows PUT & DELETE where unsupported
app.use(methodOverride());

// CORS settings (restricts access in production)
const corsOptions = {
    origin: env === 'production' ? 'http://yourdomain.com' : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
app.use(cors(corsOptions));

// Rate limiting (global and stricter for auth routes)
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Too many login attempts, try again later.' });

app.use('/api/v1/auth', authLimiter); // Stricter rate limiting for auth routes

// CSRF Protection (Disabled if explicitly set in .env)
app.use(cookieParser());
if (env === 'production' && enableCsrf !== 'false') {
    app.use(csrf({ cookie: true }));
}

// Secure Session Storage
app.use(
    session({
        secret: sessionSecret || 'fallback-secret', // Use sessionSecret from vars.js
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: env === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            sameSite: 'strict',
        },
    })
);

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Mount API Routes
app.use('/api/v1', routes);

// Custom Test Routes (For Dev/Test Only)
// if (env === 'test') {
//     app.get('/api/v1/test-route', (req, res) => res.status(200).json({ message: 'Test route works!' }));
//     app.post('/api/v1/test-route', (req, res) => res.status(200).json({ message: 'POST request works!', data: req.body }));
// }

// Global Error Handling Middleware (Handles 404 and other errors)
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`, { stack: err.stack });

    if (err instanceof ValidationError) {
        return res.status(400).json({ error: err.message || "Validation Error" });
    }

    if (err.name === "UnauthorizedError") {
        return res.status(401).json({ error: "Unauthorized: Invalid token or missing headers" });
    }

    if (err.code === "EBADCSRFTOKEN") {
        return res.status(403).json({ error: "CSRF Token Invalid" });
    }

    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

// Use custom error handling middleware
app.use(error.converter);
app.use(error.handler);

module.exports = app;
