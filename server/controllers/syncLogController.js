const SyncLog = require('../models/SyncLog');

/**
 * @desc Get sync logs with optional filtering & pagination
 * @route GET /api/sync-logs
 */
const getSyncLogs = async (req, res, next) => {
  try {
    const { integration, resourceType, status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (integration) query.integration = integration;
    if (resourceType) query.resourceType = resourceType;
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      SyncLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      SyncLog.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: logs.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single sync log by ID
 * @route GET /api/sync-logs/:id
 */
const getSyncLogById = async (req, res, next) => {
  try {
    const log = await SyncLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({
        success: false,
        error: `Sync log ${req.params.id} not found`
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Clear sync logs (optional utility)
 * @route DELETE /api/sync-logs
 */
const clearSyncLogs = async (req, res, next) => {
  try {
    const result = await SyncLog.deleteMany({});
    res.json({
      success: true,
      message: 'All sync logs cleared',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSyncLogs,
  getSyncLogById,
  clearSyncLogs
};
