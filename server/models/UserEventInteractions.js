const mongoose = require('mongoose');

const userEventInteractionsSchema = new mongoose.Schema({
    userId: String,
    swipedEvents: [{
        eventId: String,
        direction: {
            type: String,
            enum: ['LEFT', 'RIGHT']
        },
        swipedAt: {
            type: Date,
            default: Date.now
        }
    }],
    cachedMatches: [{
        eventId: String,
        score: Number,
        calculatedAt: Date
    }],
    lastMatchCalculation: Date
});

module.exports = mongoose.model('UserEventInteractions', userEventInteractionsSchema);