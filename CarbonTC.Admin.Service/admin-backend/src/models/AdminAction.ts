import mongoose, { Schema, Document } from 'mongoose';
import { AdminActionType } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface IAdminActionDocument extends Document {
  actionId: string;
  adminId: string;
  actionType: AdminActionType;
  targetId: string;
  description: string;
  createdAt: Date;
  updatedAt?: Date;
  actionDetails?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

interface TransformedAdminAction {
  actionId: string;
  adminId: string;
  actionType: AdminActionType;
  targetId: string;
  description: string;
  createdAt: Date;
  updatedAt?: Date;
  actionDetails?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  _id?: any;
}

const AdminActionSchema: Schema = new Schema(
  {
    actionId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      required: true,
      index: true
    },
    adminId: {
      type: String,
      required: [true, 'Admin user ID is required'],
      index: true
    },
    actionType: {
      type: String,
      enum: Object.values(AdminActionType),
      required: [true, 'Action type is required'],
      index: true
    },
    targetId: {
      type: String,
      required: [true, 'Target ID is required'],
      index: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxLength: [1000, 'Description cannot exceed 1000 characters']
    },
    actionDetails: {
      type: Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: function (_doc: any, ret: TransformedAdminAction) {
        delete ret._id;
        if (ret.updatedAt) {
          delete ret.updatedAt;
        }
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: function (_doc: any, ret: TransformedAdminAction) {
        delete ret._id;
        if (ret.updatedAt) {
          delete ret.updatedAt;
        }
        return ret;
      }
    }
  }
);

AdminActionSchema.index({ actionId: 1 });
AdminActionSchema.index({ adminId: 1, createdAt: -1 });
AdminActionSchema.index({ actionType: 1, createdAt: -1 });
AdminActionSchema.index({ targetId: 1, createdAt: -1 });
AdminActionSchema.index({ createdAt: -1 });

AdminActionSchema.virtual('isRecent').get(function (this: IAdminActionDocument) {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return this.createdAt > hourAgo;
});

AdminActionSchema.virtual('ageInHours').get(function (this: IAdminActionDocument) {
  const now = new Date();
  const diffMs = now.getTime() - this.createdAt.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60));
});

AdminActionSchema.virtual('isUserAction').get(function (this: IAdminActionDocument) {
  return [
    AdminActionType.BLOCK_USER,
    AdminActionType.UNBLOCK_USER
  ].includes(this.actionType);
});

AdminActionSchema.virtual('isTransactionAction').get(function (this: IAdminActionDocument) {
  return [
    AdminActionType.FORCE_REFUND,
    AdminActionType.RESOLVE_DISPUTE
  ].includes(this.actionType);
});

AdminActionSchema.virtual('isListingAction').get(function (this: IAdminActionDocument) {
  return [
    AdminActionType.DELIST_LISTING,
    AdminActionType.FREEZE_LISTING,
    AdminActionType.UNFREEZE_LISTING
  ].includes(this.actionType);
});

AdminActionSchema.statics.findByAdmin = function (adminId: string) {
  return this.find({ adminId }).sort({ createdAt: -1 });
};

AdminActionSchema.statics.findByType = function (actionType: AdminActionType) {
  return this.find({ actionType }).sort({ createdAt: -1 });
};

AdminActionSchema.statics.findByTarget = function (targetId: string) {
  return this.find({ targetId }).sort({ createdAt: -1 });
};

AdminActionSchema.statics.findRecent = function (hours: number = 24) {
  const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.find({ createdAt: { $gte: cutoffDate } }).sort({ createdAt: -1 });
};

AdminActionSchema.statics.getStatistics = async function (startDate: Date, endDate: Date) {
  const stats = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$actionType',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
  return stats;
};

AdminActionSchema.statics.getAdminActivity = async function (adminId: string, days: number = 30) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const activity = await this.aggregate([
    {
      $match: {
        adminId,
        createdAt: { $gte: cutoffDate }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          actionType: '$actionType'
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': -1 }
    }
  ]);
  return activity;
};

AdminActionSchema.statics.exportAuditLog = function (startDate: Date, endDate: Date) {
  return this.find({
    createdAt: { $gte: startDate, $lte: endDate }
  })
    .sort({ createdAt: -1 })
    .lean();
};

AdminActionSchema.pre('findOneAndUpdate', function (next) {
  next(new Error('Admin actions cannot be modified once created'));
});

AdminActionSchema.pre('updateOne', function (next) {
  next(new Error('Admin actions cannot be modified once created'));
});

AdminActionSchema.pre('updateMany', function (next) {
  next(new Error('Admin actions cannot be modified once created'));
});

const AdminAction = mongoose.model<IAdminActionDocument>(
  'AdminAction',
  AdminActionSchema
);

export default AdminAction;