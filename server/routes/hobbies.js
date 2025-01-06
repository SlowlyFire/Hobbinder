const hobbiesController = require('../controllers/hobbies.js');

const express = require('express');
const router = express.Router();

router.route('/')
    .get(hobbiesController.getAllHobbies)
    .post(hobbiesController.AddNewHobby);

router.route('/:hobby_name')
    .get(hobbiesController.getHobbyByName)
    .put(hobbiesController.updateHobbyData)
    .delete(hobbiesController.deleteHobby);

module.exports = router;