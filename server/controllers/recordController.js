const ResourceDefinition = require('../models/ResourceDefinition');
const ResourceRecord = require('../models/ResourceRecord');
const WorkflowDefinition = require('../models/WorkflowDefinition');
const { buildRecordQuery } = require('../utils/queryBuilder');
const { validateRecordData } = require('../utils/fieldValidator');

/**
 * Helper to fetch resource definition by slug
 */
async function getResourceDefOrThrow(resourceType) {
  const resourceDef = await ResourceDefinition.findOne({ name: resourceType.toLowerCase() });
  if (!resourceDef) {
    const error = new Error(`Resource definition '${resourceType}' not found`);
    error.statusCode = 404;
    throw error;
  }
  return resourceDef;
}

/**
 * @desc Get records for a given resource type with dynamic search, filter, sort & pagination
 * @route GET /api/records/:resourceType
 */
const getRecords = async (req, res, next) => {
  try {
    const { resourceType } = req.params;
    const resourceDef = await getResourceDefOrThrow(resourceType);

    const { filterQuery, sortOption, page, limit, skip } = buildRecordQuery(
      resourceDef,
      req.query
    );

    const [records, total] = await Promise.all([
      ResourceRecord.find(filterQuery)
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      ResourceRecord.countDocuments(filterQuery)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.json({
      success: true,
      resourceType: resourceDef.name,
      count: records.length,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      data: records
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get a single record by ID
 * @route GET /api/records/:resourceType/:id
 */
const getRecordById = async (req, res, next) => {
  try {
    const { resourceType, id } = req.params;
    await getResourceDefOrThrow(resourceType);

    const record = await ResourceRecord.findOne({
      _id: id,
      resourceType: resourceType.toLowerCase()
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: `Record ${id} not found for resource '${resourceType}'`
      });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create a new record validated against resource schema
 * @route POST /api/records/:resourceType
 */
const createRecord = async (req, res, next) => {
  try {
    const { resourceType } = req.params;
    const resourceDef = await getResourceDefOrThrow(resourceType);

    const inputData = req.body.data !== undefined ? req.body.data : req.body;
    const { isValid, errors, sanitizedData } = validateRecordData(
      resourceDef,
      inputData,
      false
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed for record data',
        details: errors
      });
    }

    // Set initial workflow status if defined and not already provided
    if (resourceDef.workflow?.enabled && resourceDef.workflow?.statusField) {
      const statusField = resourceDef.workflow.statusField;
      if (!sanitizedData[statusField] && resourceDef.workflow.statuses?.length > 0) {
        sanitizedData[statusField] = resourceDef.workflow.statuses[0].key;
      }
    }

    const newRecord = await ResourceRecord.create({
      resourceType: resourceDef.name,
      data: sanitizedData,
      externalId: req.body.externalId || null,
      syncSource: req.body.syncSource || null,
      syncStatus: req.body.syncStatus || 'none'
    });

    res.status(201).json({
      success: true,
      data: newRecord
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update an existing record validated against resource schema
 * @route PUT /api/records/:resourceType/:id
 */
const updateRecord = async (req, res, next) => {
  try {
    const { resourceType, id } = req.params;
    const resourceDef = await getResourceDefOrThrow(resourceType);

    const record = await ResourceRecord.findOne({
      _id: id,
      resourceType: resourceDef.name
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: `Record ${id} not found for resource '${resourceType}'`
      });
    }

    const inputData = req.body.data !== undefined ? req.body.data : req.body;
    const { isValid, errors, sanitizedData } = validateRecordData(
      resourceDef,
      inputData,
      true
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed for record data',
        details: errors
      });
    }

    // Merge sanitized updates into record data
    record.data = {
      ...(record.data || {}),
      ...sanitizedData
    };

    if (req.body.externalId !== undefined) record.externalId = req.body.externalId;
    if (req.body.syncSource !== undefined) record.syncSource = req.body.syncSource;
    if (req.body.syncStatus !== undefined) record.syncStatus = req.body.syncStatus;
    if (req.body.syncError !== undefined) record.syncError = req.body.syncError;

    record.markModified('data');
    await record.save();

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete a record
 * @route DELETE /api/records/:resourceType/:id
 */
const deleteRecord = async (req, res, next) => {
  try {
    const { resourceType, id } = req.params;
    await getResourceDefOrThrow(resourceType);

    const record = await ResourceRecord.findOneAndDelete({
      _id: id,
      resourceType: resourceType.toLowerCase()
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: `Record ${id} not found for resource '${resourceType}'`
      });
    }

    res.json({
      success: true,
      message: 'Record successfully deleted',
      deletedId: id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Trigger workflow transition on a record
 * @route POST /api/records/:resourceType/:id/transition
 */
const transitionRecord = async (req, res, next) => {
  try {
    const { resourceType, id } = req.params;
    const { to, comment, userId } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        error: "Target status 'to' is required in request body"
      });
    }

    const resourceDef = await getResourceDefOrThrow(resourceType);

    // Retrieve workflow configuration from standalone WorkflowDefinition or resourceDef.workflow
    let workflow = await WorkflowDefinition.findOne({ resourceType: resourceDef.name, enabled: true });
    if (!workflow && resourceDef.workflow?.enabled) {
      workflow = resourceDef.workflow;
    }

    if (!workflow || !workflow.enabled) {
      return res.status(400).json({
        success: false,
        error: `Workflows are not enabled for resource '${resourceType}'`
      });
    }

    const record = await ResourceRecord.findOne({
      _id: id,
      resourceType: resourceDef.name
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: `Record ${id} not found for resource '${resourceType}'`
      });
    }

    const statusField = workflow.statusField || 'status';
    const currentStatus = record.data?.[statusField] || 'initial';

    // Verify allowed transition
    const transitions = workflow.transitions || [];
    const validTransition = transitions.find(
      (t) => (t.from === currentStatus || t.from === '*') && t.to === to
    );

    if (!validTransition) {
      return res.status(400).json({
        success: false,
        error: `Invalid transition from '${currentStatus}' to '${to}'`,
        allowedTransitions: transitions
          .filter((t) => t.from === currentStatus || t.from === '*')
          .map((t) => ({ to: t.to, label: t.label }))
      });
    }

    // Execute transition actions (e.g. notifications / webhooks)
    const executedActions = [];
    if (validTransition.actions && validTransition.actions.length > 0) {
      for (const action of validTransition.actions) {
        console.log(`[Workflow Engine] Executing action '${action.type}' for transition ${currentStatus} -> ${to}`);
        executedActions.push({
          type: action.type,
          executedAt: new Date().toISOString(),
          status: 'success'
        });
      }
    }

    // Log history in record data
    const historyEntry = {
      from: currentStatus,
      to,
      transitionLabel: validTransition.label,
      comment: comment || '',
      userId: userId || 'system',
      timestamp: new Date().toISOString()
    };

    const currentHistory = Array.isArray(record.data._workflowHistory)
      ? record.data._workflowHistory
      : [];

    record.data[statusField] = to;
    record.data._workflowHistory = [...currentHistory, historyEntry];
    record.markModified('data');

    await record.save();

    res.json({
      success: true,
      message: `Transitioned successfully from '${currentStatus}' to '${to}'`,
      data: record,
      executedActions
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
  transitionRecord
};
