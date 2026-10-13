/**
 * E2E Integration tests — full HTTP tests against the running app.
 *
 * Uses supertest + Jest. Connects to the test MongoDB (same URI, NODE_ENV=test).
 * Tests: auth, records CRUD, workflow, agent endpoints.
 */
'use strict';

const request = require('supertest');
const mongoose = require('mongoose');

// Set test env before requiring app
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexora_test';

const app = require('../server');

let token;        // operator token (default role)
let adminToken;   // admin token
let testProductId;
let testCustomerId;
let testIntegrationId;
const testEmail = `e2e_${Date.now()}@nexora.test`;
const adminEmail = `admin_${Date.now()}@nexora.test`;

// ── Setup / Teardown ─────────────────────────────────────────────────────────

beforeAll(async () => {
  // Wait for DB connection
  await new Promise((resolve) => {
    if (mongoose.connection.readyState === 1) return resolve();
    mongoose.connection.once('connected', resolve);
  });
}, 20000);

afterAll(async () => {
  // Cleanup test records
  const ResourceRecord = require('../models/ResourceRecord');
  const User = require('../models/User');
  await ResourceRecord.deleteMany({ resourceType: { $in: ['product', 'customer'] }, 'data.sku': /^E2E-/ });
  await User.deleteMany({ email: { $in: [testEmail, adminEmail] } });
  await mongoose.connection.close();
}, 10000);

// ── Auth ─────────────────────────────────────────────────────────────────────

describe('Auth endpoints', () => {
  test('POST /api/auth/signup — creates operator account', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'E2E Tester', email: testEmail, password: 'Test1234!' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
    token = res.body.data.token;
  });

  test('POST /api/auth/signup — creates admin account', async () => {
    const User = require('../models/User');
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'E2E Admin', email: adminEmail, password: 'Admin1234!' });
    expect(res.status).toBe(201);
    // Upgrade to admin role directly
    await User.findOneAndUpdate({ email: adminEmail }, { role: 'admin' });
    // Re-login to get fresh token (role is in DB, not JWT — getRoleFromUser reads from DB)
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: adminEmail, password: 'Admin1234!' });
    adminToken = loginRes.body.data.token;
  });

  test('POST /api/auth/login — returns token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'Test1234!' });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeTruthy();
    token = res.body.data.token;
  });

  test('GET /api/auth/me — returns user info', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testEmail);
  });
});

// ── Resources ────────────────────────────────────────────────────────────────

describe('Resource definition endpoints', () => {
  test('GET /api/resources — lists seeded resources', async () => {
    const res = await request(app)
      .get('/api/resources')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const names = res.body.data.map((r) => r.name);
    expect(names).toContain('product');
    expect(names).toContain('customer');
  });

  test('GET /api/resources/product — returns product schema', async () => {
    const res = await request(app)
      .get('/api/resources/product')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('product');
    expect(res.body.data.fields.length).toBeGreaterThan(0);
  });
});

// ── Product Records (the integration bug) ────────────────────────────────────

describe('Record CRUD — product (integration bug fix)', () => {
  test('POST /api/records/product — creates product record', async () => {
    const res = await request(app)
      .post('/api/records/product')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'E2E Widget', sku: 'E2E-WGT-001', price: 49.99,
        category: 'electronics', stock: 10
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBeTruthy();
    expect(res.body.data.data.sku).toBe('E2E-WGT-001');
    testProductId = res.body.data._id;
  });

  test('GET /api/records/product — lists product records', async () => {
    const res = await request(app)
      .get('/api/records/product')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.total).toBeGreaterThan(0);
  });

  test('GET /api/records/product/:id — returns single product', async () => {
    const res = await request(app)
      .get(`/api/records/product/${testProductId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.data.sku).toBe('E2E-WGT-001');
  });

  test('PUT /api/records/product/:id — updates product', async () => {
    const res = await request(app)
      .put(`/api/records/product/${testProductId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ stock: 25 });
    expect(res.status).toBe(200);
    expect(res.body.data.data.stock).toBe(25);
  });

  test('POST /api/records/product — rejects invalid category', async () => {
    const res = await request(app)
      .post('/api/records/product')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bad Product', sku: 'E2E-BAD-001', price: 10, category: 'invalid_cat' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.details[0].field).toBe('category');
  });
});

// ── Customer Records ─────────────────────────────────────────────────────────

describe('Record CRUD — customer', () => {
  test('POST /api/records/customer — creates customer', async () => {
    const res = await request(app)
      .post('/api/records/customer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'E2E Customer', email: 'e2ecust@test.com',
        phone: '+1-555-000-0001', company: 'E2E Corp', status: 'lead'
      });
    expect(res.status).toBe(201);
    testCustomerId = res.body.data._id;
  });

  test('POST /api/records/customer/:id/transition — transitions to active', async () => {
    const res = await request(app)
      .post(`/api/records/customer/${testCustomerId}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ to: 'active', comment: 'E2E test transition' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.data.status).toBe('active');
  });
});

// ── Workflows ────────────────────────────────────────────────────────────────

describe('Workflow endpoints (bug fix verification)', () => {
  test('GET /api/workflows — now returns 200 (was 404 before fix)', async () => {
    const res = await request(app)
      .get('/api/workflows')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/workflows/customer — returns customer workflow config', async () => {
    const res = await request(app)
      .get('/api/workflows/customer')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.enabled).toBe(true);
  });
});

// ── Integrations ─────────────────────────────────────────────────────────────

describe('Integration endpoints (route conflict fix)', () => {
  test('GET /api/integrations — lists integrations', async () => {
    const res = await request(app)
      .get('/api/integrations')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    testIntegrationId = res.body.data[0]?._id;
  });

  test('GET /api/integrations/id/:id — get by MongoDB ID', async () => {
    if (!testIntegrationId) return;
    const res = await request(app)
      .get(`/api/integrations/id/${testIntegrationId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/integrations/:id/test — routes to ID handler (not type handler)', async () => {
    if (!testIntegrationId) return;
    const res = await request(app)
      .post(`/api/integrations/${testIntegrationId}/test`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Should NOT say "Simulation test succeeded for <ObjectId>"
    expect(res.body.result?.mock).toBeTruthy();
  });

  test('GET /api/integrations/woocommerce — get by type name', async () => {
    const res = await request(app)
      .get('/api/integrations/woocommerce')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.type).toBe('woocommerce');
  });
});

// ── Agent endpoints ──────────────────────────────────────────────────────────

describe('Agent endpoints', () => {
  test('GET /api/agent/health — returns agent health (no auth)', async () => {
    const res = await request(app).get('/api/agent/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.agent).toBe('NexoraAgent');
  });

  test('GET /api/agent/tools — lists allowed tools for user role', async () => {
    const res = await request(app)
      .get('/api/agent/tools')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tools)).toBe(true);
    const toolNames = res.body.tools.map((t) => t.name);
    expect(toolNames).toContain('listRecords');
  });

  test('POST /api/agent/run — list resources goal', async () => {
    const res = await request(app)
      .post('/api/agent/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ goal: 'list resources' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.intent).toBe('listResources');
    expect(Array.isArray(res.body.result)).toBe(true);
    expect(res.body.method).toMatch(/rule-based|llm/);
  });

  test('POST /api/agent/run — list product records', async () => {
    const res = await request(app)
      .post('/api/agent/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ goal: 'list product records' });
    expect(res.status).toBe(200);
    expect(res.body.intent).toBe('listRecords');
    expect(Array.isArray(res.body.result)).toBe(true);
  });

  test('POST /api/agent/run — create product record via agent', async () => {
    const res = await request(app)
      .post('/api/agent/run')
      .set('Authorization', `Bearer ${token}`)
      .send({
        goal: 'create a product',
        data: { name: 'Agent Widget', sku: 'E2E-AGT-001', price: 99.99, category: 'electronics' }
      });
    expect(res.status).toBe(200);
    expect(res.body.intent).toBe('createRecord');
    expect(res.body.result?.data?.sku).toBe('E2E-AGT-001');
    expect(res.body.verification.passed).toBe(true);
  });

  test('POST /api/agent/run — deleteRecord without confirmation → 202 + requiresConfirmation (admin)', async () => {
    const res = await request(app)
      .post('/api/agent/run')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ goal: `delete product ${testProductId}` });
    expect(res.status).toBe(202);
    expect(res.body.requiresConfirmation).toBe(true);
    expect(res.body.destructiveActions).toContain('deleteRecord');
  });

  test('POST /api/agent/run — deleteRecord with confirmed=true → executes (admin)', async () => {
    const res = await request(app)
      .post('/api/agent/run')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ goal: `delete product ${testProductId}`, confirmed: true });
    expect(res.status).toBe(200);
    expect(res.body.result?.deleted).toBe(true);
  });

  test('POST /api/agent/run — no auth → 401', async () => {
    const res = await request(app)
      .post('/api/agent/run')
      .send({ goal: 'list resources' });
    expect(res.status).toBe(401);
  });

  test('POST /api/agent/run — empty goal → 400', async () => {
    const res = await request(app)
      .post('/api/agent/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ goal: '   ' });
    expect(res.status).toBe(400);
  });

  test('POST /api/agent/run — viewer role is denied for createRecord (403)', async () => {
    const viewerEmail = `viewer_${Date.now()}@nexora.test`;
    await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Viewer', email: viewerEmail, password: 'Viewer1234!' });

    const User = require('../models/User');
    await User.findOneAndUpdate({ email: viewerEmail }, { role: 'viewer' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: viewerEmail, password: 'Viewer1234!' });
    const viewerToken = loginRes.body.data.token;

    const res = await request(app)
      .post('/api/agent/run')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ goal: 'create a product', data: { name: 'X', sku: 'XV-001', price: 1 } });

    // Viewer cannot createRecord → RBAC denies with 403
    expect(res.status).toBe(403);
    expect(res.body.denied).toBe(true);

    await User.deleteOne({ email: viewerEmail });
  });
});

// ── Overview ─────────────────────────────────────────────────────────────────

describe('Overview endpoint', () => {
  test('GET /api/overview — returns stats', async () => {
    const res = await request(app)
      .get('/api/overview')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.totalResources).toBeGreaterThan(0);
  });
});
