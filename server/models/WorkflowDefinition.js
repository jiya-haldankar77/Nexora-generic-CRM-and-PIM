const mongoose = require('mongoose');

const workflowStatusSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    color: { type: String, default: '#6366f1' },
    description: { type: String, default: '' }
  },
  { _id: false }
);

const workflowActionSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // e.g., 'notify', 'webhook', 'update_field'
    config: { type: mongoose.Schema.Types.Mixed, default: () => ({}) }
  },
  { _id: false }
);

const workflowTransitionSchema = new mongoose.Schema(
  {
    from: { type: String, required: true, trim: true }, // can be '*' for any state
    to: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    actions: { type: [workflowActionSchema], default: [] }
  },
  { _id: false }
);

const workflowDefinitionSchema = new mongoose.Schema(
  {
    resourceType: {
      type: String,
      required: [true, 'Resource type is required'],
      unique: true,
      trim: true,
      lowercase: true
    },
    name: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    enabled: {
      type: Boolean,
      default: true
    },
    statusField: {
      type: String,
      default: 'status',
      trim: true
    },
    statuses: {
      type: [workflowStatusSchema],
      default: []
    },
    transitions: {
      type: [workflowTransitionSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('WorkflowDefinition', workflowDefinitionSchema);
