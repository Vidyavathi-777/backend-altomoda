const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.route');

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

module.exports = router;