const Joi = require('joi');

module.exports = {
  // POST /v1/auth/register
  register: {
    body: Joi.object({
      first_name: Joi.string()
        .required()
        .messages({
          'string.empty': 'Name is required',
          'any.required': 'Name is required',
        }),
      last_name: Joi.string()
        .required()
        .messages({
          'string.empty': 'Name is required',
          'any.required': 'Name is required',
        }),
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Email must be a valid email address',
          'string.empty': 'Email is required',
          'any.required': 'Email is required',
        }),
      password: Joi.string()
        .required()
        .min(6)
        .max(128)
        .messages({
          'string.min': 'Password must be at least 6 characters long',
          'string.max': 'Password cannot be longer than 128 characters',
          'string.empty': 'Password is required',
          'any.required': 'Password is required',
        }),
      phone: Joi.string()
        .required()
        .pattern(/^\+251\d{9}$/)
        .messages({
          'string.pattern.base': 'Phone must be a valid Ethiopian number starting with +251 followed by 9 digits',
          'string.empty': 'Phone is required',
          'any.required': 'Phone is required',
        }),
    }),
  },
/**
 * const Joi = require('joi');
const { passwordStrength } = require('check-password-strength');

const schema = Joi.object({
  email: Joi.string().email().disallow({
    // Block disposable emails
    options: ['tempmail.org', 'mailinator.com'],
    is: true
  }).required(),
  password: Joi.string().custom((value, helpers) => {
    if (passwordStrength(value).id < 2) { // Minimum "medium" strength
      return helpers.error('password.weak');
    }
    return value;
  }).required(),
  phone: Joi.string().pattern(/^\+[1-9]\d{1,14}$/), // E.164 format
  acceptTerms: Joi.boolean().valid(true).required()
}).options({ abortEarly: false });

module.exports = schema;
 */
  // POST /v1/auth/login
  login: {
    body: Joi.object({
      email: Joi.string()
        .email()
        .optional()
        .messages({
          'string.email': 'Email must be a valid email address',
        }),
      phone: Joi.string()
        .pattern(/^\+251\d{9}$/)
        .optional()
        .messages({
          'string.pattern.base': 'Phone must be a valid Ethiopian number starting with +251 followed by 9 digits',
        }),
      password: Joi.string()
        .required()
        .max(128)
        .messages({
          'string.max': 'Password cannot be longer than 128 characters',
          'string.empty': 'Password is required',
          'any.required': 'Password is required',
        }),
    })
      .xor('email', 'phone')
      .messages({
        'object.xor': 'Either email or phone must be provided, but not both'
      }),
  },
};
