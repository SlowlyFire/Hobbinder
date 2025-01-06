const mongoose = require('mongoose');

var chatsSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
    }, 
    users: [{
        username: {
            type: String,
            required: true
        },
        profile_pic: {
            type: String,
            required: false
        },
    }],
    messages: [{    
        id: {
            type: Number,
            required: true
        },
        created: {
            type: String,
            required: true,
            default: () => new Date().toISOString()
        },
        sender: {
            username: {
                type: String,
                required: true
            }
        },
        content: {
            type: String,
            required: true
        }
    }]
})

module.exports = mongoose.model('chats', chatsSchema)