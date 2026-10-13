const express = require('express');
const router = express.Router();
const { getOverviewStats } = require('../controllers/overviewController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getOverviewStats);

module.exports = router;
