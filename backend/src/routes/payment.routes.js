// routes/payment.routes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/payment.controller');
const { protect } = require('../../middlewares/auth.middleware');

router.post('/initiate', protect, paymentController.initiatePayment);
router.get('/', protect, paymentController.getPayments);
router.get('/status/:paymentId', protect, paymentController.getPaymentStatus);

module.exports = router;
 