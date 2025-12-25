const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const routes = require('./routes');
const errorMiddleware = require("../middlewares/error.middleware");
const { apiLimiter } = require('../middlewares/rateLimit.middleware');
const logger = require('../utils/logger');
const app = express();

// Security middleware
app.use(helmet());




// Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "connect-src 'self' https://sentry.phonepe.com https://dgq88cldibal5.cloudfront.net https://api-preprod.phonepe.com https://d32dgd8o7pwmnt.cloudfront.net https://mercurystatic.phonepe.com https://imgstatic.phonepe.com https://mercury-uat.phonepe.com https://stg-sentry.phonepe.com https://wa-uat.phonepe.com https://stg-linchpin.phonepe.com"
  );
  next();
});

const allowedOrigins = [
  "http://localhost:5173",
  "https://backend-altomoda-nhj08k4m9-vidyavathi-digadaris-projects.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow Postman / server-to-server
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow all Vercel deployments (preview & production)
    if (/\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
}));

app.options(/.*/, cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', apiLimiter);

app.use((req, res, next) => {
  console.log('🔵 INCOMING REQUEST:', {
    method: req.method,
    url: req.url,
    path: req.path,
    originalUrl: req.originalUrl,
    timestamp: new Date().toISOString()
  });
  next();
});

// Routes
app.use('/api', routes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Global error handler
app.use(errorMiddleware);

app.set('trust proxy', 1);

module.exports = app;
