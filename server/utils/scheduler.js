const cron = require('node-cron');
const { cleanupExpiredEventDistances } = require('../services/userEventsDistances');

// Run cleanup every hour
cron.schedule('0 * * * *', async () => {
    try {
        console.log('Starting scheduled cleanup of expired event distances');
        await cleanupExpiredEventDistances();
        console.log('Completed scheduled cleanup');
    } catch (error) {
        console.error('Error in scheduled cleanup:', error);
    }
});