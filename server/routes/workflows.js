const express = require('express');
const router = express.Router();
const {
  listWorkflows,
  getWorkflow,
  saveWorkflow,
  getRecordHistory
} = require('../controllers/workflowController');
const { transitionRecord } = require('../controllers/recordController');
const { protect } = require('../middleware/auth');

// List all workflow definitions (root route must come BEFORE /:resourceType)
router.get('/', protect, listWorkflows);

router.route('/:resourceType')
  .get(protect, getWorkflow)
  .put(protect, saveWorkflow);

router.get('/:resourceType/:id/history', protect, getRecordHistory);
router.post('/:resourceType/:id/transition', protect, transitionRecord);

module.exports = router;
