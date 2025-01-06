const notificationsController = require('../controllers/notifications');

const express = require('express');
const router = express.Router();

router.post('/send', notificationsController.sendNotificationToUser);
router.post('/send/all', notificationsController.sendNotificationToAllUsers);

module.exports = router;
