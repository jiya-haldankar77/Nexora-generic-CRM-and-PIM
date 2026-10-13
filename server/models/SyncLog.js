const mongoose = require('mongoose');

const syncErrorItemSchema = new mongoose.Schema(
  {
    recordId: { type: String, default: null },
    message: { type: String, required: true }
  },
  { _id: false }
);

const syncLogSchema = new mongoose.Schema(
  {
    integration: {
      type: String,
      required: [true, 'Integration identifier is required'],
      trim: true,
      index: true
    },
    resourceType: {
      type: String,
      required: [true, 'Resource type is required'],
      trim: true,
      index: true
    },
    operation: {
      type: String,
      enum: ['import', 'export', 'sync'],
      default: 'sync',
      required: true
    },
    status: {
      type: String,
      enum: ['success', 'error', 'partial'],
      required: true,
      index: true
    },
    recordsProcessed: {
      type: Number,
      default: 0
    },
    recordsSuccess: {
      type: Number,
      default: 0
    },
    recordsError: {
      type: Number,
      default: 0
    },
    errors: {
      type: [syncErrorItemSchema],
      default: []
    },
    duration: {
      type: Number, // in milliseconds
      default: 0
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    suppressReservedKeysWarning: true
  }
);

syncLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SyncLog', syncLogSchema);
