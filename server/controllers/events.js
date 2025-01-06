const eventsService = require('../services/events.js');
const tokensController = require('./tokens.js');
const userService = require('../services/users.js');
const userEventsDistancesService = require('../services/userEventsDistances.js');
const calculateDistance = require('../utils/distanceCalculator.js');
const dateParser = require('../DateParser/dateParser.js');

// Helper function to update distances for all users
const updateAllUsersDistances = async (newEvent) => {
    try {
        // First, get all users' distance records
        const allUserDistances = await userEventsDistancesService.getAllUserDistances();

        // For each user, calculate the distance to the new event
        for (const userDistance of allUserDistances) {
            // Get the user's location from their profile
            const user = await userService.getUserByUsername(userDistance.userId);
            
            if (user && user.location) {
                // Calculate distance between user and new event
                const distance = calculateDistance(
                    {
                        latitude: user.location.coordinates.latitude,
                        longitude: user.location.coordinates.longitude
                    },
                    {
                        latitude: newEvent.location.coordinates.latitude,
                        longitude: newEvent.location.coordinates.longitude
                    }
                );

                // Add this new distance to the user's distances array
                await userEventsDistancesService.updateSingleDistance(
                    userDistance.userId,
                    newEvent.id,
                    distance
                );
            }
        }
    } catch (error) {
        console.error('Error updating user distances:', error);
        // We might want to handle this error differently depending on your needs
        // Maybe add to a queue for retry?
    }
};

const createEvent = async (req, res) => {
    try {
        // Get username from token
        const username = await tokensController.getUsernameFromToken(req, res);

        // Fetch user data
        const user = await userService.getUserByUsername(username);
        console.log('User data retrieved:', {
            username: user?.username,
            firstName: user?.first_name,
            lastName: user?.last_name,
            hasProfilePic: !!user?.profile_pic,
            hasBirthday: !!user?.birthday,
            hobbiesCount: user?.hobbies?.length
        });
        
        if (!user) {
            console.error('User not found for username:', username);
            return res.status(404).json({ error: 'User not found' });
        }

        // Validate location data
        const { location } = req.body;
        console.log('Location data received:', JSON.stringify(location, null, 2));

        // Calculate age if user has birthdate
        const age = user.birthday ? dateParser.calculateAge(user.birthday) : null;


        // Detailed location validation
        if (!location) {
            console.error('No location data provided');
            return res.status(400).json({ error: 'Location data is required' });
        }

        if (!location.name) {
            console.error('Location name is missing');
            return res.status(400).json({ error: 'Location name is required' });
        }

        if (!location.coordinates) {
            console.error('Location coordinates are missing');
            return res.status(400).json({ error: 'Location coordinates are required' });
        }

        if (typeof location.coordinates.latitude !== 'number' || typeof location.coordinates.longitude !== 'number') {
            console.error('Invalid coordinates format:', location.coordinates);
            return res.status(400).json({ error: 'Invalid coordinates format' });
        }

        // Create uploader data object
        const uploaderData = {
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            profile_pic: user.profile_pic || null,
            age: age,
            hobbies: user.hobbies
        };
        console.log('Uploader data prepared:', JSON.stringify(uploaderData, null, 2));

        // Log the data being sent to the service
        console.log('Sending to event service:', {
            category: req.body.category,
            summary: req.body.summary,
            locationName: location.name,
            coordinates: location.coordinates,
            whenDate: req.body.when_date,
            hasImage: !!req.body.img
        });

        // Create event
        const event = await eventsService.createEvent(
            uploaderData, 
            req.body.category, 
            req.body.summary, 
            location,
            req.body.when_date, 
            req.body.img
        );

        if (!event) {
            console.error('Event creation failed - service returned null/undefined');
            return res.status(404).json({ error: 'Failed to create event' });
        }

        console.log('Event created successfully:', {
            eventId: event.id,
            category: event.category,
            location: event.location.name,
            whenDate: event.when_date
        });

        // After successfully creating the event, update all users' distances
        // Fire and forget - don't wait for the updates to complete
        updateAllUsersDistances(event).catch(error => {
            console.error('Error in background distance update:', error);
        });

        console.log('=== Event Creation Process Completed ===');
        res.status(200).json(event);
    } catch (error) {
        console.error('=== Error in Event Creation Process ===');
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        console.error('Request body at time of error:', JSON.stringify(req.body, null, 2));
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getAllEventsForUser = async (req, res) => {
    try {
        console.log('Headers:', req.headers); // Debug log
        console.log('Authorization header:', req.headers.authorization); // Debug log

        const username = await tokensController.getUsernameFromToken(req, res);
        console.log('Username from token:', username); // Debug log

        if (username && username.status) {
            console.log('Token validation failed:', username); // Debug log
            return username;
        }
        
        const events = await eventsService.getAllEventsForUser(username);
        console.log('Events found:', events); // Debug log

        if (!events) {
            console.log('No events found'); // Debug log
            return res.status(404).json({ error: 'No events found' });
        }
        
        res.status(200).json(events);
    } catch (error) {
        console.error('Detailed error in getAllEvents controller:', error); // Debug log
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

const getEventById = async (req, res) => {
    const event = await eventsService.getEventById(req.params.id);
    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }
    res.status(200).json(event);
};

const updateEvent = async (req, res) => {
    const updatedEvent = await eventsService.updateEvent(req.params.id, req.body);
    if (!updatedEvent) {
        return res.status(404).json({ error: 'Event not found or could not be updated' });
    }
    res.status(200).json(updatedEvent);
};

const deleteEvent = async (req, res) => {
    try {
        const deletedEvent = await eventsService.deleteEvent(req.params.id);
        if (!deletedEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }
    
        // After successfully deleting the event, remove its distances from all users
        // We do this asynchronously to not block the response
        // Now we call the service to handle distance cleanup
        userEventsDistancesService.cleanupEventDistances(req.params.id).catch(error => {
            console.error('Error cleaning up event distances:', error);
        });

        res.status(200).json({ message: 'Event deleted successfully' });

    } catch(error) {
        console.error('Error in deleteEvent:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getAllEvents = async (req, res) => {
    const events = await eventsService.getAllEvents();
    if (!events) {
        return res.status(404).json({ error: 'didnt get all the events' });
    }
    res.status(200).json(events); 
}

const getAllEventsForUserExceptHisEvents = async (req, res) => {
    try {
        // console.log('Headers:', req.headers); // Debug log
        // console.log('Authorization header:', req.headers.authorization); // Debug log

        const username = await tokensController.getUsernameFromToken(req, res);
        // console.log('Username from token:', username); // Debug log

        if (username && username.status) {
            console.log('Token validation failed:', username); // Debug log
            return username;
        }
        
        const events = await eventsService.getAllEventsForUserExceptHisEvents(username);
        // console.log('Events found:', events); // Debug log

        if (!events) {
            console.log('No events found'); // Debug log
            return res.status(404).json({ error: 'No events found' });
        }
        
        res.status(200).json(events);
    } catch (error) {
        console.error('Detailed error in getAllEvents controller:', error); // Debug log
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

const getAllEventsCreatedByUser = async (req, res) => {
    try {
        // console.log('Headers:', req.headers); // Debug log
        // console.log('Authorization header:', req.headers.authorization); // Debug log

        const username = await tokensController.getUsernameFromToken(req, res);
        // console.log('Username from token:', username); // Debug log

        if (username && username.status) {
            console.log('Token validation failed:', username); // Debug log
            return username;
        }
        
        const events = await eventsService.getAllEventsCreatedByUser(username);
        // console.log('Events found:', events); // Debug log

        if (!events) {
            console.log('No events found'); // Debug log
            return res.status(404).json({ error: 'No events found' });
        }
        
        res.status(200).json(events);
    } catch (error) {
        console.error('Detailed error in getAllEvents controller:', error); // Debug log
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

const addNewLikeToEventId = async (req, res) => {
    try {
        const username = await tokensController.getUsernameFromToken(req, res);
        if (!username) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const event = await eventsService.addNewLikeToEventId(username, req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error in addNewLikeToEventId:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// In controllers/events.js
const getAllLikesByEventId = async (req, res) => {
    try {
        const username = await tokensController.getUsernameFromToken(req, res);
        if (!username) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const event = await eventsService.getEventById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Get likes and ensure they have unique timestamps
        const likes = await eventsService.getAllLikesByEventId(username, req.params.id);
        if (!likes) {
            return res.status(404).json({ error: 'No likes found' });
        }
        console.log(likes);
        // Get user details with unique timestamps
        const likeDetails = await Promise.all(
            likes.map(async (like, index) => {
                try {
                    const user = await userService.getUserByUsername(like.username);
                    if (!user) {
                        return {
                            username: like.username,
                            first_name: 'Deleted User',
                            last_name: '',
                            profile_pic: null,
                            likedAt: like.likedAt,
                            // Add a small offset to ensure unique timestamps
                            uniqueTimestamp: new Date(new Date(like.likedAt).getTime() + index).toISOString()
                        };
                    }
                    return {
                        username: user.username,
                        first_name: user.first_name || 'Unknown',
                        last_name: user.last_name || '',
                        profile_pic: user.profile_pic || null,
                        likedAt: like.likedAt,
                        // Add a small offset to ensure unique timestamps
                        uniqueTimestamp: new Date(new Date(like.likedAt).getTime() + index).toISOString()
                    };
                } catch (error) {
                    console.error(`Error fetching details for user ${like.username}:`, error);
                    return {
                        username: like.username,
                        first_name: 'Unknown',
                        last_name: 'User',
                        profile_pic: null,
                        likedAt: like.likedAt,
                        uniqueTimestamp: new Date(new Date(like.likedAt).getTime() + index).toISOString()
                    };
                }
            })
        );

        console.log('Sending like details:', likeDetails);
        res.status(200).json(likeDetails);
    } catch (error) {
        console.error('Error in getAllLikesByEventId:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getAllLikesOfUser = async (req, res) => {
    try {
        const username = await tokensController.getUsernameFromToken(req, res);
        if (!username) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const event = await eventsService.getAllLikesOfUser(username);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.status(200).json(event);
    } catch (error) {
        console.error('Error in getAllLikesOfUser:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


module.exports = { 
    createEvent, 
    getAllEventsCreatedByUser, 
    getEventById, 
    updateEvent, 
    deleteEvent,
    getAllEvents,
    getAllEventsForUser,
    getAllEventsForUserExceptHisEvents, 
    addNewLikeToEventId, 
    getAllLikesByEventId,
    getAllLikesOfUser 
}