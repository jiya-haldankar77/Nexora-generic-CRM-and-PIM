const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
  transitionRecord
} = require('../controllers/recordController');
const { protect } = require('../middleware/auth');

// Workflow transition route must precede parameterized /:id route or match cleanly
router.post('/:resourceType/:id/transition', protect, transitionRecord);

router.route('/:resourceType')
  .get(protect, getRecords)
  .post(protect, createRecord);

router.route('/:resourceType/:id')
  .get(protect, getRecordById)
  .put(protect, updateRecord)
  .delete(protect, deleteRecord);

module.exports = router;
