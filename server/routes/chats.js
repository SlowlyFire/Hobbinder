const chatsController = require('../controllers/chats.js');

const express = require('express');
const router = express.Router();

router.route('/')
    .get(chatsController.getAllChats)
    .post(chatsController.addNewChat);

router.route('/specific/:otherUsername')
    .get(chatsController.getChatIdByUsers)

router.route('/:id')
    .get(chatsController.getFullChatById)
    .delete(chatsController.deleteFullChatById);

router.route('/:id/messages')
    .post(chatsController.addNewMessageByChatId)
    .get(chatsController.getAllMessagesById);

router.route('/unmatch/click')
    .put(chatsController.unmatchClick)
    
module.exports = router;