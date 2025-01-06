const mongoose = require('mongoose');

const userEventsDistancesSchema = new mongoose.Schema({
    userId: String,
    distances: [{
        eventId: String,
        distance: Number,
        calculatedAt: Date,
    }],
});

module.exports = mongoose.model('userEventsDistances', userEventsDistancesSchema);