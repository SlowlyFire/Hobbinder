const Event = require('./models/Event');

// Script that helps to clean up duplicates likes from DB
// Can be runned by 'node cleanup-script.js' from server directory
const cleanupDuplicateLikes = async () => {
    try {
        const events = await Event.find({});
        
        for (const event of events) {
            // Get unique likes (keep only the most recent like from each user)
            const uniqueLikes = event.liked.reduce((acc, current) => {
                const existingLike = acc.find(like => like.username === current.username);
                if (!existingLike) {
                    acc.push(current);
                } else if (new Date(current.likedAt) > new Date(existingLike.likedAt)) {
                    // Replace with more recent like if exists
                    acc[acc.indexOf(existingLike)] = current;
                }
                return acc;
            }, []);

            // Update event if we removed any duplicates
            if (uniqueLikes.length !== event.liked.length) {
                event.liked = uniqueLikes;
                await event.save();
                console.log(`Cleaned up duplicates for event ${event.id}`);
            }
        }
        
        console.log('Cleanup complete!');
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
};

cleanupDuplicateLikes();

