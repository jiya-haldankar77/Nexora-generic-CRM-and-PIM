/**
 * NEXORA Agent Tools — Allowlisted, server-side action implementations.
 *
 * Each tool performs exactly one validated operation against the DB through
 * existing controllers/models. No raw queries — all access goes through
 * ResourceDefinition / ResourceRecord / Integration / WorkflowDefinition.
 */

'use strict';

const ResourceDefinition = require('../models/ResourceDefinition');
const ResourceRecord      = require('../models/ResourceRecord');
const Integration         = require('../models/Integration');
const WorkflowDefinition  = require('../models/WorkflowDefinition');
const SyncService         = require('../services/syncService');
const { validateRecordData } = require('../utils/fieldValidator');

// ── helpers ───────────────────────────────────────────────────────────────────

async function getResourceDefOrThrow(resourceType) {
  const def = await ResourceDefinition.findOne({ name: resourceType.toLowerCase() });
  if (!def) throw Object.assign(new Error(`Resource '${resourceType}' not found`), { statusCode: 404 });
  return def;
}

// ── Tool implementations ──────────────────────────────────────────────────────

/**
 * listResources — returns all resource definitions (names, labels, field count)
 */
async function listResources() {
  const defs = await ResourceDefinition.find().select('name label icon description fields').lean();
  return defs.map((d) => ({
    name: d.name,
    label: d.label,
    icon: d.icon,
    description: d.description,
    fieldCount: (d.fields || []).length
  }));
}

/**
 * getResource — return full schema for one resource type
 */
async function getResource({ resourceType }) {
  const def = await getResourceDefOrThrow(resourceType);
  return def.toObject();
}

/**
 * listRecords — list records for a resource type with optional filters
 * @param {string} resourceType
 * @param {Object} filter  — simple key/value filter (data.key = value)
 * @param {number} limit
 */
async function listRecords({ resourceType, filter = {}, limit = 20 }) {
  await getResourceDefOrThrow(resourceType);
  const query = { resourceType: resourceType.toLowerCase() };

  // Apply safe data field filters (prefix with data.)
  for (const [k, v] of Object.entries(filter)) {
    if (!['_id', 'resourceType', '__v'].includes(k)) {
      query[`data.${k}`] = v;
    }
  }

  const records = await ResourceRecord.find(query).limit(Math.min(limit, 100)).lean();
  return records;
}

/**
 * getRecord — get a single record by id + resourceType
 */
async function getRecord({ resourceType, id }) {
  await getResourceDefOrThrow(resourceType);
  const record = await ResourceRecord.findOne({
    _id: id,
    resourceType: resourceType.toLowerCase()
  }).lean();
  if (!record) throw Object.assign(new Error(`Record ${id} not found`), { statusCode: 404 });
  return record;
}

/**
 * createRecord — validate + create a record
 */
async function createRecord({ resourceType, data }) {
  const def = await getResourceDefOrThrow(resourceType);
  const { isValid, errors, sanitizedData } = validateRecordData(def, data, false);
  if (!isValid) {
    throw Object.assign(
      new Error(`Validation failed: ${errors.map((e) => e.message).join('; ')}`),
      { statusCode: 400, details: errors }
    );
  }

  // Set initial workflow status
  if (def.workflow?.enabled && def.workflow?.statusField) {
    const sf = def.workflow.statusField;
    if (!sanitizedData[sf] && def.workflow.statuses?.length > 0) {
      sanitizedData[sf] = def.workflow.statuses[0].key;
    }
  }

  const record = await ResourceRecord.create({
    resourceType: def.name,
    data: sanitizedData
  });
  return record.toObject();
}

/**
 * updateRecord — validate + update a record (partial)
 */
async function updateRecord({ resourceType, id, data }) {
  const def = await getResourceDefOrThrow(resourceType);
  const record = await ResourceRecord.findOne({ _id: id, resourceType: def.name });
  if (!record) throw Object.assign(new Error(`Record ${id} not found`), { statusCode: 404 });

  const { isValid, errors, sanitizedData } = validateRecordData(def, data, true);
  if (!isValid) {
    throw Object.assign(
      new Error(`Validation failed: ${errors.map((e) => e.message).join('; ')}`),
      { statusCode: 400, details: errors }
    );
  }

  record.data = { ...(record.data || {}), ...sanitizedData };
  record.markModified('data');
  await record.save();
  return record.toObject();
}

/**
 * deleteRecord — permanently delete a record (DESTRUCTIVE — requires confirmation)
 */
async function deleteRecord({ resourceType, id }) {
  await getResourceDefOrThrow(resourceType);
  const record = await ResourceRecord.findOneAndDelete({
    _id: id,
    resourceType: resourceType.toLowerCase()
  });
  if (!record) throw Object.assign(new Error(`Record ${id} not found`), { statusCode: 404 });
  return { deleted: true, id };
}

/**
 * transitionRecord — transition a record's workflow status
 */
async function transitionRecord({ resourceType, id, to, comment }) {
  const def = await getResourceDefOrThrow(resourceType);
  let workflow = await WorkflowDefinition.findOne({ resourceType: def.name, enabled: true });
  if (!workflow && def.workflow?.enabled) workflow = def.workflow;
  if (!workflow?.enabled) {
    throw Object.assign(
      new Error(`Workflows not enabled for '${resourceType}'`),
      { statusCode: 400 }
    );
  }

  const record = await ResourceRecord.findOne({ _id: id, resourceType: def.name });
  if (!record) throw Object.assign(new Error(`Record ${id} not found`), { statusCode: 404 });

  const sf = workflow.statusField || 'status';
  const current = record.data?.[sf] || 'initial';
  const transitions = workflow.transitions || [];
  const valid = transitions.find((t) => (t.from === current || t.from === '*') && t.to === to);

  if (!valid) {
    const allowed = transitions
      .filter((t) => t.from === current || t.from === '*')
      .map((t) => t.to);
    throw Object.assign(
      new Error(`Invalid transition '${current}' → '${to}'. Allowed: ${allowed.join(', ') || 'none'}`),
      { statusCode: 400, allowed }
    );
  }

  const history = Array.isArray(record.data._workflowHistory) ? record.data._workflowHistory : [];
  record.data[sf] = to;
  record.data._workflowHistory = [...history, {
    from: current, to,
    transitionLabel: valid.label,
    comment: comment || '',
    userId: 'agent',
    timestamp: new Date().toISOString()
  }];
  record.markModified('data');
  await record.save();
  return record.toObject();
}

/**
 * listIntegrations — list all configured integrations (sensitive fields masked)
 */
async function listIntegrations() {
  const integrations = await Integration.find().lean();
  return integrations.map((i) => ({
    _id: i._id,
    name: i.name,
    type: i.type,
    enabled: i.enabled,
    status: i.status,
    lastSync: i.lastSync
  }));
}

/**
 * triggerSync — trigger a WooCommerce sync (DESTRUCTIVE — requires confirmation)
 */
async function triggerSync({ integrationId }) {
  const integration = await Integration.findById(integrationId);
  if (!integration) throw Object.assign(new Error(`Integration ${integrationId} not found`), { statusCode: 404 });
  if (!integration.enabled) throw Object.assign(new Error('Integration is disabled'), { statusCode: 400 });
  if (integration.type !== 'woocommerce') {
    throw Object.assign(new Error(`Sync not implemented for type: ${integration.type}`), { statusCode: 400 });
  }
  const log = await SyncService.syncWooCommerceProducts({});
  return { syncLog: log };
}

/**
 * listWorkflows — list all workflow configurations
 */
async function listWorkflows() {
  const [standaloneDefs, resourceDefs] = await Promise.all([
    WorkflowDefinition.find().lean(),
    ResourceDefinition.find().select('name label workflow').lean()
  ]);
  const standaloneMap = {};
  for (const wf of standaloneDefs) standaloneMap[wf.resourceType] = wf;

  return resourceDefs.map((rd) => {
    const s = standaloneMap[rd.name];
    return s ? { ...s, source: 'standalone' } : {
      resourceType: rd.name,
      name: `${rd.label} Workflow`,
      enabled: rd.workflow?.enabled || false,
      statusField: rd.workflow?.statusField || 'status',
      statuses: rd.workflow?.statuses || [],
      transitions: rd.workflow?.transitions || [],
      source: 'embedded'
    };
  });
}

// ── Tool registry ─────────────────────────────────────────────────────────────

const TOOLS = {
  listResources,
  getResource,
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  transitionRecord,
  listIntegrations,
  triggerSync,
  listWorkflows
};

/**
 * Execute a named tool with validated args.
 * @param {string} toolName
 * @param {Object} args
 * @returns {Promise<any>}
 */
async function executeTool(toolName, args) {
  const fn = TOOLS[toolName];
  if (!fn) throw new Error(`Unknown tool: '${toolName}'`);
  return fn(args);
}

module.exports = { TOOLS, executeTool };
