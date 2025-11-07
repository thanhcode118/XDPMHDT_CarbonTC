import mongoose, { Schema, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ISystemConfigDocument extends Document {
  configId: string;
  configKey: string;
  configValue: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
  isActive: boolean;
  category?: string;
  valueType?: 'string' | 'number' | 'boolean' | 'json';

  parsedValue: any;
  isRecentlyUpdated: boolean;

  toggleActive(updatedBy: string): Promise<ISystemConfigDocument>;
  updateValue(newValue: string, updatedBy: string): Promise<ISystemConfigDocument>;
}

export interface ISystemConfigModel extends Model<ISystemConfigDocument> {
  findByKey(configKey: string): Promise<ISystemConfigDocument | null>;
  getValue(configKey: string): Promise<any>;
  findByCategory(category: string): Promise<ISystemConfigDocument[]>;
  findActive(): Promise<ISystemConfigDocument[]>;
  setValue(
    configKey: string, 
    configValue: string, 
    updatedBy: string
  ): Promise<ISystemConfigDocument | null>;
  deactivate(configKey: string, updatedBy: string): Promise<ISystemConfigDocument | null>;
  activate(configKey: string, updatedBy: string): Promise<ISystemConfigDocument | null>;
}
interface TransformedSystemConfig {
  configId: string;
  configKey: string;
  configValue: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
  isActive: boolean;
  category?: string;
  valueType?: 'string' | 'number' | 'boolean' | 'json';
  _id?: any;
}

const SystemConfigSchema = new Schema<ISystemConfigDocument, ISystemConfigModel>(
  {
    configId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      required: true,
    },
    configKey: {
      type: String,
      required: [true, 'Config key is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z_]+$/, 'Config key must be uppercase with underscores only']
    },
    configValue: {
      type: String,
      required: [true, 'Config value is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxLength: [500, 'Description cannot exceed 500 characters']
    },
    updatedBy: {
      type: String,
      required: [true, 'Updater user ID is required'],
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      trim: true,
      enum: ['PAYMENT', 'TRANSACTION', 'SECURITY', 'NOTIFICATION', 'SYSTEM', 'FEATURE'],
      default: 'SYSTEM',
      index: true
    },
    valueType: {
      type: String,
      enum: ['string', 'number', 'boolean', 'json'],
      default: 'string'
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: function (_doc: any, ret: any) {
        delete ret._id;
        return ret as TransformedSystemConfig;
      }
    },
    toObject: {
      virtuals: true,
      transform: function (_doc: any, ret: any) {
        delete ret._id;
        return ret as TransformedSystemConfig;
      }
    }
  }
);

// SystemConfigSchema.index({ configId: 1 });
// SystemConfigSchema.index({ configKey: 1 }, { unique: true });
SystemConfigSchema.index({ category: 1, isActive: 1 });
SystemConfigSchema.index({ isActive: 1 });

SystemConfigSchema.virtual('parsedValue').get(function (this: ISystemConfigDocument) {
  switch (this.valueType) {
    case 'number':
      return parseFloat(this.configValue);
    case 'boolean':
      return this.configValue.toLowerCase() === 'true';
    case 'json':
      try {
        return JSON.parse(this.configValue);
      } catch {
        return this.configValue;
      }
    default:
      return this.configValue;
  }
});

SystemConfigSchema.virtual('isRecentlyUpdated').get(
  function (this: ISystemConfigDocument) {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.updatedAt > dayAgo;
  }
);

SystemConfigSchema.pre('save', 
  function (this: ISystemConfigDocument, next) {
    this.updatedAt = new Date();
    next();
  }
);

SystemConfigSchema.pre('save', function (this: ISystemConfigDocument, next) {
  if (this.valueType === 'number' && isNaN(parseFloat(this.configValue))) {
    next(new Error('Config value must be a valid number'));
  }
  if (this.valueType === 'boolean' && !['true', 'false'].includes(this.configValue.toLowerCase())) {
    next(new Error('Config value must be "true" or "false"'));
  }
  if (this.valueType === 'json') {
    try {
      JSON.parse(this.configValue);
    } catch {
      next(new Error('Config value must be valid JSON'));
    }
  }
  next();
});

SystemConfigSchema.statics.findByKey = function (
  this: ISystemConfigModel, 
  configKey: string
) {
  return this.findOne({ 
    configKey: configKey.toUpperCase(), 
    isActive: true 
  });
};

SystemConfigSchema.statics.getValue = async function (
  this: ISystemConfigModel, 
  configKey: string
) {
  const config = await this.findByKey(configKey);
  return config ? config.parsedValue : null;
};

SystemConfigSchema.statics.findByCategory = function (
  this: ISystemConfigModel, 
  category: string
) {
  return this.find({ category, isActive: true }).sort({ configKey: 1 });
};

SystemConfigSchema.statics.findActive = function (
  this: ISystemConfigModel
) {
  return this.find({ isActive: true }).sort({ category: 1, configKey: 1 });
};

SystemConfigSchema.statics.setValue = async function (
  this: ISystemConfigModel,
  configKey: string,
  configValue: string,
  updatedBy: string
) {
  return this.findOneAndUpdate(
    { configKey: configKey.toUpperCase() },
    { configValue, updatedBy },
    { new: true, runValidators: true, timestamps: true }
  );
};

SystemConfigSchema.statics.deactivate = async function (
  this: ISystemConfigModel,
  configKey: string, 
  updatedBy: string
) {
  return this.findOneAndUpdate(
    { configKey: configKey.toUpperCase() },
    { isActive: false, updatedBy },
    { new: true, timestamps: true }
  );
};

SystemConfigSchema.statics.activate = async function (
  this: ISystemConfigModel,
  configKey: string, 
  updatedBy: string
) {
  return this.findOneAndUpdate(
    { configKey: configKey.toUpperCase() },
    { isActive: true, updatedBy },
    { new: true, timestamps: true }
  );
};

SystemConfigSchema.methods.toggleActive = function (
  this: ISystemConfigDocument,
  updatedBy: string
) {
  this.isActive = !this.isActive;
  this.updatedBy = updatedBy;
  this.updatedAt = new Date();
  return this.save();
};
  
SystemConfigSchema.methods.updateValue = function (
  this: ISystemConfigDocument,
  newValue: string,
  updatedBy: string
) {
  this.configValue = newValue;
  this.updatedBy = updatedBy;
  this.updatedAt = new Date();
  return this.save();
};

const SystemConfig = mongoose.model<ISystemConfigDocument, ISystemConfigModel>(
  'SystemConfig',
  SystemConfigSchema
);

export default SystemConfig;