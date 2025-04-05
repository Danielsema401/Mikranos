const express = require('express');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const routes = require('../routes/v1');
const logger = require('./logger');
const { logs, env } = require('./vars');
const responseHandler = require('../helpers/utils/responseHandler');
const error = require('../middlewares/error');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

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
const { logs, env } = require('./vars');
const error = require('../api/middlewares/error');

const app = express();


// Set security-related HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Compress response bodies
app.use(compression());

// Logging only in development
if (env === 'development') {
    app.use(morgan(logs));
}

// Body parsing (limit payload size)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));


// Logging only in development
if (env === 'development') {
    app.use(morgan(logs));
}

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
if (env === 'test') {
    app.get('/api/v1/test-route', (req, res) => res.status(200).json({ message: 'Test route works!' }));
    app.post('/api/v1/test-route', (req, res) => res.status(200).json({ message: 'POST request works!', data: req.body }));
}


// Global Error Handling Middleware (Handles 404 and other errors)
app.use((err, req, res, next) => {
    console.error("Error:", err); // Log all errors

    // Handle validation errors (specific case)
    if (err.name === "ValidationError") {
        return res.status(400).json({ error: err.message || "Validation Error" });
    }

    // Handle UnauthorizedError (from JWT or similar authentication)
    if (err.name === "UnauthorizedError") {
        return res.status(401).json({ error: "Unauthorized: Invalid token or missing headers" });
    }

    // Handle CSRF Token errors
    if (err.code === "EBADCSRFTOKEN") {
        return res.status(403).json({ error: "CSRF Token Invalid" });
    }

    // Handle 404 Not Found
    if (err.status === 404) {
        return res.status(404).json({ error: 'Not Found' });
    }

    // For all other errors, return a 500 Internal Server Error
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

// Use error converter and handler for custom error handling
app.use(error.converter);
app.use(error.handler);



// Serve Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount API Routes
app.use('/api/v1', routes);

// Handle 404 errors (Route not found)
app.use((req, res, next) => {
    if (req.accepts('html')) {
        return res.status(404).render('errors/404', { title: 'Page Not Found' });
    }

    res.status(404).json({ success: false, error: 'Not Found' });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message} | Status: ${err.status || 500}`);

    if (req.accepts('html')) {
        return res.status(err.status || 500).render('errors/500', { title: 'Error', message: err.message });
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

// Use custom error handling middleware
app.use(error.converter);
app.use(error.handler);
app.use(error.notFound);

module.exports = app;
