const chatsService = require('../services/chats.js');
const tokensController = require('./tokens.js');
const User = require('../services/users.js');

const getAllChats = async (req, res) => {
    const username = await tokensController.getUsernameFromToken(req, res);
    const chats = await chatsService.getAllChats(username);
    if (!chats) {
        return res.status(404).json({ error: 'chats not found' });
    }
    res.status(200).json(chats); 
}

const addNewChat = async (req, res) => {    
    const username = await tokensController.getUsernameFromToken(req, res);
    const chat = await chatsService.addNewChat(username, req.body.username, req.body.updatedEventIdLiked, req.body.msg);
    if (!chat) {
        let otherUser =  await User.getUserByUsername(req.body.username);
        if(!otherUser){
            return res.status(400).json({ error: 'the inputted user doesnt exists' });
        }
        return res.status(404).json({ error: 'chat not found' });
    }

    res.status(200).json(chat); 
}

const getFullChatById = async (req, res) => {
    const username = await tokensController.getUsernameFromToken(req, res);    
    const chat = await chatsService.getFullChatById(username, req.params.id);
    if (!chat) {
        return res.status(404).json({ error: 'chat not found' });
    }
    res.status(200).json(chat); 
}

const deleteFullChatById = async (req, res) => {
    const username = await tokensController.getUsernameFromToken(req, res);  
    const chat = await chatsService.deleteFullChatById(username, req.params.id);
    if (!chat) {
        return res.status(404).json({ error: 'chat not found' });
    }
    res.status(200).json(chat); 
}

const addNewMessageByChatId = async (req, res) => {
    const username = await tokensController.getUsernameFromToken(req, res);  
    const chat = await chatsService.addNewMessageByChatId(username, req.params.id, req.body.msg);
    if (!chat) {
        return res.status(404).json({ error: 'chat not found' });
    }

    res.status(200).json(chat); 
}

const getAllMessagesById = async (req, res) => {
    const username = await tokensController.getUsernameFromToken(req, res);
    const chat = await chatsService.getAllMessagesById(username, req.params.id);
    if (!chat) {
        return res.status(404).json({ error: 'chat not found' });
    }
    res.status(200).json(chat); 
}

const getChatIdByUsers = async (req, res) => {
    const username = await tokensController.getUsernameFromToken(req, res);
    const chat = await chatsService.getChatIdByUsers(username, req.params.otherUsername);

    if (chat === -1) {
        return res.status(200).json({ chatId: -1 });
    } else if (!chat) {
        return res.status(404).json({ error: 'chat not found' });
    }
    res.status(200).json(chat); 
}

const unmatchClick = async (req, res) => {
    const click = await chatsService.unmatchClick(req.body.username, req.body.updatedEventIdLiked);
    if (!click) {
        return res.status(404).json({ error: 'click not found' });
    }
    res.status(200).json(click); 
}


module.exports = { getAllChats, addNewChat, getFullChatById, deleteFullChatById, addNewMessageByChatId, getAllMessagesById, getChatIdByUsers, unmatchClick}