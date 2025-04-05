const { Joi } = require('express-validation');

module.exports = {
    updateProfile: {
        body: Joi.object({
            name: Joi.string().min(3).max(50).optional(),
            phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
            address: Joi.string().min(5).max(100).optional(),
        }),
    },

    createProduct: {
        body: Joi.object({
            name: Joi.string().min(3).max(100).required(),
            price: Joi.number().min(0).required(),
            stock: Joi.number().integer().min(0).required(),
            description: Joi.string().max(500).optional(),
            category: Joi.string().required(),
        }),
    },

    updateProduct: {
        body: Joi.object({
            name: Joi.string().min(3).max(100).optional(),
            price: Joi.number().min(0).optional(),
            stock: Joi.number().integer().min(0).optional(),
            description: Joi.string().max(500).optional(),
            category: Joi.string().optional(),
        }),
    },

    validateProductId: {
        params: Joi.object({
            productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        }),
    },

    validateId: {
        params: Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        }),
    },
};
