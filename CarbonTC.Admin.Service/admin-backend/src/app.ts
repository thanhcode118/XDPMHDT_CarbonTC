import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { connectDatabase } from './config/database';
import { connectRabbitMQ } from './config/rabbitmq';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import logger from './utils/logger';
import swaggerSpec from './config/swagger';

import disputeRoutes from './routes/disputeRoutes';
import reportRoutes from './routes/reportRoutes';
import adminActionRoutes from './routes/adminActionRoutes';
import configRoutes from './routes/configRoutes';
import userRoutes from './routes/userRoutes';
import transactionRoutes from './routes/transactionRoutes';
import withdrawalRoutes from './routes/withdrawalRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5005;

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : '*',
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

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the Admin Service is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: UP
 *                 service:
 *                   type: string
 *                   example: Admin Service
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-01-15T10:30:00.000Z
 */

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'Admin Service',
    timestamp: new Date().toISOString()
  });
});

const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Admin Service API Docs',
  customfavIcon: '/assets/favicon.ico',
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Serve Swagger JSON spec
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api/admin/disputes', disputeRoutes);
app.use('/api/admin/reports', reportRoutes);
app.use('/api/admin/actions', adminActionRoutes);
app.use('/api/admin/configs', configRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/transactions', transactionRoutes);
app.use('/api/admin/withdrawals', withdrawalRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    logger.info('MongoDB connected successfully');

    // await connectRabbitMQ();
    if (process.env.RABBITMQ_URL) {
      try {
        await connectRabbitMQ();
        logger.info('RabbitMQ connected successfully');
      } catch (err) {
        logger.warn('RabbitMQ connection failed — continuing without RabbitMQ:', err);
        // Nếu bạn muốn fail-fast thay vì continue, uncomment dòng dưới:
        // throw err;
      }
    }

    app.listen(PORT, () => {
      logger.info(`Admin Service running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Swagger UI available at: http://localhost:${PORT}/api-docs`);
      logger.info(`Swagger JSON spec at: http://localhost:${PORT}/api-docs.json`);
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