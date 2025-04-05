//===============================================
//                  INDEX.JS
//===============================================

const express = require('express');
const router = express.Router();
// Import individual route files
const authRoutes = require('./auth.route');           // /auth
const productRoutes = require('./product.route');    // /products
const healthRoutes = require('./health.route');     // /health
const userRoutes = require('./user.route');        // /users
const sellerRoutes = require('./seller.route');   // /sellers
const adminRoutes = require('./admin.route');    // /admin
const carrierRoutes = require('./carrier.route'); // /carriers
const qrCodeRoutes = require('./qrCode.route');   // /qrcode
const googleMapRoutes = require('./googleMap.route'); // /googlemap
const orderRoutes = require('./order.route');      // /orders
const paymentRoutes = require('./payment.route');  // /payments
const reviewRoutes = require('./review.route');    // /reviews
const notificationRoutes = require('./notification.route'); // /notifications
const inventoryRoutes = require('./inventory.route'); // /inventory
const supportRoutes = require('./support.route'); // /support
const analyticsRoutes = require('./analytics.route'); // /analytics
const promotionRoutes = require('./promotion.route'); // /promotions
const wishlistRoutes = require('./wishlist.route'); // /wishlist

// Mount routes under /api/v1
router.use(healthRoutes);                  // /api/v1/health
router.use('/auth', authRoutes);          // /api/v1/auth
router.use('/users', userRoutes);        // /api/v1/users
router.use('/products', productRoutes); // /api/v1/products
router.use('/sellers', sellerRoutes);   // /api/v1/sellers
router.use('/admin', adminRoutes);     // /api/v1/admin
router.use('/carriers', carrierRoutes); // /api/v1/carriers
router.use('/qrcode', qrCodeRoutes);   // /api/v1/qrcode
router.use('/googlemap', googleMapRoutes); // /api/v1/googlemap
router.use('/orders', orderRoutes);    // /api/v1/orders
router.use('/payments', paymentRoutes); // /api/v1/payments
router.use('/reviews', reviewRoutes);  // /api/v1/reviews
router.use('/notifications', notificationRoutes); // /api/v1/notifications
router.use('/inventory', inventoryRoutes); // /api/v1/inventory
router.use('/support', supportRoutes); // /api/v1/support
router.use('/analytics', analyticsRoutes); // /api/v1/analytics
router.use('/promotions', promotionRoutes); // /api/v1/promotions
router.use('/wishlist', wishlistRoutes); // /api/v1/wishlist

module.exports = router;
