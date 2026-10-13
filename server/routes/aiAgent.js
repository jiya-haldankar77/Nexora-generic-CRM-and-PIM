const express = require('express');
const router = express.Router();
const {
  analyzeQuery,
  executeQuery,
  getSuggestions
} = require('../controllers/aiAgentController');
const { protect } = require('../middleware/auth');

/**
 * @desc Analyze user query and generate execution plan
 * @route POST /api/ai-agent/analyze
 */
router.post('/analyze', protect, analyzeQuery);

/**
 * @desc Execute the analyzed query plan
 * @route POST /api/ai-agent/execute
 */
router.post('/execute', protect, executeQuery);

/**
 * @desc Get suggested queries
 * @route GET /api/ai-agent/suggestions
 */
router.get('/suggestions', protect, getSuggestions);

module.exports = router;
