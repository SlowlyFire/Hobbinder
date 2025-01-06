const mongoose = require('mongoose');
const AutoIncrementID = require('@typegoose/auto-increment').AutoIncrementID;

const eventsSchema = new mongoose.Schema({
    id: {
        type: Number
    },
    uploader: {
        username: {
            type: String,
            required: true
        },
        first_name: {
            type: String,
            required: true
        },
        last_name: {
            type: String,
            required: true
        },
        profile_pic: {
            type: String,
            required: false
        },
        age: {
            type: String,
            required: true
        },
        hobbies: [{
            type: String,
            required: true 
        }],
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
        type: Date, 
        required: true,
        default: () => new Date()
    },
    location: {
        name: {
            type: String,
            required: true
        },
        coordinates: {
            latitude: {
                type: Number,
                required: true
            },
            longitude: {
                type: Number,
                required: true
            }
        },
        placeId: {
            type: String,
            required: true
        },
        fullAddress: {
            type: String,
            required: true
        }
    },
    when_date: {
        type: Date,  
        required: true
    },
    img: {
        type: String,
        required: true
    },
    liked: [{
        username: { 
            type: String, 
            required: true 
        },
        likedAt: {
            type: Date,  
            required: true,
            default: () => new Date()
        },
        checked: {
            type: Boolean,
            required: true,
            default: false
        }
    }]
});

// Initialize the auto-increment
eventsSchema.plugin(AutoIncrementID, {
    field: 'id',
    startAt: 1,
});

module.exports = mongoose.model('events', eventsSchema);