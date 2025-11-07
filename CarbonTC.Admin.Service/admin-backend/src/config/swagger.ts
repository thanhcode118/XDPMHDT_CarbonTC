import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Carbon Credit Admin Service API',
    version: version,
    description: `
      Admin Service API for Carbon Credit Marketplace Platform.
      
      ## Features
      - 🏛️ **Dispute Management**: Handle buyer-seller disputes
      - 📊 **Platform Reports**: Generate comprehensive reports  
      - 📝 **Admin Actions**: Audit trail for all admin operations
      - ⚙️ **System Configuration**: Manage platform settings
      
      ## Authentication
      All endpoints require JWT Bearer token authentication.
      Obtain token from Auth Service first.
    `,
    contact: {
      name: 'Admin Service Team',
      email: 'admin@carboncredit.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:5005/api',
      description: 'Development server',
    },
    {
      url: 'http://localhost:8080/admin',
      description: 'Development server (via API Gateway)',
    },
    {
      url: 'https://api.carboncredit.com/admin',
      description: 'Production server (via API Gateway)',
    },
  ],
  tags: [
    {
      name: 'Disputes',
      description: 'Dispute management endpoints',
    },
    {
      name: 'Reports',
      description: 'Platform report generation and retrieval',
    },
    {
      name: 'Admin Actions',
      description: 'Admin action logging and audit trail',
    },
    {
      name: 'System Configs',
      description: 'System configuration management',
    },
    {
      name: 'Health',
      description: 'Service health check',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token obtained from Auth Service',
      },
    },
    schemas: {
      // Common schemas
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Error message',
          },
          error: {
            type: 'string',
            example: 'Detailed error information',
          },
          statusCode: {
            type: 'integer',
            example: 400,
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-15T10:30:00.000Z',
          },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Operation successful',
          },
          statusCode: {
            type: 'integer',
            example: 200,
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-15T10:30:00.000Z',
          },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          currentPage: {
            type: 'integer',
            example: 1,
          },
          totalPages: {
            type: 'integer',
            example: 10,
          },
          totalItems: {
            type: 'integer',
            example: 95,
          },
          itemsPerPage: {
            type: 'integer',
            example: 10,
          },
          hasNextPage: {
            type: 'boolean',
            example: true,
          },
          hasPreviousPage: {
            type: 'boolean',
            example: false,
          },
        },
      },
      
      // Dispute schemas
      Dispute: {
        type: 'object',
        properties: {
          disputeId: {
            type: 'string',
            format: 'uuid',
            example: '550e8400-e29b-41d4-a716-446655440000',
          },
          transactionId: {
            type: 'string',
            example: 'TXN-2024-001',
          },
          raisedBy: {
            type: 'string',
            example: 'user-id-123',
          },
          reason: {
            type: 'string',
            example: 'Product not as described',
          },
          description: {
            type: 'string',
            example: 'The carbon credits received do not match the listing description...',
          },
          status: {
            type: 'string',
            enum: ['Pending', 'UnderReview', 'Resolved', 'Rejected'],
            example: 'Pending',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-15T10:30:00.000Z',
          },
          resolvedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: null,
          },
          resolutionNotes: {
            type: 'string',
            nullable: true,
            example: null,
          },
        },
      },
      CreateDisputeRequest: {
        type: 'object',
        required: ['transactionId', 'reason', 'description'],
        properties: {
          transactionId: {
            type: 'string',
            example: 'TXN-2024-001',
          },
          reason: {
            type: 'string',
            maxLength: 200,
            example: 'Product not as described',
          },
          description: {
            type: 'string',
            maxLength: 2000,
            example: 'Detailed description of the dispute...',
          },
        },
      },
      ResolveDisputeRequest: {
        type: 'object',
        required: ['status', 'resolutionNotes'],
        properties: {
          status: {
            type: 'string',
            enum: ['Resolved', 'Rejected'],
            example: 'Resolved',
          },
          resolutionNotes: {
            type: 'string',
            maxLength: 2000,
            example: 'After investigation, we found that...',
          },
        },
      },
      
      // Report schemas
      PlatformReport: {
        type: 'object',
        properties: {
          reportId: {
            type: 'string',
            format: 'uuid',
            example: '550e8400-e29b-41d4-a716-446655440001',
          },
          type: {
            type: 'string',
            enum: ['UserStats', 'TransactionStats', 'RevenueStats', 'CarbonStats'],
            example: 'TransactionStats',
          },
          period: {
            type: 'string',
            enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly'],
            example: 'Monthly',
          },
          dataJson: {
            type: 'object',
            example: {
              totalTransactions: 320,
              completedTransactions: 280,
              totalVolume: 15000,
            },
          },
          generatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-15T10:30:00.000Z',
          },
          generatedBy: {
            type: 'string',
            example: 'admin-user-id',
          },
          startDate: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2025-01-01T00:00:00.000Z',
          },
          endDate: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2025-01-31T23:59:59.999Z',
          },
        },
      },
      GenerateReportRequest: {
        type: 'object',
        required: ['type', 'period'],
        properties: {
          type: {
            type: 'string',
            enum: ['UserStats', 'TransactionStats', 'RevenueStats', 'CarbonStats'],
            example: 'TransactionStats',
          },
          period: {
            type: 'string',
            enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly'],
            example: 'Monthly',
          },
          startDate: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-01T00:00:00.000Z',
          },
          endDate: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-31T23:59:59.999Z',
          },
        },
      },
      
      // Admin Action schemas
      AdminAction: {
        type: 'object',
        properties: {
          actionId: {
            type: 'string',
            format: 'uuid',
            example: '550e8400-e29b-41d4-a716-446655440002',
          },
          adminId: {
            type: 'string',
            example: 'admin-user-id',
          },
          actionType: {
            type: 'string',
            enum: [
              'BlockUser',
              'UnblockUser',
              'ApproveWithdrawal',
              'RejectWithdrawal',
              'ResolveDispute',
              'ForceRefund',
              'DelistListing',
              'FreezeListing',
              'UnfreezeListing',
              'UpdateConfig',
              'IssueCertificate',
              'RevokeCertificate',
            ],
            example: 'BlockUser',
          },
          targetId: {
            type: 'string',
            example: 'user-id-123',
          },
          description: {
            type: 'string',
            maxLength: 1000,
            example: 'User blocked due to fraudulent activity',
          },
          actionDetails: {
            type: 'object',
            nullable: true,
            example: {
              reason: 'Multiple reports of fraud',
              reportIds: ['report-1', 'report-2'],
            },
          },
          ipAddress: {
            type: 'string',
            nullable: true,
            example: '192.168.1.1',
          },
          userAgent: {
            type: 'string',
            nullable: true,
            example: 'Mozilla/5.0...',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-15T10:30:00.000Z',
          },
        },
      },
      CreateAdminActionRequest: {
        type: 'object',
        required: ['actionType', 'targetId', 'description'],
        properties: {
          actionType: {
            type: 'string',
            enum: [
              'BlockUser',
              'UnblockUser',
              'ApproveWithdrawal',
              'RejectWithdrawal',
              'ResolveDispute',
              'ForceRefund',
              'DelistListing',
              'FreezeListing',
              'UnfreezeListing',
              'UpdateConfig',
              'IssueCertificate',
              'RevokeCertificate',
            ],
            example: 'BlockUser',
          },
          targetId: {
            type: 'string',
            example: 'user-id-123',
          },
          description: {
            type: 'string',
            maxLength: 1000,
            example: 'User blocked due to fraudulent activity',
          },
          actionDetails: {
            type: 'object',
            nullable: true,
            example: {
              reason: 'Multiple reports of fraud',
            },
          },
        },
      },
      
      // System Config schemas
      SystemConfig: {
        type: 'object',
        properties: {
          configId: {
            type: 'string',
            format: 'uuid',
            example: '550e8400-e29b-41d4-a716-446655440003',
          },
          configKey: {
            type: 'string',
            example: 'PLATFORM_FEE_PERCENTAGE',
          },
          configValue: {
            type: 'string',
            example: '5',
          },
          description: {
            type: 'string',
            nullable: true,
            example: 'Platform transaction fee percentage',
          },
          category: {
            type: 'string',
            enum: ['PAYMENT', 'TRANSACTION', 'SECURITY', 'NOTIFICATION', 'SYSTEM', 'FEATURE'],
            example: 'PAYMENT',
          },
          valueType: {
            type: 'string',
            enum: ['string', 'number', 'boolean', 'json'],
            example: 'number',
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
          updatedBy: {
            type: 'string',
            example: 'admin-user-id',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-15T10:30:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-15T10:30:00.000Z',
          },
        },
      },
      CreateConfigRequest: {
        type: 'object',
        required: ['configKey', 'configValue'],
        properties: {
          configKey: {
            type: 'string',
            pattern: '^[A-Z_]+$',
            example: 'MAX_LISTING_DURATION_DAYS',
          },
          configValue: {
            type: 'string',
            example: '30',
          },
          description: {
            type: 'string',
            maxLength: 500,
            example: 'Maximum duration for listings in days',
          },
          category: {
            type: 'string',
            enum: ['PAYMENT', 'TRANSACTION', 'SECURITY', 'NOTIFICATION', 'SYSTEM', 'FEATURE'],
            example: 'TRANSACTION',
          },
          valueType: {
            type: 'string',
            enum: ['string', 'number', 'boolean', 'json'],
            example: 'number',
          },
        },
      },
      UpdateConfigRequest: {
        type: 'object',
        properties: {
          configValue: {
            type: 'string',
            example: '30',
          },
          description: {
            type: 'string',
            maxLength: 500,
            example: 'Updated description',
          },
        },
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
};

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  // Path to API docs (routes with JSDoc comments)
  apis: [
    './src/routes/*.ts',
    './src/app.ts',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;