const axios = require('axios');
const shortId = require('shortid');

const uniqueId = shortId.generate(); // Generate unique short ID
const BASE_URL = 'http://localhost:5000/api/v1/auth';

async function testAuth() {
    try {
        console.log('🔹 Registering user processing......');
        const registerResponse = await axios.post(`${BASE_URL}/register`, {
            id: '  user123 ',
            firstName: 'TestUser',
            lastName: 'Axios',
            email: `test${uniqueId}@gmail.com`,
            phone: '(+251) 911-234-567',
            password: 'pass123',
            status: 'active',
            emailVerified: 'true',
            updatedAt: `${2025 - 05 - 2}`,
            roleId: 2,

            // firstName: ' <script>alert("XSS")</script> ',
            // lastName: ' DROP TABLE users; ',
            // email: ' BAD@EXAMPLE.COM ',
            // address: ' Addis <b>Ababa</b> ',
            // roleId: 'admin',
            // emailVerified: 'yes',
            verificationToken: '  token123 ',
            token: '   auth_token ',
            refreshTokenExpires: 'not a date',
            lastLogin: new Date(),
            twoFaSecret: ' secret_key ',
            twoFaVerified: 'maybe',
            profilePictureUrl: 'javascript:alert("XSS")',
            dateOfBirth: '2000-01-01',
            biography: '<img src=x onerror=alert("XSS")>',
            sellerRequestStatus: 'pending',
            createdAt: 'invalid date',
            updatedAt: new Date(),
            someHackerField: '<evil></evil>', // unexpected
            password: '123456', // unknown, sensitive
            urlInjection: 'https://google.com/<script>alert(1)</script>'
        });

        console.log("\x1b[34m '✅ Register Success:', registerResponse.data \x1b[0m");

        // console.log('🔹 Logging in user...');
        // const loginResponse = await axios.post(`${BASE_URL}/login`, {
        //     email: `test${uniqueId}@gmail.com`,
        //     password: 'pass123',
        // });

        // console.log('✅ Login Success:', loginResponse.data);
        // const { accessToken, refreshToken } = loginResponse.data.token;

        // console.log('🔹 Refreshing token...');
        // const refreshResponse = await axios.post(`${BASE_URL}/refresh-token`, {
        //     refreshToken,
        // });

        // console.log('✅ Refresh Token Success:', refreshResponse.data);

    } catch (error) {
        console.error("\x1b[31m '❌ Error:', error.message \x1b[0m");// error.response.data || error.message);
    }
}

testAuth();










/////
// -- Roles Table
// CREATE TABLE `roles` (
//     `id` VARCHAR(36) PRIMARY KEY,
//     `role_name` VARCHAR(50) UNIQUE NOT NULL
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

// -- Permissions Table
// CREATE TABLE `permissions` (
//     `id` VARCHAR(36) PRIMARY KEY,
//     `permission_name` VARCHAR(100) UNIQUE NOT NULL
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

// -- Users Table
// CREATE TABLE `users` (
//     `id` VARCHAR(36) PRIMARY KEY,
//     `first_name` VARCHAR(100) NOT NULL,
//     `last_name` VARCHAR(100) NOT NULL,
//     `email` VARCHAR(100) UNIQUE NOT NULL,
//     `hashed_password` VARCHAR(255) NOT NULL,
//     `phone` VARCHAR(20) DEFAULT NULL,
//     `role_id` VARCHAR(36) NOT NULL,
//     `status` ENUM('active', 'inactive', 'pending', 'blocked') DEFAULT 'pending',
//     `email_verified` TINYINT(1) UNSIGNED DEFAULT 0,
//     `verification_token` VARCHAR(255) DEFAULT NULL,
//     `reset_password_token` VARCHAR(255) DEFAULT NULL,
//     `reset_password_expires` DATETIME DEFAULT NULL,
//     `last_login` DATETIME DEFAULT NULL,
//     `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     `two_fa_secret` VARCHAR(255) DEFAULT NULL,
//     `two_fa_verified` TINYINT(1) UNSIGNED DEFAULT 0,
//     `profile_picture_url` VARCHAR(255) DEFAULT NULL,
//     `date_of_birth` DATE DEFAULT NULL,
//     `seller_request_status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
//     FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
//     INDEX (`email`),
//     INDEX (`status`),
//     INDEX (`role_id`)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

// -- Addresses Table
// CREATE TABLE `addresses` (
//     `id` VARCHAR(36) PRIMARY KEY,
//     `user_id` VARCHAR(36) NOT NULL,
//     `street_address` VARCHAR(100) DEFAULT NULL,
//     `apartment_number` VARCHAR(50) DEFAULT NULL,
//     `city` VARCHAR(50) DEFAULT NULL,
//     `state_province` VARCHAR(50) DEFAULT NULL,
//     `postal_code` VARCHAR(20) DEFAULT NULL,
//     `country` VARCHAR(50) DEFAULT NULL,
//     FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
//     INDEX (`user_id`)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

// -- Role Permissions Table
// CREATE TABLE `role_permissions` (
//     `role_id` VARCHAR(36) NOT NULL,
//     `permission_id` VARCHAR(36) NOT NULL,
//     PRIMARY KEY (`role_id`, `permission_id`),
//     FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
//     FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

// -- Sellers Table (User must exist before becoming a seller)
// CREATE TABLE `sellers` (
//     `user_id` VARCHAR(36) PRIMARY KEY,
//     `business_name` VARCHAR(100) NOT NULL,
//     `business_address` VARCHAR(100) NOT NULL,
//     `business_phone` VARCHAR(20) NOT NULL,
//     `business_email` VARCHAR(100) NOT NULL UNIQUE,
//     `business_description` TEXT,
//     `verification_documents_url` VARCHAR(255) DEFAULT NULL,
//     `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

// -- User Tokens Table (Supports multiple tokens per user)
// CREATE TABLE `user_tokens` (
//     `id` VARCHAR(36) PRIMARY KEY,
//     `user_id` VARCHAR(36) NOT NULL,
//     `refresh_token` VARCHAR(255) NOT NULL,
//     `expires_at` DATETIME NOT NULL,
//     FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
//     INDEX (`user_id`)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


