const eventsController = require('../controllers/events.js');
const express = require('express');
const router = express.Router();

router.route('/')
    .get(eventsController.getAllEvents)
    .post(eventsController.createEvent);

router.route('/for/:user')
    .get(eventsController.getAllEventsForUserExceptHisEvents);

router.route('/createdBy/:user')
    .get(eventsController.getAllEventsCreatedByUser);

router.route('/for/users')
    .get(eventsController.getAllEventsForUser);

router.route('/:id')
    .get(eventsController.getEventById)
    .put(eventsController.updateEvent)
    .delete(eventsController.deleteEvent);

router.route('/:id/liked')
    .post(eventsController.addNewLikeToEventId)
    .get(eventsController.getAllLikesByEventId);

router.route('/user/clicks')
    .get(eventsController.getAllLikesOfUser);

module.exports = router;
