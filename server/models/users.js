const mongoose = require('mongoose');

var usersSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    }, 
    password: {
        type: String,
        required: true
    }, 
    profile_pic: {
        type: String,
        required: false
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
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
    birthday: {
        type: String,
        required: true
    },
    hobbies: [{
        type: String,
        required: true 
    }],
    summary: {
        type: String,
        required: false
    },
    photos: [{
        type: String,
        required: false
    }],
    permission: {
        type: String,
        required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
  },
  eventInteractions: {
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    },
    likeRatio: {
        type: Number,
        default: 0,
        get: v => Number(v.toFixed(2)),
        set: v => Number(v.toFixed(2)),
    },
    lastRatioUpdate: {
        type: Date,
        default: Date.now
    }
},
interactedEvents: [{
    eventId: String,
    interactionType: {
        type: String,
        enum: ['LIKE', 'DISLIKE']
    },
    interactedAt: {
        type: Date,
        default: Date.now
    }
}],
})

module.exports = mongoose.model('users', usersSchema)