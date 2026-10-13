const express = require('express');
const router = express.Router();
const {
  getSyncLogs,
  getSyncLogById,
  clearSyncLogs
} = require('../controllers/syncLogController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getSyncLogs)
  .delete(protect, clearSyncLogs);

router.route('/:id')
  .get(protect, getSyncLogById);

module.exports = router;
