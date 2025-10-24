const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.route');
const productRoutes = require("./product.route");
const orderRoutes = require('./order.routes');
const paymentRoutes = require('./payment.routes');
const webhookRoutes = require('./webhook.routes');


// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Metrics (protected)
router.get('/metrics', (req, res) => {
  res.json({
    status: 'ok',
    memory: process.memoryUsage(),
    uptime: process.uptime(),
  });
});


router.use('/v1/auth', authRoutes);

router.use('/products', productRoutes); 

router.use('/orders', orderRoutes);

router.use('/payments', paymentRoutes);   

router.use('/webhooks', webhookRoutes);

module.exports = router;