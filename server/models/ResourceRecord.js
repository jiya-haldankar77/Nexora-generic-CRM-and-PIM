const mongoose = require('mongoose');

const resourceRecordSchema = new mongoose.Schema(
  {
    resourceType: {
      type: String,
      required: [true, 'Resource type is required'],
      index: true,
      trim: true,
      lowercase: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    },
    externalId: {
      type: String,
      index: true,
      default: null
    },
    syncSource: {
      type: String,
      default: null
    },
    syncStatus: {
      type: String,
      enum: ['none', 'synced', 'pending', 'error'],
      default: 'none',
      index: true
    },
    syncError: {
      type: String,
      default: null
    },
    lastSyncedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    minimize: false
  }
);

// Compound index for resource and creation time
resourceRecordSchema.index({ resourceType: 1, createdAt: -1 });
resourceRecordSchema.index({ resourceType: 1, externalId: 1 });

module.exports = mongoose.model('ResourceRecord', resourceRecordSchema);
