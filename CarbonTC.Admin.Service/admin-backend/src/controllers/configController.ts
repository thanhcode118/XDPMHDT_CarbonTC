import { Response } from 'express';
import { AuthRequest } from '../types';
import configService from '../services/configService';
import ApiResponseHelper from '../utils/apiResponse';
import { asyncHandler } from '../middlewares/errorHandler';

/**
 * Config Controller
 * Handles HTTP requests for system configuration management
 */
class ConfigController {

  /**
   * @route   POST /api/admin/configs
   * @desc    Create a new configuration
   * @access  Private (Admin)
   */
  createConfig = asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      configKey,
      configValue,
      description,
      category,
      valueType
    } = req.body;
    const updatedBy = req.user!.userId;

    const config = await configService.createConfig(
      configKey,
      configValue,
      updatedBy,
      description,
      category,
      valueType
    );

    return ApiResponseHelper.created(
      res,
      config,
      'Configuration created successfully'
    );
  });

  /**
   * @route   GET /api/admin/configs/:configKey
   * @desc    Get config by key
   * @access  Private (Admin)
   */
  getConfigByKey = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { configKey } = req.params;

    const config = await configService.getConfigByKey(configKey);

    return ApiResponseHelper.success(
      res,
      config,
      'Configuration retrieved successfully'
    );
  });

  /**
   * @route   GET /api/admin/configs/:configKey/value
   * @desc    Get config value (parsed)
   * @access  Private (Admin)
   */
  getConfigValue = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { configKey } = req.params;

    const value = await configService.getConfigValue(configKey);

    return ApiResponseHelper.success(
      res,
      { configKey, value },
      'Configuration value retrieved successfully'
    );
  });

  /**
   * @route   GET /api/admin/configs
   * @desc    Get all active configurations
   * @access  Private (Admin)
   */
  getAllActiveConfigs = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const configs = await configService.getAllActiveConfigs();

      return ApiResponseHelper.success(
        res,
        configs,
        'Active configurations retrieved successfully'
      );
    }
  );

  /**
   * @route   GET /api/admin/configs/all
   * @desc    Get all configurations (including inactive)
   * @access  Private (Admin)
   */
  getAllConfigs = asyncHandler(async (req: AuthRequest, res: Response) => {
    const configs = await configService.getAllConfigs();

    return ApiResponseHelper.success(
      res,
      configs,
      'All configurations retrieved successfully'
    );
  });

  /**
   * @route   GET /api/admin/configs/category/:category
   * @desc    Get configs by category
   * @access  Private (Admin)
   */
  getConfigsByCategory = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { category } = req.params;

      const configs = await configService.getConfigsByCategory(category);

      return ApiResponseHelper.success(
        res,
        configs,
        'Configurations retrieved successfully'
      );
    }
  );

  /**
   * @route   PUT /api/admin/configs/:configKey
   * @desc    Update configuration
   * @access  Private (Admin)
   */
  updateConfig = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { configKey } = req.params;
    const { configValue, description } = req.body;
    const updatedBy = req.user!.userId;

    const config = await configService.updateConfig(
      configKey,
      { configValue, description },
      updatedBy
    );

    return ApiResponseHelper.success(
      res,
      config,
      'Configuration updated successfully'
    );
  });

  /**
   * @route   PATCH /api/admin/configs/:configKey/value
   * @desc    Quick update config value
   * @access  Private (Admin)
   */
  setValue = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { configKey } = req.params;
    const { configValue } = req.body;
    const updatedBy = req.user!.userId;

    const config = await configService.setValue(
      configKey,
      configValue,
      updatedBy
    );

    return ApiResponseHelper.success(
      res,
      config,
      'Configuration value updated successfully'
    );
  });

  /**
   * @route   PATCH /api/admin/configs/:configKey/activate
   * @desc    Activate configuration
   * @access  Private (Admin)
   */
  activateConfig = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { configKey } = req.params;
    const updatedBy = req.user!.userId;

    const config = await configService.activateConfig(configKey, updatedBy);

    return ApiResponseHelper.success(
      res,
      config,
      'Configuration activated successfully'
    );
  });

  /**
   * @route   PATCH /api/admin/configs/:configKey/deactivate
   * @desc    Deactivate configuration
   * @access  Private (Admin)
   */
  deactivateConfig = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { configKey } = req.params;
    const updatedBy = req.user!.userId;

    const config = await configService.deactivateConfig(configKey, updatedBy);

    return ApiResponseHelper.success(
      res,
      config,
      'Configuration deactivated successfully'
    );
  });

  /**
   * @route   PATCH /api/admin/configs/:configKey/toggle
   * @desc    Toggle configuration active status
   * @access  Private (Admin)
   */
  toggleConfig = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { configKey } = req.params;
    const updatedBy = req.user!.userId;

    const config = await configService.toggleConfig(configKey, updatedBy);

    return ApiResponseHelper.success(
      res,
      config,
      `Configuration ${config.isActive ? 'activated' : 'deactivated'} successfully`
    );
  });

  /**
   * @route   DELETE /api/admin/configs/:configKey
   * @desc    Delete configuration
   * @access  Private (Admin)
   */
  deleteConfig = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { configKey } = req.params;

    await configService.deleteConfig(configKey);

    return ApiResponseHelper.success(
      res,
      null,
      'Configuration deleted successfully'
    );
  });

  /**
   * @route   GET /api/admin/configs/statistics
   * @desc    Get configuration statistics
   * @access  Private (Admin)
   */
  getConfigStatistics = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const stats = await configService.getConfigStatistics();

      return ApiResponseHelper.success(
        res,
        stats,
        'Configuration statistics retrieved successfully'
      );
    }
  );

  /**
   * @route   POST /api/admin/configs/bulk-update
   * @desc    Bulk update configurations
   * @access  Private (Admin)
   */
  bulkUpdateConfigs = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { updates } = req.body;
    const updatedBy = req.user!.userId;

    if (!Array.isArray(updates)) {
      return ApiResponseHelper.badRequest(
        res,
        'updates must be an array of {configKey, configValue}'
      );
    }

    const results = await configService.bulkUpdateConfigs(updates, updatedBy);

    return ApiResponseHelper.success(
      res,
      results,
      `Bulk update completed: ${results.success} succeeded, ${results.failed} failed`
    );
  });

  /**
   * @route   POST /api/admin/configs/initialize
   * @desc    Initialize default configurations
   * @access  Private (Admin)
   */
  initializeDefaultConfigs = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const updatedBy = req.user!.userId;

      const initialized = await configService.initializeDefaultConfigs(
        updatedBy
      );

      return ApiResponseHelper.success(
        res,
        { initialized },
        `Initialized ${initialized} default configurations`
      );
    }
  );
}

export default new ConfigController();