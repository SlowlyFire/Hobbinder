const express = require('express');
const router = express.Router();
const matchesController = require('../controllers/matches');

// This route will get matches for a specific user
router.get('/:username', matchesController.getUserMatches);

module.exports = router;