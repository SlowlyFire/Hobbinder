// routes/userEventsDistances.js
const express = require('express');
const router = express.Router();
const userEventsDistancesController = require('../controllers/userEventsDistances');

// Create routes for different operations
router.route('/')
    .post(userEventsDistancesController.createUserDistances)  // Create distances for a new user
    .put(userEventsDistancesController.updateUserDistances);  // Update distances for existing user

router.route('/:userId')
    .get(userEventsDistancesController.getUserDistances)    // Get distances for specific user
    .delete(userEventsDistancesController.deleteUserDistances); // Delete distances for user

router.route('/:userId/event/:eventId')
    .get(userEventsDistancesController.getSpecificEventDistance) // Get distance to specific event
    .put(userEventsDistancesController.updateSpecificEventDistance); // Update specific event distance

module.exports = router;