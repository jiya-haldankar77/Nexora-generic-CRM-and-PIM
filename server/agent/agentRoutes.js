/**
 * NEXORA Agent Routes
 * Mounted at /api/agent
 */

'use strict';

const express = require('express');
const router = express.Router();
const { runAgent, listAgentTools, agentHealth } = require('./agentController');
const { protect } = require('../middleware/auth');

// Health — no auth needed
router.get('/health', agentHealth);

// Tool allowlist (auth required — RBAC per user role)
router.get('/tools', protect, listAgentTools);

// Main run endpoint
router.post('/run', protect, runAgent);

module.exports = router;
