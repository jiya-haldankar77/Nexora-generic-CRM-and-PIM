const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/integrationController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getIntegrations)
  .post(protect, upsertIntegration);

// Specific named WooCommerce routes BEFORE generic param routes
router.post('/woocommerce/sync', protect, syncWooCommerce);
router.post('/woocommerce/export/:recordId', protect, exportToWooCommerce);

// ID-prefixed routes (no ambiguity with :type)
router.get('/id/:id', protect, getIntegrationById);
router.get('/:id/resource-types', protect, getAvailableResourceTypes);
router.get('/:id/field-schema/:externalType', protect, getFieldSchema);

// Dynamic param routes - ordered: specific patterns first
// detectIdOrType middleware: if param looks like a MongoDB ObjectId, use ID handler
const detectIdOrType = (idHandler, typeHandler) => async (req, res, next) => {
  const param = req.params.id || req.params.type;
  if (/^[0-9a-fA-F]{24}$/.test(param)) {
    req.params.id = param;
    return idHandler(req, res, next);
  }
  req.params.type = param;
  return typeHandler(req, res, next);
};

// /:idOrType/test — routes test by ID or by type depending on param shape
router.post('/:type/test', protect, detectIdOrType(testConnectionById, testConnection));

// /:idOrType/sync — routes sync by ID or by type
router.post('/:type/sync', protect, detectIdOrType(syncIntegrationById, (req, res) => {
  res.status(400).json({ success: false, error: `Sync by type not supported — use integration ID` });
}));

// /:type — get integration by type name (must be LAST among :param routes)
router.get('/:type', protect, getIntegrationByType);

module.exports = router;

