import { Router } from 'express';
import configController from '../controllers/configController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireAdmin } from '../middlewares/roleMiddleware';

const router = Router();

/**
 * @route   POST /api/admin/configs
 * @desc    Create a new configuration
 * @access  Private (Admin)
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  configController.createConfig
);

/**
 * @route   POST /api/admin/configs/bulk-update
 * @desc    Bulk update configurations
 * @access  Private (Admin)
 */
router.post(
  '/bulk-update',
  authenticate,
  requireAdmin,
  configController.bulkUpdateConfigs
);

/**
 * @route   POST /api/admin/configs/initialize
 * @desc    Initialize default configurations
 * @access  Private (Admin)
 */
router.post(
  '/initialize',
  authenticate,
  requireAdmin,
  configController.initializeDefaultConfigs
);

/**
 * @route   GET /api/admin/configs/statistics
 * @desc    Get configuration statistics
 * @access  Private (Admin)
 * NOTE: This route must be BEFORE other GET routes to avoid conflicts
 */
router.get(
  '/statistics',
  authenticate,
  requireAdmin,
  configController.getConfigStatistics
);

/**
 * @route   GET /api/admin/configs/all
 * @desc    Get all configurations (including inactive)
 * @access  Private (Admin)
 */
router.get(
  '/all',
  authenticate,
  requireAdmin,
  configController.getAllConfigs
);

/**
 * @route   GET /api/admin/configs/category/:category
 * @desc    Get configs by category
 * @access  Private (Admin)
 */
router.get(
  '/category/:category',
  authenticate,
  requireAdmin,
  configController.getConfigsByCategory
);

/**
 * @route   GET /api/admin/configs/:configKey/value
 * @desc    Get config value (parsed)
 * @access  Private (Admin)
 */
router.get(
  '/:configKey/value',
  authenticate,
  requireAdmin,
  configController.getConfigValue
);

/**
 * @route   GET /api/admin/configs/:configKey
 * @desc    Get config by key
 * @access  Private (Admin)
 */
router.get(
  '/:configKey',
  authenticate,
  requireAdmin,
  configController.getConfigByKey
);

/**
 * @route   GET /api/admin/configs
 * @desc    Get all active configurations
 * @access  Private (Admin)
 */
router.get(
  '/',
  authenticate,
  requireAdmin,
  configController.getAllActiveConfigs
);

/**
 * @route   PUT /api/admin/configs/:configKey
 * @desc    Update configuration
 * @access  Private (Admin)
 */
router.put(
  '/:configKey',
  authenticate,
  requireAdmin,
  configController.updateConfig
);

/**
 * @route   PATCH /api/admin/configs/:configKey/value
 * @desc    Quick update config value
 * @access  Private (Admin)
 */
router.patch(
  '/:configKey/value',
  authenticate,
  requireAdmin,
  configController.setValue
);

/**
 * @route   PATCH /api/admin/configs/:configKey/activate
 * @desc    Activate configuration
 * @access  Private (Admin)
 */
router.patch(
  '/:configKey/activate',
  authenticate,
  requireAdmin,
  configController.activateConfig
);

/**
 * @route   PATCH /api/admin/configs/:configKey/deactivate
 * @desc    Deactivate configuration
 * @access  Private (Admin)
 */
router.patch(
  '/:configKey/deactivate',
  authenticate,
  requireAdmin,
  configController.deactivateConfig
);

/**
 * @route   PATCH /api/admin/configs/:configKey/toggle
 * @desc    Toggle configuration active status
 * @access  Private (Admin)
 */
router.patch(
  '/:configKey/toggle',
  authenticate,
  requireAdmin,
  configController.toggleConfig
);

/**
 * @route   DELETE /api/admin/configs/:configKey
 * @desc    Delete configuration
 * @access  Private (Admin)
 */
router.delete(
  '/:configKey',
  authenticate,
  requireAdmin,
  configController.deleteConfig
);

export default router;