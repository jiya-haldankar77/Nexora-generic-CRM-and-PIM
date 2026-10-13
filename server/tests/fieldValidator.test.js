/**
 * Unit tests for fieldValidator.js (regression for the "can't add product" bug)
 */
'use strict';

const { validateRecordData } = require('../utils/fieldValidator');

// Mock resource definition matching the seeded 'product' resource
const productDef = {
  fields: [
    { key: 'name',        label: 'Product Name',   type: 'text',     required: true  },
    { key: 'sku',         label: 'SKU',             type: 'text',     required: true  },
    { key: 'price',       label: 'Price',           type: 'number',   required: true,  validation: { min: 0 } },
    { key: 'category',    label: 'Category',        type: 'select',   required: false, options: ['electronics', 'clothing', 'food', 'other'] },
    { key: 'stock',       label: 'Stock Quantity',  type: 'number',   required: false, validation: { min: 0 } },
    { key: 'description', label: 'Description',     type: 'textarea', required: false },
    { key: 'active',      label: 'Active',          type: 'boolean',  required: false }
  ]
};

const customerDef = {
  fields: [
    { key: 'name',    label: 'Full Name',   type: 'text',   required: true  },
    { key: 'email',   label: 'Email',       type: 'email',  required: true  },
    { key: 'phone',   label: 'Phone',       type: 'phone',  required: false },
    { key: 'company', label: 'Company',     type: 'text',   required: false },
    { key: 'status',  label: 'Status',      type: 'select', required: true, options: ['lead', 'active', 'inactive'] },
    { key: 'notes',   label: 'Notes',       type: 'textarea', required: false }
  ]
};

// ── Product record validation ─────────────────────────────────────────────────

describe('fieldValidator — product record', () => {
  test('valid minimal product passes', () => {
    const { isValid, errors } = validateRecordData(productDef, {
      name: 'Widget A', sku: 'WA-001', price: 19.99
    }, false);
    expect(isValid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  test('valid full product passes', () => {
    const { isValid, sanitizedData } = validateRecordData(productDef, {
      name: 'Widget B', sku: 'WB-001', price: '29.99', category: 'electronics',
      stock: '100', description: 'A fine widget', active: 'true'
    }, false);
    expect(isValid).toBe(true);
    expect(sanitizedData.price).toBe(29.99);
    expect(sanitizedData.stock).toBe(100);
    expect(sanitizedData.active).toBe(true);
  });

  test('missing required fields → invalid', () => {
    const { isValid, errors } = validateRecordData(productDef, {}, false);
    expect(isValid).toBe(false);
    const fieldKeys = errors.map((e) => e.field);
    expect(fieldKeys).toContain('name');
    expect(fieldKeys).toContain('sku');
    expect(fieldKeys).toContain('price');
  });

  test('invalid category option → invalid', () => {
    const { isValid, errors } = validateRecordData(productDef, {
      name: 'X', sku: 'X-001', price: 10, category: 'invalid-cat'
    }, false);
    expect(isValid).toBe(false);
    expect(errors[0].field).toBe('category');
  });

  test('negative price → invalid (min: 0)', () => {
    const { isValid, errors } = validateRecordData(productDef, {
      name: 'X', sku: 'X-001', price: -5
    }, false);
    expect(isValid).toBe(false);
    expect(errors[0].field).toBe('price');
  });

  test('partial update skips missing fields', () => {
    const { isValid, sanitizedData } = validateRecordData(productDef, { stock: 50 }, true);
    expect(isValid).toBe(true);
    expect(sanitizedData.stock).toBe(50);
    expect(sanitizedData.name).toBeUndefined();
  });
});

// ── Customer record validation ────────────────────────────────────────────────

describe('fieldValidator — customer record', () => {
  test('valid customer passes', () => {
    const { isValid } = validateRecordData(customerDef, {
      name: 'Jane Doe', email: 'jane@example.com', status: 'lead'
    }, false);
    expect(isValid).toBe(true);
  });

  test('invalid email → invalid', () => {
    const { isValid, errors } = validateRecordData(customerDef, {
      name: 'Jane', email: 'not-an-email', status: 'lead'
    }, false);
    expect(isValid).toBe(false);
    expect(errors[0].field).toBe('email');
  });

  test('invalid status option → invalid', () => {
    const { isValid, errors } = validateRecordData(customerDef, {
      name: 'Jane', email: 'jane@example.com', status: 'vip'
    }, false);
    expect(isValid).toBe(false);
    expect(errors[0].field).toBe('status');
  });
});
