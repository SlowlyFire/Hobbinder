// controllers/matches.js
const matchingService = require('../services/matchingService');
const eventService = require('../services/events');
const userService = require('../services/users');

const getUserMatches = async (req, res) => {
    try {
        console.log('\n=== Starting Match Calculation Process ===');
        const { username } = req.params;
        console.log('Finding matches for user:', username);

        const user = await userService.getUserByUsername(username);
        if (!user) {
            console.error('❌ User not found:', username);
            return res.status(404).json({ error: 'User not found' });
        }
        console.log('✓ User found');

        // Create a Set of previously interacted event IDs for efficient lookup
        const interactedEventIds = new Set(
            user.interactedEvents?.map(interaction => Number(interaction.eventId)) || []
        );
        console.log(`User has previously interacted with ${interactedEventIds.size} events`);

        // Get current time for comparison
        const currentTime = new Date();
        console.log(`Current time: ${currentTime.toLocaleString()}`);

        // Get all potential events excluding user's own events
        const allEvents = await eventService.getAllEventsForUserExceptHisEvents(username);
        console.log(`\nFound ${allEvents.length} total available events`);

        // Apply both interaction and time-based filtering
        const unseenEvents = allEvents.filter(event => {
            // First, check if user has interacted with this event
            if (interactedEventIds.has(event.id)) {
                console.log(`Filtering out event ${event.id} - previously interacted`);
                return false;
            }

            // Then, check if event hasn't started yet
            const eventStartTime = new Date(event.when_date);
            const hasStarted = eventStartTime <= currentTime;
            
            if (hasStarted) {
                console.log(`Filtering out event ${event.id} - already started at ${eventStartTime.toLocaleString()}`);
                return false;
            }

            return true;
        });

        console.log('\nFiltering Summary:');
        console.log(`- Total events: ${allEvents.length}`);
        console.log(`- Previously interacted: ${interactedEventIds.size}`);
        console.log(`- Future events only: ${unseenEvents.length}`);

        // Return early if no unseen events
        if (unseenEvents.length === 0) {
            console.log('No new events available for matching');
            return res.status(200).json([]);
        }

        // Process remaining events for matches
        console.log('\nProcessing matches for unseen events...');
        const matches = await Promise.all(unseenEvents.map(async (event, index) => {
            try {
                console.log(`\n--- Processing Event ${index + 1}/${unseenEvents.length} ---`);
                console.log(`Event: ${event.category} in ${event.location.name}`);
                console.log(`Event ID: ${event.id}`);
                console.log(`Event start time: ${new Date(event.when_date).toLocaleString()}`);

                const eventCreator = await userService.getUserByUsername(event.uploader.username);
                if (!eventCreator) {
                    console.warn(`❌ Creator not found for event ${event.id}`);
                    return null;
                }

                const score = await matchingService.predictMatch(user, event, eventCreator);
                console.log(`✓ Match score: ${(score * 100).toFixed(1)}%`);
                
                return {
                    event,
                    score,
                    features: matchingService.calculateFeatures(user, event, eventCreator)
                };
            } catch (error) {
                console.error(`❌ Error processing event ${event.id}:`, error.message);
                return null;
            }
        }));

        // Filter and sort matches
        const validMatches = matches
            .filter(match => match !== null)
            .sort((a, b) => b.score - a.score);

        console.log('\n=== Match Processing Complete ===');
        console.log('Summary:');
        console.log(`- Total events found: ${allEvents.length}`);
        console.log(`- Previously interacted events: ${interactedEventIds.size}`);
        console.log(`- Events processed: ${unseenEvents.length}`);
        console.log(`- Valid matches found: ${validMatches.length}`);
        
        if (validMatches.length > 0) {
            console.log('\nTop 5 matches:');
            validMatches.slice(0, 5).forEach((match, index) => {
                const startTime = new Date(match.event.when_date).toLocaleString();
                console.log(`${index + 1}. ${match.event.category} (ID: ${match.event.id}) - ${(match.score * 100).toFixed(1)}% - Starts: ${startTime}`);
            });
        }

        res.status(200).json(validMatches);

    } catch (error) {
        console.error('\n❌ Error in match calculation process:', error.message);
        res.status(500).json({ error: 'Failed to get matches' });
    }
};

module.exports = {
    getUserMatches
};