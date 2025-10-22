const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.route');
const productRoutes = require("./product.route")


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

module.exports = router;