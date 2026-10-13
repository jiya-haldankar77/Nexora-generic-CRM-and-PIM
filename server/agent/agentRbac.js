/**
 * NEXORA Agent RBAC — Role-Based Access Control
 * Defines which roles can invoke which tools on which resource types.
 *
 * Roles: admin > operator > viewer
 * Tools (allowlisted): listRecords, getRecord, createRecord, updateRecord,
 *   deleteRecord (destructive), transitionRecord, listResources, getResource,
 *   listIntegrations, triggerSync (destructive), listWorkflows
 */

'use strict';

// ── Permission Matrix ─────────────────────────────────────────────────────────
// tool → roles that may call it
const TOOL_PERMISSIONS = {
  listRecords:       ['admin', 'operator', 'viewer'],
  getRecord:         ['admin', 'operator', 'viewer'],
  createRecord:      ['admin', 'operator'],
  updateRecord:      ['admin', 'operator'],
  deleteRecord:      ['admin'],                     // destructive
  transitionRecord:  ['admin', 'operator'],
  listResources:     ['admin', 'operator', 'viewer'],
  getResource:       ['admin', 'operator', 'viewer'],
  listIntegrations:  ['admin', 'operator', 'viewer'],
  triggerSync:       ['admin'],                     // destructive
  listWorkflows:     ['admin', 'operator', 'viewer'],
};

// Tools that require explicit user confirmation before execution
const DESTRUCTIVE_TOOLS = new Set(['deleteRecord', 'triggerSync']);

// ── RBAC helpers ──────────────────────────────────────────────────────────────

/**
 * Check if a role is permitted to call a tool.
 * @param {string} role   - user role (admin|operator|viewer)
 * @param {string} tool   - tool name from TOOL_PERMISSIONS
 * @returns {{ allowed: boolean, reason?: string }}
 */
function checkPermission(role, tool) {
  const allowed = TOOL_PERMISSIONS[tool];
  if (!allowed) {
    return { allowed: false, reason: `Tool '${tool}' is not on the allowlist` };
  }
  if (!allowed.includes(role)) {
    return {
      allowed: false,
      reason: `Role '${role}' is not permitted to call '${tool}'. Required: ${allowed.join(' | ')}`
    };
  }
  return { allowed: true };
}

/**
 * Returns true if the tool requires destructive-action confirmation.
 * @param {string} tool
 */
function isDestructive(tool) {
  return DESTRUCTIVE_TOOLS.has(tool);
}

/**
 * Derive an effective role from a User document.
 * The User model currently has no role field → default to 'operator'.
 * Extend by adding a 'role' field to the User schema.
 * @param {Object} user - Mongoose User document
 * @returns {string}
 */
function getRoleFromUser(user) {
  if (!user) return 'viewer';
  return user.role || 'operator';   // fallback: operator for authenticated users
}

/**
 * All allowlisted tool names (for agent self-inspection).
 */
function getAllowlistedTools() {
  return Object.keys(TOOL_PERMISSIONS);
}

module.exports = {
  TOOL_PERMISSIONS,
  DESTRUCTIVE_TOOLS,
  checkPermission,
  isDestructive,
  getRoleFromUser,
  getAllowlistedTools
};
