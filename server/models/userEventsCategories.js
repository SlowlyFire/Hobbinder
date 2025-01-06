const mongoose = require('mongoose');

const userEventsCategoriesSchema = new mongoose.Schema({
    userId: String,
    categoryMatches: [{
        eventId: String,
        isMatch: Boolean,
        calculatedAt: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = mongoose.model('userEventsCategories', userEventsCategoriesSchema);
