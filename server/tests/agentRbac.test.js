/**
 * Unit tests for agentRbac.js
 */
'use strict';

const {
  checkPermission,
  isDestructive,
  getRoleFromUser,
  getAllowlistedTools,
  TOOL_PERMISSIONS
} = require('../agent/agentRbac');

describe('agentRbac — checkPermission', () => {
  test('admin can use all tools', () => {
    for (const tool of Object.keys(TOOL_PERMISSIONS)) {
      const result = checkPermission('admin', tool);
      expect(result.allowed).toBe(true);
    }
  });

  test('operator cannot deleteRecord', () => {
    const result = checkPermission('operator', 'deleteRecord');
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/admin/);
  });

  test('operator cannot triggerSync', () => {
    expect(checkPermission('operator', 'triggerSync').allowed).toBe(false);
  });

  test('viewer can only read', () => {
    const readOk = ['listRecords', 'getRecord', 'listResources', 'getResource', 'listIntegrations', 'listWorkflows'];
    const readFail = ['createRecord', 'updateRecord', 'deleteRecord', 'transitionRecord', 'triggerSync'];
    readOk.forEach((t) => expect(checkPermission('viewer', t).allowed).toBe(true));
    readFail.forEach((t) => expect(checkPermission('viewer', t).allowed).toBe(false));
  });

  test('unknown tool is denied', () => {
    const result = checkPermission('admin', 'arbitraryDBQuery');
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/allowlist/);
  });
});

describe('agentRbac — isDestructive', () => {
  test('deleteRecord is destructive', () => expect(isDestructive('deleteRecord')).toBe(true));
  test('triggerSync is destructive', () => expect(isDestructive('triggerSync')).toBe(true));
  test('listRecords is not destructive', () => expect(isDestructive('listRecords')).toBe(false));
  test('createRecord is not destructive', () => expect(isDestructive('createRecord')).toBe(false));
});

describe('agentRbac — getRoleFromUser', () => {
  test('null user → viewer', () => expect(getRoleFromUser(null)).toBe('viewer'));
  test('user without role → operator', () => expect(getRoleFromUser({ name: 'Test' })).toBe('operator'));
  test('user with role admin → admin', () => expect(getRoleFromUser({ role: 'admin' })).toBe('admin'));
});

describe('agentRbac — getAllowlistedTools', () => {
  test('returns list with known tools', () => {
    const tools = getAllowlistedTools();
    expect(tools).toContain('listRecords');
    expect(tools).toContain('createRecord');
    expect(tools).toContain('deleteRecord');
    expect(tools).toContain('listWorkflows');
  });
});
