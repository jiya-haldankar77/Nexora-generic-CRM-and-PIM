const express = require('express');
const router = express.Router();

const resourcesRouter = require('./resources');
const recordsRouter = require('./records');
const workflowsRouter = require('./workflows');
const integrationsRouter = require('./integrations');
const syncLogsRouter = require('./syncLogs');
const overviewRouter = require('./overview');
const authRouter = require('./auth');
const aiAgentRouter = require('./aiAgent');

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

router.use('/auth', authRouter);
router.use('/resources', resourcesRouter);
router.use('/records', recordsRouter);
router.use('/workflows', workflowsRouter);
router.use('/integrations', integrationsRouter);
router.use('/sync-logs', syncLogsRouter);
router.use('/overview', overviewRouter);
router.use('/ai-agent', aiAgentRouter);

module.exports = router;
