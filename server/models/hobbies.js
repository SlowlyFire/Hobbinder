const mongoose = require('mongoose');

var hobbiesSchema = new mongoose.Schema({
    hobby_name: {
        type: String,
        required: true,
        unique: true,
    }, 
    pic: {
        type: String,
        required: true
    }, 
    icon: {
        type: String,
        required: true
    },
    icon_lib: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('hobbies', hobbiesSchema)