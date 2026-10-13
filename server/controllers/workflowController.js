const ResourceDefinition = require('../models/ResourceDefinition');
const ResourceRecord = require('../models/ResourceRecord');
const WorkflowDefinition = require('../models/WorkflowDefinition');

/**
 * @desc List all workflow definitions (standalone + embedded in resource defs)
 * @route GET /api/workflows
 */
const listWorkflows = async (req, res, next) => {
  try {
    const [standaloneDefs, resourceDefs] = await Promise.all([
      WorkflowDefinition.find().lean(),
      ResourceDefinition.find().select('name label workflow').lean()
    ]);

    const standaloneMap = {};
    for (const wf of standaloneDefs) {
      standaloneMap[wf.resourceType] = wf;
    }

    const workflows = resourceDefs.map((rd) => {
      const standalone = standaloneMap[rd.name];
      return standalone
        ? { ...standalone, source: 'standalone' }
        : {
            resourceType: rd.name,
            name: `${rd.label} Workflow`,
            enabled: rd.workflow?.enabled || false,
            statusField: rd.workflow?.statusField || 'status',
            statuses: rd.workflow?.statuses || [],
            transitions: rd.workflow?.transitions || [],
            source: 'embedded'
          };
    });

    res.json({
      success: true,
      count: workflows.length,
      data: workflows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get workflow configuration for a resource type
 * @route GET /api/workflows/:resourceType
 */
const getWorkflow = async (req, res, next) => {
  try {
    const { resourceType } = req.params;
    const resourceDef = await ResourceDefinition.findOne({ name: resourceType.toLowerCase() });

    if (!resourceDef) {
      return res.status(404).json({
        success: false,
        error: `Resource definition '${resourceType}' not found`
      });
    }

    const workflowDef = await WorkflowDefinition.findOne({ resourceType: resourceDef.name });

    const workflow = workflowDef || resourceDef.workflow || {
      enabled: false,
      statusField: 'status',
      statuses: [],
      transitions: []
    };

    res.json({
      success: true,
      resourceType: resourceDef.name,
      data: workflow
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create or update workflow configuration for a resource type
 * @route PUT /api/workflows/:resourceType
 */
const saveWorkflow = async (req, res, next) => {
  try {
    const { resourceType } = req.params;
    const { enabled, statusField, statuses, transitions, name, description } = req.body;

    const resourceDef = await ResourceDefinition.findOne({ name: resourceType.toLowerCase() });
    if (!resourceDef) {
      return res.status(404).json({
        success: false,
        error: `Resource definition '${resourceType}' not found`
      });
    }

    const workflow = await WorkflowDefinition.findOneAndUpdate(
      { resourceType: resourceDef.name },
      {
        $set: {
          resourceType: resourceDef.name,
          enabled: enabled !== undefined ? enabled : true,
          statusField: statusField || 'status',
          statuses: statuses || [],
          transitions: transitions || [],
          name: name || `${resourceDef.label} Workflow`,
          description: description || ''
        }
      },
      { new: true, upsert: true }
    );

    // Also sync back to resource definition workflow property
    resourceDef.workflow = {
      enabled: workflow.enabled,
      statusField: workflow.statusField,
      statuses: workflow.statuses,
      transitions: workflow.transitions
    };
    await resourceDef.save();

    res.json({
      success: true,
      message: 'Workflow configuration updated successfully',
      data: workflow
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get workflow history of a record
 * @route GET /api/workflows/:resourceType/:id/history
 */
const getRecordHistory = async (req, res, next) => {
  try {
    const { resourceType, id } = req.params;
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

    const history = record.data?._workflowHistory || [];

    res.json({
      success: true,
      resourceType,
      recordId: id,
      count: history.length,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listWorkflows,
  getWorkflow,
  saveWorkflow,
  getRecordHistory
};

