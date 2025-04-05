const express = require('express');
const { validate } = require('express-validation');
const controller = require('../../controllers/auth.controller.test');
const { register, login, refresh, forgotPassword, resetPassword, oAuth } = require('../../validations/auth.validation');
const auth = require('../../middlewares/auth.middleware');
const ROLES = require('../config/roles');
const router = express.Router();

