const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { saveCaption, getHistory, deleteCaption } = require('../controllers/historyController');

router.route('/')
  .get(protect, getHistory)
  .post(protect, saveCaption);

router.route('/:id')
  .delete(protect, deleteCaption);

module.exports = router;
