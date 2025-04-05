// ======================================================
//                   ADMIN.ROUTE
// ======================================================
// admin.route.js
const express = require('express');
const router = express.Router();
const responseHandler = require('../../helpers/utils/responseHandler');
const auth = require('../../middlewares/auth.middleware');
const cAdmin = require('../../controllers/admin.controller');
