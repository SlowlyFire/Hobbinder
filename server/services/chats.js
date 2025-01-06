const Chats = require('../models/chats.js');
const Users = require('./users.js');
const DateParser = require('../DateParser/dateParser.js');
const UserServices = require('../services/users.js');
const EventServices = require('../services/events.js');

const getAllChats = async (myUsername) => {
    const allChatsWithMessages = await Chats.find({
        $or: [
          { "users.0.username": myUsername },
          { "users.1.username": myUsername }
        ]
    });
    if (allChatsWithMessages.length !== 0) {
        const allChats = allChatsWithMessages.map((chat) => {
            var lastMessage;
            var lastMessageJson;
            if (chat.messages.length !== 0) {
                lastMessage = chat.messages[chat.messages.length - 1];
                lastMessageJson = {
                    id: lastMessage.id,
                    created: lastMessage.created,
                    content: lastMessage.content
                }
            } else {
                lastMessageJson = null;
            }
            
            var chatWithUser;
            if (chat.users[0].username === myUsername) {
                chatWithUser = chat.users[1]
            } else {
                chatWithUser = chat.users[0]
            }

            const chatWithLastMessage = {
                id: chat.id,
                user: chatWithUser,
                lastMessage: lastMessageJson
            }
    
            return chatWithLastMessage;
        });         
   
        return allChats;   
    } else {
        return [];
    }
}

const getLastChat = async () => {
    const allChatsWithMessages = await Chats.find({});
    if (allChatsWithMessages.length !== 0) {
        const lastChat = allChatsWithMessages[allChatsWithMessages.length - 1];
        return lastChat;  
    } else {
        return null;
    }
}

const addNewChat = async (myUsername, username, updatedEventIdLiked, newMessageContent) => {
    const myUser = await Users.getUserByUsername(myUsername);
    const otherUser = await Users.getUserByUsername(username);
    if (otherUser) { 
        var newChatId;
        const lastChat = await getLastChat();   
        if (lastChat) {
            newChatId = lastChat.id + 1;
        } else {
            newChatId = 1;
        }

        const newMessage = {
            id: 1,
            created: DateParser.getCurrentDateTime(),
            sender: myUser,
            content: newMessageContent
        }       

        const newChat = new Chats({
            id: newChatId,
            users: [myUser, otherUser],
            messages: [newMessage]
        });

        await EventServices.updateChecked(updatedEventIdLiked, username)
        
        return await newChat.save();         
    } else {
        return null;
    } 
}

const getFullChatById = async (myUsername, id) => {
    const fullChat = await Chats.find({
        id: id,
        $or: [
          { "users.0.username": myUsername },
          { "users.1.username": myUsername }
        ]
    });
    if (fullChat) {
        return fullChat[0];
    } else {
        return null;
    }
}

const deleteFullChatById = async (myUsername, id) => {
    const deletedChat = await Chats.findOneAndDelete({ 
        id: id,
        $or: [
            { "users.0.username": myUsername },
            { "users.1.username": myUsername }
        ]
    });
    if (deletedChat) {
        return deletedChat;
    } else {
        return null;
    }
}

const addNewMessageByChatId = async (myUsername, id, newMessageContent) => {
    const fullChat = await Chats.find({ id: id }); 
    if (fullChat) {
        fullChat.map(async (chat) => {
            const senderUser = await UserServices.getUserByUsername(myUsername);
            var newMessageId;
            if (chat.messages.length !== 0) {
                newMessageId = chat.messages[chat.messages.length - 1].id + 1;
            } else {
                newMessageId = 1;
            }    
            const newMessage = {
                id: newMessageId,
                created: DateParser.getCurrentDateTime(),
                sender: senderUser,
                content: newMessageContent
            }        

            chat.messages.push(newMessage);
            return await chat.save();  
        }); 
        return fullChat;     
    } else {
        return null;
    }
}

const getAllMessagesById = async (myUsername, id) => {
    const fullChat = await Chats.findOne({
        id: id,
        $or: [
          { "users.0.username": myUsername },
          { "users.1.username": myUsername }
        ]
    });
    if (fullChat) {
        const messageList = fullChat.messages.map((message) => {
            var messageJson = {
                id: message.id,
                created: message.created,
                sender: {
                    username: message.sender.username,
                },
                content: message.content
            }
            return messageJson;
        });
        
        return messageList.reverse();
    } else {
        return null;
    }
}

const getChatIdByUsers = async (myUsername, otherUsername) => {
    try {
        const fullChat = await Chats.find({
            $or: [
                { "users.0.username": myUsername, "users.1.username": otherUsername },
                { "users.0.username": otherUsername, "users.1.username": myUsername }
            ]
        });

        // Check if chat was found and return it, else return null
        return fullChat.length > 0 ? fullChat[0] : -1;
    } catch (error) {
        console.error('Error fetching chat:', error);
        return null;
    }
};

const unmatchClick = async (username, updatedEventIdLiked) => {
    return await EventServices.updateChecked(updatedEventIdLiked, username)
};




module.exports = { addNewChat, getAllChats, getFullChatById, deleteFullChatById, addNewMessageByChatId, getAllMessagesById, getChatIdByUsers, unmatchClick };