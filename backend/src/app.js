const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const routes =  require('./routes');
const errorMiddleware = require("../middlewares/error.middleware");
const { apiLimiter } = require('../middlewares/rateLimit.middleware');
const logger = require('../utils/logger');
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// Rate limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api', routes);



// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Global error handler
app.use(errorMiddleware);

module.exports = app;
