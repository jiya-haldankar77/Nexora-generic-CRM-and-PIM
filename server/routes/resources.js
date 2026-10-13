const express = require('express');
const router = express.Router();
const {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource
} = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getResources)
  .post(protect, createResource);

router.route('/:identifier')
  .get(protect, getResource)
  .put(protect, updateResource)
  .delete(protect, deleteResource);

module.exports = router;
