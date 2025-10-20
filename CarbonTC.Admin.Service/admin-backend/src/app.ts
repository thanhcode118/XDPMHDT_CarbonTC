import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/database';
import { connectRabbitMQ } from './config/rabbitmq';
import { errorHandler } from './middlewares/errorHandler';
import logger from './utils/logger';

// Import routes
import disputeRoutes from './routes/disputeRoutes';
import reportRoutes from './routes/reportRoutes';
import adminActionRoutes from './routes/adminActionRoutes';
import configRoutes from './routes/configRoutes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5005;

// Security middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'Admin Service',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/admin/disputes', disputeRoutes);
app.use('/api/admin/reports', reportRoutes);
app.use('/api/admin/actions', adminActionRoutes);
app.use('/api/admin/configs', configRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    logger.info('MongoDB connected successfully');

    // Connect to RabbitMQ
    await connectRabbitMQ();
    logger.info('RabbitMQ connected successfully');

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Admin Service running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

startServer();

export default app;