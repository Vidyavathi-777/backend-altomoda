const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.route');
<<<<<<< HEAD
const productRoutes = require("./product.route")

=======
>>>>>>> a482586c64654c9935323210268c264ee9f28892

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