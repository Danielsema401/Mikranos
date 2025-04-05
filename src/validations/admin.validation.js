const { Joi } = require('express-validation');

module.exports = {
    updateUserStatus: {
        body: Joi.object({
            status: Joi.string().valid('active', 'inactive', 'banned').required(),
        }),
    },

    validateUserId: {
        params: Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        }),
    },

    updateSellerStatus: {
        body: Joi.object({
            status: Joi.string().valid('approved', 'pending', 'rejected').required(),
        }),
    },

    validateSellerId: {
        params: Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        }),
    },

    updateOrderStatus: {
        body: Joi.object({
            status: Joi.string().valid('pending', 'shipped', 'delivered', 'canceled').required(),
        }),
    },

    validateOrderId: {
        params: Joi.object({
            orderId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        }),
    },
};
