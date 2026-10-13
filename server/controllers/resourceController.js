const ResourceDefinition = require('../models/ResourceDefinition');
const ResourceRecord = require('../models/ResourceRecord');

/**
 * Seed default resources: customer and product
 */
const seedDefaultResources = async () => {
  try {
    const customerExists = await ResourceDefinition.findOne({ name: 'customer' });
    if (!customerExists) {
      await ResourceDefinition.create({
        name: 'customer',
        label: 'Customer',
        icon: 'users',
        description: 'Customer directory and lead tracking',
        fields: [
          {
            key: 'name',
            label: 'Full Name',
            type: 'text',
            required: true,
            order: 1,
            searchable: true,
            filterable: false,
            sortable: true,
            showInList: true
          },
          {
            key: 'email',
            label: 'Email Address',
            type: 'email',
            required: true,
            order: 2,
            searchable: true,
            filterable: false,
            sortable: true,
            showInList: true
          },
          {
            key: 'phone',
            label: 'Phone Number',
            type: 'phone',
            required: false,
            order: 3,
            searchable: true,
            filterable: false,
            sortable: false,
            showInList: true
          },
          {
            key: 'company',
            label: 'Company',
            type: 'text',
            required: false,
            order: 4,
            searchable: true,
            filterable: true,
            sortable: true,
            showInList: true
          },
          {
            key: 'status',
            label: 'Customer Status',
            type: 'select',
            required: true,
            options: ['lead', 'active', 'inactive'],
            order: 5,
            searchable: false,
            filterable: true,
            sortable: true,
            showInList: true
          },
          {
            key: 'notes',
            label: 'Notes',
            type: 'textarea',
            required: false,
            order: 6,
            searchable: true,
            filterable: false,
            sortable: false,
            showInList: false
          }
        ],
        workflow: {
          enabled: true,
          statusField: 'status',
          statuses: [
            { key: 'lead', label: 'Lead', color: '#f59e0b' },
            { key: 'active', label: 'Active', color: '#10b981' },
            { key: 'inactive', label: 'Inactive', color: '#6b7280' }
          ],
          transitions: [
            { from: 'lead', to: 'active', label: 'Convert to Active' },
            { from: 'active', to: 'inactive', label: 'Deactivate' },
            { from: 'inactive', to: 'active', label: 'Reactivate' }
          ]
        },
        settings: {
          defaultSort: 'createdAt',
          defaultSortDir: 'desc',
          itemsPerPage: 10
        }
      });
      console.log("[Seeder] Seeded 'customer' resource definition");
    }

    const productExists = await ResourceDefinition.findOne({ name: 'product' });
    if (!productExists) {
      await ResourceDefinition.create({
        name: 'product',
        label: 'Product',
        icon: 'package',
        description: 'Product catalog with eCommerce inventory synchronization',
        fields: [
          {
            key: 'name',
            label: 'Product Name',
            type: 'text',
            required: true,
            order: 1,
            searchable: true,
            filterable: false,
            sortable: true,
            showInList: true
          },
          {
            key: 'sku',
            label: 'SKU',
            type: 'text',
            required: true,
            order: 2,
            searchable: true,
            filterable: true,
            sortable: true,
            showInList: true
          },
          {
            key: 'price',
            label: 'Price',
            type: 'number',
            required: true,
            validation: { min: 0 },
            order: 3,
            searchable: false,
            filterable: true,
            sortable: true,
            showInList: true
          },
          {
            key: 'category',
            label: 'Category',
            type: 'select',
            required: false,
            options: ['electronics', 'clothing', 'food', 'other'],
            order: 4,
            searchable: false,
            filterable: true,
            sortable: true,
            showInList: true
          },
          {
            key: 'stock',
            label: 'Stock Quantity',
            type: 'number',
            required: false,
            validation: { min: 0 },
            order: 5,
            searchable: false,
            filterable: true,
            sortable: true,
            showInList: true
          },
          {
            key: 'description',
            label: 'Description',
            type: 'textarea',
            required: false,
            order: 6,
            searchable: true,
            filterable: false,
            sortable: false,
            showInList: false
          },
          {
            key: 'active',
            label: 'Active',
            type: 'boolean',
            required: false,
            order: 7,
            searchable: false,
            filterable: true,
            sortable: true,
            showInList: true
          }
        ],
        workflow: {
          enabled: false,
          statusField: 'active',
          statuses: [],
          transitions: []
        },
        settings: {
          defaultSort: 'createdAt',
          defaultSortDir: 'desc',
          itemsPerPage: 10
        }
      });
      console.log("[Seeder] Seeded 'product' resource definition");
    }
  } catch (error) {
    console.error('[Seeder Error] Failed to seed default resources:', error.message);
  }
};

/**
 * @desc Get all resource definitions
 * @route GET /api/resources
 */
const getResources = async (req, res, next) => {
  try {
    const resources = await ResourceDefinition.find().sort({ label: 1 });
    res.json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single resource definition by name (slug) or ID
 * @route GET /api/resources/:identifier
 */
const getResource = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    let resource;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      resource = await ResourceDefinition.findById(identifier);
    }
    if (!resource) {
      resource = await ResourceDefinition.findOne({ name: identifier.toLowerCase() });
    }

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: `Resource '${identifier}' not found`
      });
    }

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create new resource definition
 * @route POST /api/resources
 */
const createResource = async (req, res, next) => {
  try {
    const { name, label, icon, description, fields, workflow, settings } = req.body;

    const existing = await ResourceDefinition.findOne({ name: name.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `Resource with slug '${name}' already exists`
      });
    }

    const resource = await ResourceDefinition.create({
      name: name.toLowerCase().trim(),
      label,
      icon,
      description,
      fields: fields || [],
      workflow: workflow || { enabled: false },
      settings: settings || {}
    });

    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update resource definition
 * @route PUT /api/resources/:identifier
 */
const updateResource = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    let query = { name: identifier.toLowerCase() };

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: identifier };
    }

    const resource = await ResourceDefinition.findOne(query);
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: `Resource '${identifier}' not found`
      });
    }

    const allowedUpdates = ['label', 'icon', 'description', 'fields', 'workflow', 'settings'];
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        resource[key] = req.body[key];
      }
    }

    await resource.save();

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete resource definition
 * @route DELETE /api/resources/:identifier
 */
const deleteResource = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    let resource;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      resource = await ResourceDefinition.findById(identifier);
    }
    if (!resource) {
      resource = await ResourceDefinition.findOne({ name: identifier.toLowerCase() });
    }

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: `Resource '${identifier}' not found`
      });
    }

    // Optional check: delete or preserve associated records
    const recordCount = await ResourceRecord.countDocuments({ resourceType: resource.name });
    if (req.query.cascade === 'true') {
      await ResourceRecord.deleteMany({ resourceType: resource.name });
    } else if (recordCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete resource '${resource.name}' because it contains ${recordCount} record(s). Pass ?cascade=true to force delete.`
      });
    }

    await ResourceDefinition.findByIdAndDelete(resource._id);

    res.json({
      success: true,
      message: `Resource '${resource.name}' successfully deleted`,
      deletedRecordCount: req.query.cascade === 'true' ? recordCount : 0
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  seedDefaultResources,
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource
};
