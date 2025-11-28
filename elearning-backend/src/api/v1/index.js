// src/api/v1/index.js

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.route'); 
const messageRouter = require('./message.routes');
const notificationRouter = require('./notification.routes');
const courseRoutes = require('./course.routes'); 
const categoryRoutes = require('./category.routes');
const cartRoutes = require('./cart.route'); 
const favoriteRoutes = require('./favorite.route'); 
const orderRoutes = require('./order.route');  
const promotionRoutes = require('./promotion.route'); 
const reviewRoutes = require('./review.route'); 
const adminRoutes = require('./admin.route'); 
const statsRoutes = require('./stats.route');
const teacherRoutes = require('./teacher.route'); // Import teacher route
const learningRoutes = require('./learning.route'); // Import learning route
const cloudinaryRoutes = require('./cloudinary.route'); // Import cloudinary route
const paymentRoutes = require('./payment.route'); // Import payment route
const vnpayRoutes = require('./vnpay.route'); // Import vnpay route (tương thích ngược)


router.use('/auth', authRoutes);

router.use('/courses', courseRoutes); 

// ... router.use() cho các route khác ...
router.use('/message',messageRouter);
router.use('/notification',notificationRouter);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes); // Sử dụng cart route với tiền tố '/cart'
router.use('/favorites', favoriteRoutes); // Sử dụng favorite route với tiền tố '/favorites'
router.use('/orders', orderRoutes); // Sử dụng order route với tiền tố '/orders'
router.use('/promotions', promotionRoutes); // Sử dụng promotion route với tiền tố '/promotions'
router.use('/reviews', reviewRoutes); // Sử dụng review route với tiền tố '/reviews'
router.use('/admin', adminRoutes); // Sử dụng admin route với tiền tố '/admin'
router.use('/stats', statsRoutes); // Sử dụng stats route với tiền tố '/stats'
router.use('/teacher', teacherRoutes); // Sử dụng teacher route với tiền tố '/teacher'
router.use('/learning', learningRoutes); // Sử dụng learning route với tiền tố '/learning'
router.use('/cloudinary', cloudinaryRoutes); // Sử dụng cloudinary route với tiền tố '/cloudinary'
router.use('/payment', paymentRoutes); // Sử dụng payment route với tiền tố '/payment'
router.use('/vnpay', vnpayRoutes); // Sử dụng vnpay route với tiền tố '/vnpay' (tương thích ngược)

module.exports = router;

