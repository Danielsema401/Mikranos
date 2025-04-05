//===============================================
//                  INDEX.JS
//===============================================

const express = require('express');
const router = express.Router();
// Import individual route files
const authRoutes = require('./auth.route');           // /auth     import
const productRoutes = require('./product.route');    // /product  import
const healthRoutes = require('./health.route');     // /health   import
const userRoutes = require('./user.route');        // /user     import
const sellerRoutes = require('./seller.route');   // /seller   import
const adminRoutes = require('./admin.route');    // /admin   import
const carrier = require('./carrier.route');
const qrCode = require('./qrCode.route');
const googleMap = require('./googleMap.route');
const ;

// Mount routes under /api/v1
router.use(healthRoutes);                  // /api/v1/health
router.use('/auth', authRoutes);          // /api/v1/auth
router.use('/users', userRoutes);        // /api/v1/users
router.use('/products', productRoutes); // /api/v1/products
router.use('/seller', sellerRoutes);   // /api/v1/seller
router.use('/admin',adminRoutes);     // /api/v1/admin


module.exports = router;
















// ////////////////////////////////////////////////////////////////

// router.get('/test', (req, res) => {
//     res.status(200).json({ message: 'Test route is working...' });
// });

// router.post('/test', (req, res) => {
//         res.status(201).json({ message: 'POST request successful', data: req.body });
// });

// // // Protected route (requires authentication & authorization)
// // router.get('/protected-route',
// //     auth.authenticate,
// //     auth.authorize([auth.ROLES.ADMIN]),
// //     (req, res) => {
// //         res.status(200).json({ message: 'Protected route access granted' });
// //     });

// // // Global Error Simulation Route (For Debugging)
// router.get('/cause-error', (req, res, next) => {
//     next(new Error('Test error'));
// });

// module.exports = router;
