const mongoose = require('mongoose');

var expoTokensSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    }, 
    token: {
        type: String,
        required: true,
        unique: true,
    }, 
})

module.exports = mongoose.model('expo_tokens', expoTokensSchema)
