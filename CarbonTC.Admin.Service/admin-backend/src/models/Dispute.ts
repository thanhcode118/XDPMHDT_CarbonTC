import mongoose, { Schema, Document } from 'mongoose';
import { DisputeStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface IDisputeDocument extends Document {
  disputeId: string;
  transactionId: string;
  raisedBy: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  createdAt: Date;
  resolvedAt?: Date;
  resolutionNotes?: string;
}

interface TransformedDispute {
    disputeId: string;
    transactionId: string;
    raisedBy: string;
    reason: string;
    description: string;
    status: DisputeStatus;
    createdAt: Date;
    resolvedAt?: Date;
    resolutionNotes?: string;
    _id?: any;
}

const DisputeSchema: Schema = new Schema(
  {
    disputeId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      required: true,
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required'],
    },
    raisedBy: {
      type: String,
      required: [true, 'User ID is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      maxLength: [200, 'Reason cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxLength: [2000, 'Description cannot exceed 2000 characters']
    },
    status: {
      type: String,
      enum: Object.values(DisputeStatus),
      default: DisputeStatus.PENDING,
      required: true,
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    resolutionNotes: {
      type: String,
      trim: true,
      maxLength: [2000, 'Resolution notes cannot exceed 2000 characters']
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: function (_doc: any, ret: any) {
        delete ret._id;
        return ret as TransformedDispute;
      }
    },
    toObject: {
      virtuals: true,
      transform: function (_doc: any, ret: any) {
        delete ret._id;
        return ret as TransformedDispute;
      }
    }
  }
);

// DisputeSchema.index({ disputeId: 1 });
DisputeSchema.index({ transactionId: 1 });
DisputeSchema.index({ raisedBy: 1 });
DisputeSchema.index({ status: 1 });
DisputeSchema.index({ createdAt: -1 });
DisputeSchema.index({ status: 1, createdAt: -1 }); 

DisputeSchema.virtual('isResolved').get(function (this: IDisputeDocument) {
  return this.status === DisputeStatus.RESOLVED;
});

DisputeSchema.virtual('isPending').get(function (this: IDisputeDocument) {
  return this.status === DisputeStatus.PENDING;
});

DisputeSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === DisputeStatus.RESOLVED) {
    this.resolvedAt = new Date();
  }
  next();
});

DisputeSchema.statics.findByTransaction = function (transactionId: string) {
  return this.find({ transactionId });
};

DisputeSchema.statics.findByUser = function (userId: string) {
  return this.find({ raisedBy: userId });
};

DisputeSchema.statics.findPending = function () {
  return this.find({ status: DisputeStatus.PENDING }).sort({ createdAt: -1 });
};

DisputeSchema.methods.resolve = function (notes: string) {
  this.status = DisputeStatus.RESOLVED;
  this.resolutionNotes = notes;
  this.resolvedAt = new Date();
  return this.save();
};

DisputeSchema.methods.reject = function (notes: string) {
  this.status = DisputeStatus.REJECTED;
  this.resolutionNotes = notes;
  this.resolvedAt = new Date();
  return this.save();
};

const Dispute = mongoose.model<IDisputeDocument>('Dispute', DisputeSchema);

export default Dispute;