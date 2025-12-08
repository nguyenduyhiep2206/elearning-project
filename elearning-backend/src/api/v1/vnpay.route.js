const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/payment.controller');

// Route tương thích ngược: /api/v1/vnpay/return -> redirect về payment controller
// GET /api/v1/vnpay/return - VNPay redirect về (không cần auth)
router.get('/return', paymentController.vnpayReturn);

// GET/POST /api/v1/vnpay/ipn - VNPay IPN callback (không cần auth)
router.get('/ipn', paymentController.vnpayIpn);
router.post('/ipn', paymentController.vnpayIpn);

module.exports = router;

