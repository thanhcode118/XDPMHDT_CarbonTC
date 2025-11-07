import SystemConfig, { ISystemConfigDocument } from '../models/SystemConfig';
import { 
  UpdateSystemConfigDTO,
  NotFoundError,
  ValidationError,
  ConflictError
} from '../types';
import logger from '../utils/logger';

/**
 * System Config Service
 * Handles system-wide configuration management
 */
class ConfigService {

  /**
   * Create a new configuration
   */
  async createConfig(
    configKey: string,
    configValue: string,
    updatedBy: string,
    description?: string,
    category?: string,
    valueType?: 'string' | 'number' | 'boolean' | 'json'
  ): Promise<ISystemConfigDocument> {
    try {
      // Check if config already exists
      const existingConfig = await SystemConfig.findOne({
        configKey: configKey.toUpperCase()
      });

      if (existingConfig) {
        throw new ConflictError(
          `Configuration with key ${configKey} already exists`
        );
      }

      // Create config
      const config = new SystemConfig({
        configKey: configKey.toUpperCase(),
        configValue,
        description,
        category: category || 'SYSTEM',
        valueType: valueType || 'string',
        updatedBy,
        isActive: true
      });

      await config.save();

      logger.info(`Config created: ${config.configKey} by ${updatedBy}`);

      return config;
    } catch (error) {
      logger.error('Error creating config:', error);
      throw error;
    }
  }

  /**
   * Get config by key
   */
  async getConfigByKey(configKey: string): Promise<ISystemConfigDocument> {
    try {
      const config = await SystemConfig.findOne({
        configKey: configKey.toUpperCase(),
        isActive: true
      });

      if (!config) {
        throw new NotFoundError(`Configuration not found with key: ${configKey}`);
      }

      return config;
    } catch (error) {
      logger.error('Error fetching config:', error);
      throw error;
    }
  }

  /**
   * Get config value by key (returns parsed value)
   */
  async getConfigValue(configKey: string): Promise<any> {
    try {
      const config = await this.getConfigByKey(configKey);
      return config.parsedValue;
    } catch (error) {
      logger.error('Error fetching config value:', error);
      throw error;
    }
  }

  /**
   * Get all active configurations
   */
  async getAllActiveConfigs(): Promise<ISystemConfigDocument[]> {
    try {
      const configs = await SystemConfig.find({ isActive: true })
        .sort({ category: 1, configKey: 1 })
        .lean();

      return configs as unknown as ISystemConfigDocument[];
    } catch (error) {
      logger.error('Error fetching active configs:', error);
      throw error;
    }
  }

  /**
   * Get all configurations (including inactive)
   */
  async getAllConfigs(): Promise<ISystemConfigDocument[]> {
    try {
      const configs = await SystemConfig.find({})
        .sort({ category: 1, configKey: 1 })
        .lean();

      return configs as unknown as ISystemConfigDocument[];
    } catch (error) {
      logger.error('Error fetching all configs:', error);
      throw error;
    }
  }

  /**
   * Get configs by category
   */
  async getConfigsByCategory(category: string): Promise<ISystemConfigDocument[]> {
    try {
      const configs = await SystemConfig.find({ 
        category: category.toUpperCase(),
        isActive: true 
      })
        .sort({ configKey: 1 })
        .lean();

      return configs as unknown as ISystemConfigDocument[];
    } catch (error) {
      logger.error('Error fetching configs by category:', error);
      throw error;
    }
  }

  /**
   * Update configuration value
   */
  async updateConfig(
    configKey: string,
    data: UpdateSystemConfigDTO,
    updatedBy: string
  ): Promise<ISystemConfigDocument> {
    try {
      const config = await SystemConfig.findOne({
        configKey: configKey.toUpperCase()
      });

      if (!config) {
        throw new NotFoundError(`Configuration not found with key: ${configKey}`);
      }

      // Update fields
      config.configValue = data.configValue;
      if (data.description !== undefined) {
        config.description = data.description;
      }
      config.updatedBy = updatedBy;
      config.updatedAt = new Date();

      await config.save();

      logger.info(`Config updated: ${configKey} by ${updatedBy}`);

      return config;
    } catch (error) {
      logger.error('Error updating config:', error);
      throw error;
    }
  }

  /**
   * Update configuration value (quick update)
   */
  async setValue(
    configKey: string,
    configValue: string,
    updatedBy: string
  ): Promise<ISystemConfigDocument> {
    try {
      const config = await SystemConfig.findOneAndUpdate(
        { configKey: configKey.toUpperCase() },
        {
          configValue,
          updatedBy,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );

      if (!config) {
        throw new NotFoundError(`Configuration not found with key: ${configKey}`);
      }

      logger.info(`Config value updated: ${configKey} by ${updatedBy}`);

      return config;
    } catch (error) {
      logger.error('Error setting config value:', error);
      throw error;
    }
  }

  /**
   * Activate configuration
   */
  async activateConfig(
    configKey: string,
    updatedBy: string
  ): Promise<ISystemConfigDocument> {
    try {
      const config = await SystemConfig.findOneAndUpdate(
        { configKey: configKey.toUpperCase() },
        {
          isActive: true,
          updatedBy,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!config) {
        throw new NotFoundError(`Configuration not found with key: ${configKey}`);
      }

      logger.info(`Config activated: ${configKey} by ${updatedBy}`);

      return config;
    } catch (error) {
      logger.error('Error activating config:', error);
      throw error;
    }
  }

  /**
   * Deactivate configuration
   */
  async deactivateConfig(
    configKey: string,
    updatedBy: string
  ): Promise<ISystemConfigDocument> {
    try {
      const config = await SystemConfig.findOneAndUpdate(
        { configKey: configKey.toUpperCase() },
        {
          isActive: false,
          updatedBy,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!config) {
        throw new NotFoundError(`Configuration not found with key: ${configKey}`);
      }

      logger.info(`Config deactivated: ${configKey} by ${updatedBy}`);

      return config;
    } catch (error) {
      logger.error('Error deactivating config:', error);
      throw error;
    }
  }

  /**
   * Toggle configuration active status
   */
  async toggleConfig(
    configKey: string,
    updatedBy: string
  ): Promise<ISystemConfigDocument> {
    try {
      const config = await SystemConfig.findOne({
        configKey: configKey.toUpperCase()
      });

      if (!config) {
        throw new NotFoundError(`Configuration not found with key: ${configKey}`);
      }

      config.isActive = !config.isActive;
      config.updatedBy = updatedBy;
      config.updatedAt = new Date();

      await config.save();

      logger.info(
        `Config toggled: ${configKey} - now ${config.isActive ? 'active' : 'inactive'}`
      );

      return config;
    } catch (error) {
      logger.error('Error toggling config:', error);
      throw error;
    }
  }

  /**
   * Delete configuration
   */
  async deleteConfig(configKey: string): Promise<void> {
    try {
      const config = await SystemConfig.findOne({
        configKey: configKey.toUpperCase()
      });

      if (!config) {
        throw new NotFoundError(`Configuration not found with key: ${configKey}`);
      }

      await SystemConfig.deleteOne({ configKey: configKey.toUpperCase() });

      logger.info(`Config deleted: ${configKey}`);
    } catch (error) {
      logger.error('Error deleting config:', error);
      throw error;
    }
  }

  /**
   * Get configuration statistics
   */
  async getConfigStatistics(): Promise<any> {
    try {
      const [totalConfigs, activeConfigs, byCategory] = await Promise.all([
        SystemConfig.countDocuments({}),
        SystemConfig.countDocuments({ isActive: true }),
        SystemConfig.aggregate([
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              active: {
                $sum: { $cond: ['$isActive', 1, 0] }
              }
            }
          },
          {
            $project: {
              category: '$_id',
              total: '$count',
              active: 1,
              inactive: { $subtract: ['$count', '$active'] },
              _id: 0
            }
          },
          {
            $sort: { category: 1 }
          }
        ])
      ]);

      return {
        totalConfigs,
        activeConfigs,
        inactiveConfigs: totalConfigs - activeConfigs,
        byCategory
      };
    } catch (error) {
      logger.error('Error getting config statistics:', error);
      throw error;
    }
  }

  async bulkUpdateConfigs(
    updates: Array<{ configKey: string; configValue: string }>,
    updatedBy: string
  ): Promise<{ success: number; failed: number; results: any[] }> {
    const results = {
      success: 0,
      failed: 0,
      results: [] as any[]
    };

    for (const update of updates) {
      try {
        await this.setValue(update.configKey, update.configValue, updatedBy);
        results.success++;
        results.results.push({
          configKey: update.configKey,
          status: 'success'
        });
      } catch (error: any) {
        results.failed++;
        results.results.push({
          configKey: update.configKey,
          status: 'failed',
          error: error.message
        });
        logger.error(`Failed to update config ${update.configKey}:`, error);
      }
    }

    logger.info(
      `Bulk config update completed: ${results.success} succeeded, ${results.failed} failed`
    );

    return results;
  }

  async initializeDefaultConfigs(updatedBy: string): Promise<number> {
    const defaultConfigs = [
      {
        configKey: 'PLATFORM_FEE_PERCENTAGE',
        configValue: '5',
        description: 'Platform transaction fee percentage',
        category: 'PAYMENT',
        valueType: 'number' as const
      },
      {
        configKey: 'MIN_WITHDRAWAL_AMOUNT',
        configValue: '100',
        description: 'Minimum withdrawal amount in currency',
        category: 'PAYMENT',
        valueType: 'number' as const
      },
      {
        configKey: 'MAX_LISTING_DURATION_DAYS',
        configValue: '30',
        description: 'Maximum duration for listings in days',
        category: 'TRANSACTION',
        valueType: 'number' as const
      },
      {
        configKey: 'ENABLE_EMAIL_NOTIFICATIONS',
        configValue: 'true',
        description: 'Enable email notifications',
        category: 'NOTIFICATION',
        valueType: 'boolean' as const
      },
      {
        configKey: 'MAINTENANCE_MODE',
        configValue: 'false',
        description: 'System maintenance mode',
        category: 'SYSTEM',
        valueType: 'boolean' as const
      }
    ];

    let initialized = 0;

    for (const config of defaultConfigs) {
      try {
        const existing = await SystemConfig.findOne({
          configKey: config.configKey
        });

        if (!existing) {
          await this.createConfig(
            config.configKey,
            config.configValue,
            updatedBy,
            config.description,
            config.category,
            config.valueType
          );
          initialized++;
        }
      } catch (error) {
        logger.error(`Failed to initialize config ${config.configKey}:`, error);
      }
    }

    logger.info(`Initialized ${initialized} default configurations`);
    return initialized;
  }
}

export default new ConfigService();