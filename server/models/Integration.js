const mongoose = require('mongoose');

const resourceMappingSchema = new mongoose.Schema(
  {
    resourceType: { type: String, required: true },
    externalType: { type: String, required: true },
    fieldMappings: {
      type: Map,
      of: String,
      default: () => new Map()
    },
    enabled: {
      type: Boolean,
      default: true
    }
  },
  { _id: false }
);

const integrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Integration name is required'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Integration type is required'],
      enum: ['woocommerce', 'shopify', 'salesforce'],
      index: true
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    },
    resourceMappings: {
      type: [resourceMappingSchema],
      default: []
    },
    enabled: {
      type: Boolean,
      default: true
    },
    lastSync: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      default: 'idle' // idle, syncing, error, active
    }
  },
  {
    timestamps: true
  }
);

// Method to mask sensitive keys in configuration for safe API output
integrationSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  if (obj.config) {
    const maskedConfig = { ...obj.config };
    const secretKeys = ['secret', 'consumerSecret', 'password', 'token', 'apiKey', 'privateKey'];
    for (const key of Object.keys(maskedConfig)) {
      if (secretKeys.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
        if (typeof maskedConfig[key] === 'string' && maskedConfig[key].length > 4) {
          maskedConfig[key] = '••••••••' + maskedConfig[key].slice(-4);
        } else if (maskedConfig[key]) {
          maskedConfig[key] = '••••••••';
        }
      }
    }
    obj.config = maskedConfig;
  }
  return obj;
};

module.exports = mongoose.model('Integration', integrationSchema);
