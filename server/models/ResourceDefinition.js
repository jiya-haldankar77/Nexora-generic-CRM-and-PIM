const mongoose = require('mongoose');

const fieldValidationSchema = new mongoose.Schema(
  {
    min: { type: Number },
    max: { type: Number },
    pattern: { type: String },
    message: { type: String }
  },
  { _id: false }
);

const resourceFieldSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Field key is required'],
      trim: true
    },
    name: {
      type: String,
      trim: true
    },
    label: {
      type: String,
      required: [true, 'Field label is required'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Field type is required'],
      enum: [
        'text',
        'number',
        'email',
        'phone',
        'url',
        'date',
        'boolean',
        'select',
        'multiselect',
        'textarea',
        'richtext'
      ]
    },
    required: {
      type: Boolean,
      default: false
    },
    options: {
      type: [String],
      default: []
    },
    validation: {
      type: fieldValidationSchema,
      default: () => ({})
    },
    order: {
      type: Number,
      default: 0
    },
    searchable: {
      type: Boolean,
      default: false
    },
    filterable: {
      type: Boolean,
      default: false
    },
    sortable: {
      type: Boolean,
      default: false
    },
    showInList: {
      type: Boolean,
      default: true
    }
  },
  { _id: false }
);

// Pre-save hook: if 'name' is provided but 'key' is not, use 'name' as 'key'
resourceFieldSchema.pre('save', function(next) {
  if (this.name && !this.key) {
    this.key = this.name;
  }
  next();
});

const statusSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    color: { type: String, default: '#6366f1' }
  },
  { _id: false }
);

const transitionSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    label: { type: String, required: true },
    actions: { type: [mongoose.Schema.Types.Mixed], default: [] }
  },
  { _id: false }
);

const workflowSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    statusField: { type: String, default: 'status' },
    statuses: { type: [statusSchema], default: [] },
    transitions: { type: [transitionSchema], default: [] }
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    defaultSort: { type: String, default: 'createdAt' },
    defaultSortDir: { type: String, enum: ['asc', 'desc'], default: 'desc' },
    itemsPerPage: { type: Number, default: 10 }
  },
  { _id: false }
);

const resourceDefinitionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Resource slug name is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9_-]+$/, 'Name must be a lowercase alphanumeric slug']
    },
    label: {
      type: String,
      required: [true, 'Resource label is required'],
      trim: true
    },
    icon: {
      type: String,
      default: 'folder'
    },
    description: {
      type: String,
      default: ''
    },
    fields: {
      type: [resourceFieldSchema],
      default: []
    },
    workflow: {
      type: workflowSchema,
      default: () => ({ enabled: false, statusField: 'status', statuses: [], transitions: [] })
    },
    settings: {
      type: settingsSchema,
      default: () => ({ defaultSort: 'createdAt', defaultSortDir: 'desc', itemsPerPage: 10 })
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ResourceDefinition', resourceDefinitionSchema);
