const { Joi } = require('express-validation');

// ✅ Validate ID (ensure it's a number and required)
const validateId = {
    params: Joi.object({
        id: Joi.number().integer().required().messages({
            'number.base': 'User ID must be a number',
            'any.required': 'User ID is required',
        }),
    }),
};

// ✅ Validate updating user profile (only name and email allowed)
const updateProfile = {
    body: Joi.object({
        name: Joi.string().min(3).max(50).optional().messages({
            'string.min': 'Name must be at least 3 characters',
            'string.max': 'Name cannot exceed 50 characters',
        }),
        email: Joi.string().email().optional().messages({
            'string.email': 'Invalid email format',
        }),
    }),
};

// ✅ Validate updating user status (must be active/inactive)
const updateStatus = {
    body: Joi.object({
        status: Joi.string().valid('active', 'inactive').required().messages({
            'any.only': 'Status must be either active or inactive',
            'any.required': 'Status is required',
        }),
    }),
};

module.exports = {
    validateId,
    updateProfile,
    updateStatus,
};
