const mongoose = require('mongoose');

var eventsSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
    }, 
    uploader: {
        username: {
            type: String,
            required: true
        }
    },
    type: {
        type: String,
        required: true
    }, 
    category: {
        type: String,
        required: true
    }, 
    summary: {
        type: String,
        required: true
    },
    upload_date: {
        type: String,
        required: true,
        default: () => new Date().toISOString()
    },
    when_date: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    liked: [
        {
            username: { 
                type: String, 
                required: true 
            }
        }
    ]
})

module.exports = mongoose.model('events', eventsSchema)