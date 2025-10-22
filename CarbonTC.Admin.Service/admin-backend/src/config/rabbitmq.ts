import * as amqp from 'amqplib';
import logger from '../utils/logger';

let connection: any = null;
let channel: any = null;

export const EXCHANGES = {
  ADMIN_EVENTS: 'admin.events',
  USER_EVENTS: 'user.events',
  TRANSACTION_EVENTS: 'transaction.events',
  DISPUTE_EVENTS: 'dispute.events'
};

export const QUEUES = {
  USER_STATUS_UPDATE: 'admin.user.status.update',
  TRANSACTION_DISPUTE: 'admin.transaction.dispute',
  PAYMENT_APPROVE: 'admin.payment.approve',
  LISTING_MODERATE: 'admin.listing.moderate'
};

export const ROUTING_KEYS = {
  USER_BLOCKED: 'user.blocked',
  USER_UNBLOCKED: 'user.unblocked',
  DISPUTE_CREATED: 'dispute.created',
  DISPUTE_RESOLVED: 'dispute.resolved',
  WITHDRAWAL_APPROVED: 'withdrawal.approved',
  WITHDRAWAL_REJECTED: 'withdrawal.rejected',
  LISTING_DELISTED: 'listing.delisted',
  LISTING_FROZEN: 'listing.frozen'
};

export const connectRabbitMQ = async (): Promise<void> => {
  try {
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

    const conn: any = await amqp.connect(rabbitUrl);
    const ch: any = await conn.createChannel();
    // update module-level references
    connection = conn;
    channel = ch;

    logger.info('RabbitMQ connected successfully');

    // Declare exchanges
  await ch.assertExchange(EXCHANGES.ADMIN_EVENTS, 'topic', { durable: true });
  await ch.assertExchange(EXCHANGES.USER_EVENTS, 'topic', { durable: true });
  await ch.assertExchange(EXCHANGES.TRANSACTION_EVENTS, 'topic', { durable: true });
  await ch.assertExchange(EXCHANGES.DISPUTE_EVENTS, 'topic', { durable: true });

    // Declare queues
  await ch.assertQueue(QUEUES.USER_STATUS_UPDATE, { durable: true });
  await ch.assertQueue(QUEUES.TRANSACTION_DISPUTE, { durable: true });
  await ch.assertQueue(QUEUES.PAYMENT_APPROVE, { durable: true });
  await ch.assertQueue(QUEUES.LISTING_MODERATE, { durable: true });

    await ch.bindQueue(
      QUEUES.USER_STATUS_UPDATE,
      EXCHANGES.ADMIN_EVENTS,
      'user.*'
    );
    
    await ch.bindQueue(
      QUEUES.TRANSACTION_DISPUTE,
      EXCHANGES.DISPUTE_EVENTS,
      'dispute.*'
    );

    // Handle connection errors
    conn.on('error', (error: any) => {
      logger.error('RabbitMQ connection error:', error);
    });

    conn.on('close', () => {
      logger.warn('RabbitMQ connection closed');
    });

    logger.info('RabbitMQ exchanges and queues configured');

  } catch (error) {
    logger.error('Failed to connect to RabbitMQ:', error);
    throw error;
  }
};

export const getChannel = (): any => {
  if (!channel) {
    throw new Error('RabbitMQ channel is not initialized');
  }
  return channel;
};

export const publishMessage = async (
  exchange: string,
  routingKey: string,
  message: any
): Promise<void> => {
  try {
  const ch = getChannel();
    const messageBuffer = Buffer.from(JSON.stringify(message));
    
    ch.publish(exchange, routingKey, messageBuffer, {
      persistent: true,
      contentType: 'application/json',
      timestamp: Date.now()
    });

    logger.info(`Message published to ${exchange} with routing key ${routingKey}`);
  } catch (error) {
    logger.error('Failed to publish message:', error);
    throw error;
  }
};

export const consumeMessages = async (
  queue: string,
  callback: (message: any) => Promise<void>
): Promise<void> => {
  try {
    const ch = getChannel();
    
    await ch.consume(queue, async (msg: any) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content);
          ch.ack(msg);
        } catch (error) {
          logger.error('Error processing message:', error);
          ch.nack(msg, false, false); // Don't requeue failed messages
        }
      }
    });

    logger.info(`Started consuming messages from queue: ${queue}`);
  } catch (error) {
    logger.error('Failed to consume messages:', error);
    throw error;
  }
};

export const closeRabbitMQ = async (): Promise<void> => {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    logger.info('RabbitMQ connection closed successfully');
  } catch (error) {
    logger.error('Error closing RabbitMQ connection:', error);
    throw error;
  }
};