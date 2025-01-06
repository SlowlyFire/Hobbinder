const userEventsCategoriesController = require('../controllers/userEventsCategories.js');
const express = require('express');
const router = express.Router();

router.route('/')
    .post(userEventsCategoriesController.createUserCategories)
    .put(userEventsCategoriesController.updateUserCategories);

router.route('/:userId')
    .get(userEventsCategoriesController.getUserCategories);

module.exports = router;
