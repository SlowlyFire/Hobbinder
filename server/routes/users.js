const usersController = require('../controllers/users.js');

const express = require('express');
const router = express.Router();

router.route('/')
    .get(usersController.getAllUsers)
    .post(usersController.createUser);

router.route('/:username')
    .get(usersController.getUserByUsername)
    .put(usersController.updateUser)
    .patch(usersController.updateUser)
    .delete(usersController.deleteUser);

router.route('/:username/interactions')
    .post(usersController.handleEventInteraction);

module.exports = router;