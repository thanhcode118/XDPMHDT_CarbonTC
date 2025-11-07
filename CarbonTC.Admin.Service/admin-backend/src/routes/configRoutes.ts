import { Router } from 'express';
import configController from '../controllers/configController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireAdmin } from '../middlewares/roleMiddleware';

const router = Router();

/**
 * @swagger
 * /admin/configs:
 *   post:
 *     summary: Create a new configuration
 *     description: Create a new system configuration (Admin only)
 *     tags: [System Configs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateConfigRequest'
 *           examples:
 *             transactionFee:
 *               summary: Transaction Fee Config
 *               value:
 *                 configKey: TRANSACTION_FEE_PERCENTAGE
 *                 configValue: "2.5"
 *                 category: FEES
 *                 dataType: NUMBER
 *                 description: Platform transaction fee percentage
 *                 isActive: true
 *             maxListingPrice:
 *               summary: Max Listing Price
 *               value:
 *                 configKey: MAX_LISTING_PRICE
 *                 configValue: "1000000"
 *                 category: LIMITS
 *                 dataType: NUMBER
 *                 description: Maximum price per credit unit
 *                 isActive: true
 *     responses:
 *       201:
 *         description: Configuration created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SystemConfig'
 *       400:
 *         description: Bad request - Config key already exists or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  configController.createConfig
);

/**
 * @swagger
 * /admin/configs/bulk-update:
 *   post:
 *     summary: Bulk update configurations
 *     description: Update multiple configurations at once (Admin only)
 *     tags: [System Configs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkUpdateConfigsRequest'
 *           example:
 *             configs:
 *               - configKey: TRANSACTION_FEE_PERCENTAGE
 *                 configValue: "3.0"
 *               - configKey: WITHDRAWAL_MIN_AMOUNT
 *                 configValue: "50000"
 *               - configKey: MAX_LISTING_PRICE
 *                 configValue: "2000000"
 *     responses:
 *       200:
 *         description: Configurations updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         updated:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/SystemConfig'
 *                         failed:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               configKey:
 *                                 type: string
 *                               error:
 *                                 type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/bulk-update',
  authenticate,
  requireAdmin,
  configController.bulkUpdateConfigs
);

/**
 * @swagger
 * /admin/configs/initialize:
 *   post:
 *     summary: Initialize default configurations
 *     description: Create all default system configurations (Admin only)
 *     tags: [System Configs]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Default configurations initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         created:
 *                           type: integer
 *                           example: 15
 *                         skipped:
 *                           type: integer
 *                           example: 2
 *                         configs:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/SystemConfig'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/initialize',
  authenticate,
  requireAdmin,
  configController.initializeDefaultConfigs
);

/**
 * @swagger
 * /admin/configs/statistics:
 *   get:
 *     summary: Get configuration statistics
 *     description: Get statistics about system configurations (Admin only)
 *     tags: [System Configs]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 25
 *                         active:
 *                           type: integer
 *                           example: 22
 *                         inactive:
 *                           type: integer
 *                           example: 3
 *                         byCategory:
 *                           type: object
 *                           additionalProperties:
 *                             type: integer
 *                           example:
 *                             FEES: 5
 *                             LIMITS: 8
 *                             FEATURES: 7
 *                             NOTIFICATIONS: 5
 *                         byDataType:
 *                           type: object
 *                           additionalProperties:
 *                             type: integer
 *                           example:
 *                             STRING: 10
 *                             NUMBER: 8
 *                             BOOLEAN: 5
 *                             JSON: 2
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/statistics',
  authenticate,
  requireAdmin,
  configController.getConfigStatistics
);

/**
 * @swagger
 * /admin/configs/all:
 *   get:
 *     summary: Get all configurations (including inactive)
 *     description: Get all system configurations, including inactive ones (Admin only)
 *     tags: [System Configs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of configs per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: configKey
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: All configurations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SystemConfig'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/all',
  authenticate,
  requireAdmin,
  configController.getAllConfigs
);

/**
 * @swagger
 * /admin/configs/category/{category}:
 *   get:
 *     summary: Get configs by category
 *     description: Get all configurations in a specific category (Admin only)
 *     tags: [System Configs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [FEES, LIMITS, FEATURES, NOTIFICATIONS, SECURITY, GENERAL]
 *         description: Configuration category
 *         example: FEES
 *     responses:
 *       200:
 *         description: Configurations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SystemConfig'
 *       404:
 *         description: No configurations found for this category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/category/:category',
  authenticate,
  requireAdmin,
  configController.getConfigsByCategory
);

/**
 * @swagger
 * /admin/configs/{configKey}/value:
 *   get:
 *     summary: Get config value (parsed)
 *     description: Get the parsed value of a specific configuration (Admin only)
 *     tags: [System Configs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: configKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration key
 *         example: TRANSACTION_FEE_PERCENTAGE
 *     responses:
 *       200:
 *         description: Config value retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         configKey:
 *                           type: string
 *                           example: TRANSACTION_FEE_PERCENTAGE
 *                         value:
 *                           oneOf:
 *                             - type: string
 *                             - type: number
 *                             - type: boolean
 *                             - type: object
 *                           example: 2.5
 *                         dataType:
 *                           type: string
 *                           enum: [STRING, NUMBER, BOOLEAN, JSON]
 *                           example: NUMBER
 *       404:
 *         description: Configuration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/:configKey/value',
  authenticate,
  requireAdmin,
  configController.getConfigValue
);

/**
 * @swagger
 * /admin/configs/{configKey}:
 *   get:
 *     summary: Get config by key
 *     description: Get a specific configuration by its key (Admin only)
 *     tags: [System Configs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: configKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration key
 *         example: TRANSACTION_FEE_PERCENTAGE
 *     responses:
 *       200:
 *         description: Configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SystemConfig'
 *       404:
 *         description: Configuration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/:configKey',
  authenticate,
  requireAdmin,
  configController.getConfigByKey
);

/**
 * @swagger
 * /admin/configs:
 *   get:
 *     summary: Get all active configurations
 *     description: Get all active system configurations with pagination (Admin only)
 *     tags: [System Configs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of configs per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [FEES, LIMITS, FEATURES, NOTIFICATIONS, SECURITY, GENERAL]
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in config key or description
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: configKey
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Active configurations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SystemConfig'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/',
  authenticate,
  requireAdmin,
  configController.getAllActiveConfigs
);

/**
 * @swagger
 * /admin/configs/{configKey}:
 *   put:
 *     summary: Update configuration
 *     description: Update an existing configuration (Admin only)
 *     tags: [System Configs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: configKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration key
 *         example: TRANSACTION_FEE_PERCENTAGE
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateConfigRequest'
 *           example:
 *             configValue: "3.5"
 *             description: Updated platform transaction fee percentage
 *             isActive: true
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SystemConfig'
 *       404:
 *         description: Configuration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Bad request - Invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  '/:configKey',
  authenticate,
  requireAdmin,
  configController.updateConfig
);

/**
 * @swagger
 * /admin/configs/{configKey}/value:
 *   patch:
 *     summary: Quick update config value
 *     description: Quickly update only the value of a configuration (Admin only)
 *     tags: [System Configs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: configKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration key
 *         example: TRANSACTION_FEE_PERCENTAGE
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 oneOf:
 *                   - type: string
 *                   - type: number
 *                   - type: boolean
 *                   - type: object
 *                 description: New configuration value
 *           examples:
 *             numberValue:
 *               summary: Update number value
 *               value:
 *                 value: 3.5
 *             booleanValue:
 *               summary: Update boolean value
 *               value:
 *                 value: true
 *             stringValue:
 *               summary: Update string value
 *               value:
 *                 value: "enabled"
 *     responses:
 *       200:
 *         description: Config value updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SystemConfig'
 *       404:
 *         description: Configuration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Bad request - Invalid value type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  '/:configKey/value',
  authenticate,
  requireAdmin,
  configController.setValue
);

/**
 * @swagger
 * /admin/configs/{configKey}/activate:
 *   patch:
 *     summary: Activate configuration
 *     description: Activate a configuration to make it effective (Admin only)
 *     tags: [System Configs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: configKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration key
 *         example: TRANSACTION_FEE_PERCENTAGE
 *     responses:
 *       200:
 *         description: Configuration activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SystemConfig'
 *       404:
 *         description: Configuration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Configuration already active
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  '/:configKey/activate',
  authenticate,
  requireAdmin,
  configController.activateConfig
);

/**
 * @swagger
 * /admin/configs/{configKey}/deactivate:
 *   patch:
 *     summary: Deactivate configuration
 *     description: Deactivate a configuration to disable it (Admin only)
 *     tags: [System Configs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: configKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration key
 *         example: TRANSACTION_FEE_PERCENTAGE
 *     responses:
 *       200:
 *         description: Configuration deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SystemConfig'
 *       404:
 *         description: Configuration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Configuration already inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  '/:configKey/deactivate',
  authenticate,
  requireAdmin,
  configController.deactivateConfig
);

/**
 * @swagger
 * /admin/configs/{configKey}/toggle:
 *   patch:
 *     summary: Toggle configuration active status
 *     description: Toggle the active/inactive status of a configuration (Admin only)
 *     tags: [System Configs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: configKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration key
 *         example: TRANSACTION_FEE_PERCENTAGE
 *     responses:
 *       200:
 *         description: Configuration toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SystemConfig'
 *       404:
 *         description: Configuration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  '/:configKey/toggle',
  authenticate,
  requireAdmin,
  configController.toggleConfig
);

/**
 * @swagger
 * /admin/configs/{configKey}:
 *   delete:
 *     summary: Delete configuration
 *     description: Delete a configuration (Admin only). Use with caution!
 *     tags: [System Configs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: configKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration key
 *         example: OLD_DEPRECATED_CONFIG
 *     responses:
 *       200:
 *         description: Configuration deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Configuration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Cannot delete critical system configuration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  '/:configKey',
  authenticate,
  requireAdmin,
  configController.deleteConfig
);

export default router;