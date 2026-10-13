const ResourceDefinition = require('../models/ResourceDefinition');
const ResourceRecord = require('../models/ResourceRecord');
const SyncLog = require('../models/SyncLog');
const Integration = require('../models/Integration');

/**
 * @desc Get system overview statistics and metrics
 * @route GET /api/overview
 */
const getOverviewStats = async (req, res, next) => {
  try {
    const [
      totalResources,
      resourceDefinitions,
      totalRecords,
      recordsByTypeAggregation,
      syncStatusAggregation,
      recentRecords,
      recentSyncLogs,
      activeIntegrations
    ] = await Promise.all([
      ResourceDefinition.countDocuments(),
      ResourceDefinition.find().select('name label icon').lean(),
      ResourceRecord.countDocuments(),
      ResourceRecord.aggregate([
        { $group: { _id: '$resourceType', count: { $sum: 1 } } }
      ]),
      ResourceRecord.aggregate([
        { $group: { _id: '$syncStatus', count: { $sum: 1 } } }
      ]),
      ResourceRecord.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      SyncLog.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Integration.find().select('name type enabled status lastSync').lean()
    ]);

    // Map counts to friendly resource type objects
    const countMap = {};
    for (const item of recordsByTypeAggregation) {
      countMap[item._id] = item.count;
    }

    const recordsPerResource = resourceDefinitions.map((def) => ({
      resourceType: def.name,
      label: def.label,
      icon: def.icon,
      count: countMap[def.name] || 0
    }));

    // For any untracked or custom types
    for (const item of recordsByTypeAggregation) {
      if (!resourceDefinitions.some((def) => def.name === item._id)) {
        recordsPerResource.push({
          resourceType: item._id,
          label: item._id,
          icon: 'database',
          count: item.count
        });
      }
    }

    // Format sync status summary
    const syncStatusSummary = {
      none: 0,
      synced: 0,
      pending: 0,
      error: 0
    };
    for (const item of syncStatusAggregation) {
      if (item._id && Object.prototype.hasOwnProperty.call(syncStatusSummary, item._id)) {
        syncStatusSummary[item._id] = item.count;
      }
    }

    res.json({
      success: true,
      data: {
        totalResources,
        totalRecords,
        recordsPerResource,
        syncStatusSummary,
        recentRecords,
        recentSyncLogs,
        activeIntegrations
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverviewStats
};
