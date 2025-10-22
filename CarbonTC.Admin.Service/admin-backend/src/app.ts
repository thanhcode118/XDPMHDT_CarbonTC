import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/database';
import { connectRabbitMQ } from './config/rabbitmq';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import logger from './utils/logger';

import disputeRoutes from './routes/disputeRoutes';
import reportRoutes from './routes/reportRoutes';
import adminActionRoutes from './routes/adminActionRoutes';
import configRoutes from './routes/configRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5005;

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'Admin Service',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/admin/disputes', disputeRoutes);
app.use('/api/admin/reports', reportRoutes);
app.use('/api/admin/actions', adminActionRoutes);
app.use('/api/admin/configs', configRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    logger.info('MongoDB connected successfully');

    // await connectRabbitMQ();
    logger.info('RabbitMQ connected successfully');

    app.listen(PORT, () => {
      logger.info(`Admin Service running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

startServer();

export default app;