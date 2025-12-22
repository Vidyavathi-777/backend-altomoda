const app = require('./app');
const connectDB = require('../config/db');
const config = require('../config/env');
const logger = require('../utils/logger');
const worker = require('../utils/tryon.wroker');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

(async () => {
  try {
    // ✅ Connect DB FIRST
    await connectDB();

    // ✅ START EMBEDDED TRY-ON WORKER (side-effect import)
    require('../utils/tryon.wroker')

    // ✅ Start server
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.env} mode`);
      logger.info(`API available at http://localhost:${config.port}/api`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
      logger.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
      server.close(() => {
        logger.info('💥 Process terminated!');
      });
    });

    module.exports = server;

  } catch (err) {
    logger.error('Startup failed', err);
    process.exit(1);
  }
})();