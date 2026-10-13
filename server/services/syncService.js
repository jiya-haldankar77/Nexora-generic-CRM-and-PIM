const ResourceRecord = require('../models/ResourceRecord');
const ResourceDefinition = require('../models/ResourceDefinition');
const SyncLog = require('../models/SyncLog');
const Integration = require('../models/Integration');
const WooCommerceAdapter = require('./woocommerceAdapter');

class SyncService {
  /**
   * Sync from WooCommerce into NEXORA records based on dynamic resource mapping
   */
  static async syncWooCommerce(options = {}) {
    const startTime = Date.now();
    const adapter = new WooCommerceAdapter();
    
    // Get integration configuration
    const integration = await Integration.findOne({ type: 'woocommerce' });
    if (!integration) {
      throw new Error('WooCommerce integration not configured');
    }

    const errors = [];
    let totalRecordsProcessed = 0;
    let totalRecordsSuccess = 0;
    let totalRecordsError = 0;
    const syncLogs = [];

    // Process each enabled resource mapping
    for (const mapping of integration.resourceMappings.filter(m => m.enabled)) {
      const resourceType = mapping.resourceType;
      const externalType = mapping.externalType;
      const fieldMappings = mapping.fieldMappings;

      // Verify resource definition exists
      const resourceDef = await ResourceDefinition.findOne({ name: resourceType });
      if (!resourceDef) {
        errors.push({
          resourceType,
          message: `Resource definition for '${resourceType}' not found`
        });
        continue;
      }

      let recordsProcessed = 0;
      let recordsSuccess = 0;
      let recordsError = 0;

      try {
        let externalData = [];
        
        // Fetch data based on external type
        if (externalType === 'product') {
          const result = await adapter.getProducts({
            page: options.page || 1,
            per_page: options.perPage || 50
          });
          externalData = result.data;
        } else if (externalType === 'customer') {
          const result = await adapter.getCustomers({
            page: options.page || 1,
            per_page: options.perPage || 50
          });
          externalData = result.data;
        } else if (externalType === 'order') {
          const result = await adapter.getOrders({
            page: options.page || 1,
            per_page: options.perPage || 50
          });
          externalData = result.data;
        } else {
          errors.push({
            resourceType,
            message: `Unsupported external type: ${externalType}`
          });
          continue;
        }

        recordsProcessed = externalData.length;

        for (const externalItem of externalData) {
          try {
            const mapped = adapter.mapWooToResource(externalItem, externalType, fieldMappings);

            // Find existing record by externalId and resourceType
            let record = await ResourceRecord.findOne({
              resourceType,
              externalId: mapped.externalId
            });

            if (record) {
              record.data = { ...record.data, ...mapped.data };
              record.externalId = mapped.externalId;
              record.syncSource = 'woocommerce';
              record.syncStatus = 'synced';
              record.syncError = null;
              record.lastSyncedAt = new Date();
              await record.save();
            } else {
              record = await ResourceRecord.create({
                resourceType,
                data: mapped.data,
                externalId: mapped.externalId,
                syncSource: 'woocommerce',
                syncStatus: 'synced',
                syncError: null,
                lastSyncedAt: new Date()
              });
            }

            recordsSuccess++;
          } catch (itemErr) {
            recordsError++;
            errors.push({
              resourceType,
              recordId: String(externalItem.id),
              message: itemErr.message || 'Error syncing item'
            });
          }
        }

        const duration = Date.now() - startTime;
        const status =
          recordsError === 0
            ? 'success'
            : recordsSuccess > 0
            ? 'partial'
            : 'error';

        // Record in SyncLog for this resource type
        const log = await SyncLog.create({
          integration: 'woocommerce',
          resourceType,
          operation: 'import',
          status,
          recordsProcessed,
          recordsSuccess,
          recordsError,
          errors: errors.filter(e => e.resourceType === resourceType),
          duration
        });

        syncLogs.push(log);
        totalRecordsProcessed += recordsProcessed;
        totalRecordsSuccess += recordsSuccess;
        totalRecordsError += recordsError;

      } catch (err) {
        recordsError = recordsProcessed;
        errors.push({
          resourceType,
          message: err.message
        });
      }
    }

    // Update Integration metadata
    await Integration.findOneAndUpdate(
      { type: 'woocommerce' },
      {
        $set: {
          lastSync: new Date(),
          status: totalRecordsError > 0 ? 'error' : 'idle'
        }
      },
      { upsert: false }
    );

    return {
      success: true,
      syncLogs,
      totalRecordsProcessed,
      totalRecordsSuccess,
      totalRecordsError,
      errors
    };
  }

  /**
   * Legacy method for backward compatibility
   */
  static async syncWooCommerceProducts(options = {}) {
    return this.syncWooCommerce(options);
  }

  /**
   * Export single or multiple NEXORA products to WooCommerce
   */
  static async exportProductToWooCommerce(recordId) {
    const startTime = Date.now();
    const adapter = new WooCommerceAdapter();
    const record = await ResourceRecord.findById(recordId);

    if (!record) {
      throw new Error(`Record with ID ${recordId} not found.`);
    }

    try {
      let wcResponse;
      if (record.externalId) {
        wcResponse = await adapter.updateProduct(record.externalId, record.data);
      } else {
        wcResponse = await adapter.createProduct(record.data);
        record.externalId = String(wcResponse.id);
      }

      record.syncSource = 'woocommerce';
      record.syncStatus = 'synced';
      record.syncError = null;
      record.lastSyncedAt = new Date();
      await record.save();

      const duration = Date.now() - startTime;
      await SyncLog.create({
        integration: 'woocommerce',
        resourceType: record.resourceType,
        operation: 'export',
        status: 'success',
        recordsProcessed: 1,
        recordsSuccess: 1,
        recordsError: 0,
        errors: [],
        duration
      });

      return record;
    } catch (err) {
      const duration = Date.now() - startTime;
      record.syncStatus = 'error';
      record.syncError = err.message;
      await record.save();

      await SyncLog.create({
        integration: 'woocommerce',
        resourceType: record.resourceType,
        operation: 'export',
        status: 'error',
        recordsProcessed: 1,
        recordsSuccess: 0,
        recordsError: 1,
        errors: [{ recordId: String(record._id), message: err.message }],
        duration
      });

      throw err;
    }
  }
}

module.exports = SyncService;
