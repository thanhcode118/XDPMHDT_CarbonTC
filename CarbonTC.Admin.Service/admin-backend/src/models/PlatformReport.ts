import mongoose, { Schema, Document } from 'mongoose';
import { ReportType, ReportPeriod } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface IPlatformReportDocument extends Document {
  reportId: string;
  type: ReportType;
  dataJson: Record<string, any>;
  period: ReportPeriod;
  generatedAt: Date;
  generatedBy: string;
  startDate?: Date;
  endDate?: Date;
}

interface TransformedPlatformReport {
  reportId: string;
  type: ReportType;
  dataJson: Record<string, any>;
  period: ReportPeriod;
  generatedAt: Date;
  generatedBy: string;
  startDate?: Date;
  endDate?: Date;
  _id?: any;
}

const PlatformReportSchema: Schema = new Schema(
  {
    reportId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ReportType),
      required: [true, 'Report type is required'],
      index: true
    },
    dataJson: {
      type: Schema.Types.Mixed,
      required: [true, 'Report data is required'],
      default: {}
    },
    period: {
      type: String,
      enum: Object.values(ReportPeriod),
      required: [true, 'Report period is required'],
      index: true
    },
    generatedAt: {
      type: Date,
      default: Date.now,
      required: true,
      index: true
    },
    generatedBy: {
      type: String,
      required: [true, 'Generator user ID is required'],
      index: true
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: false,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: function (_doc: any, ret: any) {
        delete ret._id;
        return ret as TransformedPlatformReport;
      }
    },
    toObject: {
      virtuals: true,
      transform: function (_doc: any, ret: any) {
        delete ret._id;
        return ret as TransformedPlatformReport;
      }
    }
  }
);

// PlatformReportSchema.index({ reportId: 1 });
PlatformReportSchema.index({ type: 1, period: 1 });
PlatformReportSchema.index({ generatedAt: -1 });
PlatformReportSchema.index({ type: 1, generatedAt: -1 });
PlatformReportSchema.index({ generatedBy: 1, generatedAt: -1 });

PlatformReportSchema.virtual('isRecent').get(function (this: IPlatformReportDocument) {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.generatedAt > dayAgo;
});

PlatformReportSchema.virtual('ageInDays').get(function (this: IPlatformReportDocument) {
  const now = new Date();
  const diffMs = now.getTime() - this.generatedAt.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
});

PlatformReportSchema.virtual('dateRange').get(function (this: IPlatformReportDocument) {
  if (this.startDate && this.endDate) {
    return `${this.startDate.toISOString().split('T')[0]} to ${this.endDate.toISOString().split('T')[0]}`;
  }
  return 'N/A';
});

PlatformReportSchema.statics.findByType = function (type: ReportType) {
  return this.find({ type }).sort({ generatedAt: -1 });
};

PlatformReportSchema.statics.findByPeriod = function (period: ReportPeriod) {
  return this.find({ period }).sort({ generatedAt: -1 });
};


PlatformReportSchema.statics.findRecent = function (days: number = 7) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.find({ generatedAt: { $gte: cutoffDate } }).sort({ generatedAt: -1 });
};


PlatformReportSchema.statics.findByGenerator = function (userId: string) {
  return this.find({ generatedBy: userId }).sort({ generatedAt: -1 });
};


PlatformReportSchema.statics.findLatestByType = function (type: ReportType) {
  return this.findOne({ type }).sort({ generatedAt: -1 });
};

PlatformReportSchema.statics.deleteOldReports = async function (days: number = 90) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const result = await this.deleteMany({ generatedAt: { $lt: cutoffDate } });
  return result.deletedCount;
};

PlatformReportSchema.pre('save', function (next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    next(new Error('Start date cannot be after end date'));
  }
  next();
});

const PlatformReport = mongoose.model<IPlatformReportDocument>(
  'PlatformReport',
  PlatformReportSchema
);

export default PlatformReport;