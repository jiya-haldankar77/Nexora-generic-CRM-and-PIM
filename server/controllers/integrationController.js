const Integration = require('../models/Integration');
const SyncService = require('../services/syncService');
const WooCommerceAdapter = require('../services/woocommerceAdapter');

/**
 * @desc List all integrations
 * @route GET /api/integrations
 */
const getIntegrations = async (req, res, next) => {
  try {
    let integrations = await Integration.find();

    // If no integrations exist yet, create default WooCommerce record
    if (integrations.length === 0) {
      const defaultWc = await Integration.create({
        name: 'WooCommerce Store',
        type: 'woocommerce',
        config: {
          url: process.env.WOOCOMMERCE_URL || 'https://example-shop.com',
          consumerKey: process.env.WOOCOMMERCE_KEY || 'ck_live_demo',
          consumerSecret: process.env.WOOCOMMERCE_SECRET || 'cs_live_demo'
        },
        resourceMappings: [
          {
            resourceType: 'product',
            externalType: 'product',
            fieldMappings: {
              name: 'name',
              sku: 'sku',
              price: 'regular_price',
              stock: 'stock_quantity',
              description: 'description'
            }
          }
        ],
        enabled: true,
        status: 'idle'
      });
      integrations = [defaultWc];
    }

    const safeList = integrations.map((i) => i.toSafeObject ? i.toSafeObject() : i);

    res.json({
      success: true,
      count: safeList.length,
      data: safeList
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single integration by type
 * @route GET /api/integrations/:type
 */
const getIntegrationByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    const integration = await Integration.findOne({ type: type.toLowerCase() });

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: `Integration '${type}' not configured`
      });
    }

    res.json({
      success: true,
      data: integration.toSafeObject ? integration.toSafeObject() : integration
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single integration by MongoDB ID
 * @route GET /api/integrations/id/:id
 */
const getIntegrationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const integration = await Integration.findById(id);

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: `Integration with ID '${id}' not found`
      });
    }

    res.json({
      success: true,
      data: integration.toSafeObject ? integration.toSafeObject() : integration
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create or update integration configuration
 * @route POST /api/integrations
 */
const upsertIntegration = async (req, res, next) => {
  try {
    const { name, type, config, resourceMappings, enabled } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Integration type is required (woocommerce, shopify, salesforce)'
      });
    }

    const integration = await Integration.findOneAndUpdate(
      { type: type.toLowerCase() },
      {
        $set: {
          name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} Integration`,
          type: type.toLowerCase(),
          config: config || {},
          resourceMappings: resourceMappings || [],
          enabled: enabled !== undefined ? enabled : true
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: `${type} integration configuration saved`,
      data: integration.toSafeObject ? integration.toSafeObject() : integration
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Test connection to integration (e.g. WooCommerce)
 * @route POST /api/integrations/:type/test
 */
const testConnection = async (req, res, next) => {
  try {
    const { type } = req.params;

    if (type.toLowerCase() === 'woocommerce') {
      const adapter = new WooCommerceAdapter(req.body.config || null);
      const testResult = await adapter.testConnection();
      return res.json({
        success: true,
        type: 'woocommerce',
        result: testResult
      });
    }

    return res.json({
      success: true,
      type,
      result: {
        mock: true,
        message: `Simulation test succeeded for ${type}`
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Test connection to integration by MongoDB ID
 * @route POST /api/integrations/:id/test
 */
const testConnectionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const integration = await Integration.findById(id);

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: `Integration with ID '${id}' not found`
      });
    }

    if (integration.type === 'woocommerce') {
      const adapter = new WooCommerceAdapter(integration.config || null);
      const testResult = await adapter.testConnection();
      return res.json({
        success: true,
        type: 'woocommerce',
        result: testResult
      });
    }

    return res.json({
      success: true,
      type: integration.type,
      result: {
        mock: true,
        message: `Simulation test succeeded for ${integration.type}`
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Trigger manual product sync for WooCommerce
 * @route POST /api/integrations/woocommerce/sync
 */
const syncWooCommerce = async (req, res, next) => {
  try {
    const { page, perPage } = req.body;
    console.log('[IntegrationController] Triggering WooCommerce product sync...');

    const log = await SyncService.syncWooCommerceProducts({ page, perPage });

    res.json({
      success: true,
      message: 'WooCommerce synchronization finished',
      syncLog: log
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Trigger sync for integration by MongoDB ID
 * @route POST /api/integrations/:id/sync
 */
const syncIntegrationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, perPage } = req.body;
    
    console.log(`[IntegrationController] Triggering sync for integration ID: ${id}`);

    const integration = await Integration.findById(id);

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: `Integration with ID '${id}' not found`
      });
    }

    if (!integration.enabled) {
      return res.status(400).json({
        success: false,
        error: 'Integration is disabled. Enable it first before syncing.'
      });
    }

    let syncLog;
    if (integration.type === 'woocommerce') {
      syncLog = await SyncService.syncWooCommerceProducts({ page, perPage });
    } else {
      return res.status(400).json({
        success: false,
        error: `Sync not implemented for integration type: ${integration.type}`
      });
    }

    // Update integration's lastSync timestamp
    integration.lastSync = new Date();
    integration.status = 'idle';
    await integration.save();

    res.json({
      success: true,
      message: `${integration.type.charAt(0).toUpperCase() + integration.type.slice(1)} synchronization finished`,
      syncLog: syncLog
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get available external resource types for an integration
 * @route GET /api/integrations/:id/resource-types
 */
const getAvailableResourceTypes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const integration = await Integration.findById(id);

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: `Integration with ID '${id}' not found`
      });
    }

    let resourceTypes = [];

    if (integration.type === 'woocommerce') {
      const adapter = new WooCommerceAdapter(integration.config || null);
      resourceTypes = adapter.getAvailableResourceTypes();
    } else {
      return res.status(400).json({
        success: false,
        error: `Resource type listing not implemented for ${integration.type}`
      });
    }

    res.json({
      success: true,
      data: resourceTypes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get field schema for external resource type
 * @route GET /api/integrations/:id/field-schema/:externalType
 */
const getFieldSchema = async (req, res, next) => {
  try {
    const { id, externalType } = req.params;
    const integration = await Integration.findById(id);

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: `Integration with ID '${id}' not found`
      });
    }

    let schema = [];

    if (integration.type === 'woocommerce') {
      const adapter = new WooCommerceAdapter(integration.config || null);
      schema = adapter.getFieldSchema(externalType);
    } else {
      return res.status(400).json({
        success: false,
        error: `Field schema not implemented for ${integration.type}`
      });
    }

    res.json({
      success: true,
      data: schema
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Export single product record to WooCommerce
 * @route POST /api/integrations/woocommerce/export/:recordId
 */
const exportToWooCommerce = async (req, res, next) => {
  try {
    const { recordId } = req.params;
    const updatedRecord = await SyncService.exportProductToWooCommerce(recordId);

    res.json({
      success: true,
      message: 'Product successfully exported to WooCommerce',
      data: updatedRecord
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIntegrations,
  getIntegrationByType,
  getIntegrationById,
  upsertIntegration,
  testConnection,
  testConnectionById,
  syncWooCommerce,
  syncIntegrationById,
  exportToWooCommerce,
  getAvailableResourceTypes,
  getFieldSchema
};
