const UserEventsDistances = require('../models/userEventsDistances');
const Event = require('../models/Event');

const cleanupExpiredEventDistances = async () => {
    try {
        // First, get all events that have started
        const expiredEvents = await Event.find({
            when_date: { $lte: new Date().toISOString() }
        });

        if (expiredEvents.length === 0) {
            console.log('No expired events found to clean up');
            return;
        }

        // Get array of expired event IDs
        const expiredEventIds = expiredEvents.map(event => event.id);

        // Remove these event distances from all users in one operation
        const result = await UserEventsDistances.updateMany(
            {}, // Match all users
            {
                $pull: {
                    distances: {
                        eventId: { $in: expiredEventIds }
                    }
                }
            }
        );

        console.log(`Cleanup summary for expired events:
            Events cleaned up: ${expiredEventIds.length}
            Total users checked: ${result.matchedCount}
            Users modified: ${result.modifiedCount}
        `);

        return result;
    } catch (error) {
        console.error('Failed to cleanup expired event distances:', error);
        throw error;
    }
};

// When we delete an event, we also delete it from the userEventsDistances DB
const cleanupEventDistances = async (eventId) => {
    try {
        // Update all users' distance arrays by removing the specified eventId
        const result = await UserEventsDistances.updateMany(
            {}, // Match all documents
            { 
                $pull: { 
                    distances: { 
                        eventId: eventId 
                    } 
                } 
            }
        );

        console.log(`Cleaned up distances for event ${eventId} from ${result.modifiedCount} users`);
    } catch (error) {
        console.error(`Failed to cleanup distances for event ${eventId}:`, error);
        // Here you might want to implement retry logic or alert administrators
        throw error;
    }
};

const createUserDistances = async (userId, distances) => {
    try {
        // Create new user distances record
        const userDistances = new UserEventsDistances({
            userId,
            distances: distances.map(d => ({
                ...d,
                calculatedAt: new Date()
            }))
        });

        return await userDistances.save();
    } catch (error) {
        console.error('Error in createUserDistances service:', error);
        throw error;
    }
};

const updateUserDistances = async (userId, newDistances) => {
    try {
        return await UserEventsDistances.findOneAndUpdate(
            { userId },
            { 
                $set: { 
                    distances: newDistances.map(d => ({
                        ...d,
                        calculatedAt: new Date()
                    }))
                }
            },
            { new: true }
        );
    } catch (error) {
        console.error('Error in updateUserDistances service:', error);
        throw error;
    }
};

const getUserDistances = async (userId) => {
    try {
        return await UserEventsDistances.findOne({ userId });
    } catch (error) {
        console.error('Error in getUserDistances service:', error);
        throw error;
    }
};

const getSpecificEventDistance = async (userId, eventId) => {
    try {
        const userDistances = await UserEventsDistances.findOne({ userId });
        if (!userDistances) return null;

        const eventDistance = userDistances.distances.find(d => d.eventId === eventId);
        return eventDistance || null;
    } catch (error) {
        console.error('Error in getSpecificEventDistance service:', error);
        throw error;
    }
};

const updateSpecificEventDistance = async (userId, eventId, newDistance) => {
    try {
        return await UserEventsDistances.findOneAndUpdate(
            { 
                userId, 
                'distances.eventId': eventId 
            },
            { 
                $set: { 
                    'distances.$.distance': newDistance,
                    'distances.$.calculatedAt': new Date()
                }
            },
            { new: true }
        );
    } catch (error) {
        console.error('Error in updateSpecificEventDistance service:', error);
        throw error;
    }
};

const getAllUserDistances = async () => {
    try {
        return await UserEventsDistances.find({});
    } catch (error) {
        console.error('Error getting all user distances:', error);
        throw error;
    }
};

const updateSingleDistance = async (userId, eventId, distance) => {
    try {
        const result = await UserEventsDistances.findOneAndUpdate(
            { userId },
            { 
                $push: { 
                    distances: {
                        eventId,
                        distance,
                        calculatedAt: new Date()
                    }
                }
            },
            { new: true }
        );
        return result;
    } catch (error) {
        console.error('Error updating single distance:', error);
        throw error;
    }
};

const deleteUserDistances = async (userId) => {
    try {
        return await UserEventsDistances.findOneAndDelete({ userId });
    } catch (error) {
        console.error('Error in deleteUserDistances service:', error);
        throw error;
    }
};

module.exports = {
    cleanupExpiredEventDistances,
    cleanupEventDistances,
    createUserDistances,
    updateUserDistances,
    getUserDistances,
    getSpecificEventDistance,
    updateSpecificEventDistance,
    getAllUserDistances,
    updateSingleDistance,
    deleteUserDistances
};