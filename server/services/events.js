const { get } = require('mongoose');
const Event = require('../models/Event.js');
const Users = require('../models/users.js');
const dateParser = require('../DateParser/dateParser.js');

const createEvent = async (uploaderData, category, summary, location, when_date, img) => {
    try {
        // Validate that we have all required location fields
        if (!location?.name || !location?.coordinates?.latitude || !location?.coordinates?.longitude) {
            throw new Error('Invalid location data');
        }

        // Create the event with the structured location data
        const newEvent = new Event({
            uploader: uploaderData,
            category,
            summary,
            upload_date: Date.now(),  // Using ISO string format for consistency
            location: {
                name: location.name,
                coordinates: {
                    latitude: location.coordinates.latitude,
                    longitude: location.coordinates.longitude
                },
                placeId: location.placeId,
                fullAddress: location.fullAddress
            },
            when_date: new Date(when_date),
            img,
            liked: []
        });

        // Add some debug logging
        console.log('Attempting to save event with location:', JSON.stringify(location, null, 2));
        
        const savedEvent = await newEvent.save();
        
        if (!savedEvent) {
            throw new Error('Failed to save event');
        }

        return savedEvent;
    } catch (error) {
        console.error('Error in createEvent service:', error);
        throw error; // Re-throw to be handled by the controller
    }
}

// You won't need getLastEvent anymore since auto-increment handles IDs
// But if you need it for other purposes:
const getLastEvent = async () => {
    const lastEvent = await Event.findOne().sort({ id: -1 });
    return lastEvent || null;
}

const getEventById = async (id) => {
    return await Event.findOne({ id: id });
}

// const updateEvent = async (id, updateData) => {
//     return await Event.findOneAndUpdate(
//         { id: id },
//         { $set: updateData },
//         { new: true }
//     );
// }

const updateEvent = async (id, updateData) => {
    try {
        // If location is being updated, validate its structure
        if (updateData.location) {
            // Validate the new location data
            if (!updateData.location.name || 
                !updateData.location.coordinates?.latitude || 
                !updateData.location.coordinates?.longitude) {
                throw new Error('Invalid location data in update');
            }
            
            // Ensure the location object matches our schema
            updateData.location = {
                name: updateData.location.name,
                coordinates: {
                    latitude: updateData.location.coordinates.latitude,
                    longitude: updateData.location.coordinates.longitude
                },
                placeId: updateData.location.placeId,
                fullAddress: updateData.location.fullAddress
            };
        }

        const updatedEvent = await Event.findOneAndUpdate(
            { id: id },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        console.log('Updated event:', {
            id: updatedEvent?.id,
            location: updatedEvent?.location,
            updateSuccessful: !!updatedEvent
        });

        return updatedEvent;
    } catch (error) {
        console.error('Error in updateEvent:', error);
        throw error;
    }
};

const deleteEvent = async (id) => {
    return await Event.findOneAndDelete({ id: id });
}

const getAllEventsForUserExceptHisEvents = async (currentUsername) => {
    try {
        console.log('Getting events for user:', currentUsername, ' that were not created by him');  // Debug log

        if (!currentUsername) {
            console.log('No username provided');  // Debug log
            return null;
        }

        // Find all events EXCEPT those created by the current user
        const events = await Event.find({
            "uploader.username": { $ne: currentUsername }
        }).sort({ upload_date: -1 });

        // console.log('Found events that were not created by user:', events);  // Debug log

        if (!events || events.length === 0) {
            console.log('No events found');  // Debug log
            return [];  // Return empty array instead of null
        }

        // Transform the data
        const transformedEvents = events.map(event => ({
            id: event.id,
            uploader: {
                username: event.uploader.username,
                first_name: event.uploader.first_name,
                last_name: event.uploader.last_name,
                profile_pic: event.uploader.profile_pic,
                age: event.uploader.age,
                hobbies: event.uploader.hobbies,
            },
            category: event.category,
            summary: event.summary,
            location: {
                name: event.location.name,
                coordinates: {
                    latitude: event.location.coordinates.latitude,
                    longitude: event.location.coordinates.longitude
                },
                placeId: event.location.placeId,
                fullAddress: event.location.fullAddress
            },
            when_date: event.when_date,
            img: event.img,
            liked: event.liked
        }));

        // console.log('Transformed events:', transformedEvents);  // Debug log
        return transformedEvents;
    } catch (error) {
        console.error('Error in getAllEvents service:', error);
        return null;
    }
};

const getAllEventsCreatedByUser = async (currentUsername) => {
    try {
        // console.log('Getting events that were created by user:', currentUsername);  // Debug log

        if (!currentUsername) {
            console.log('No username provided');  // Debug log
            return null;
        }

        // Find all events that were created by the current user only
        const events = await Event.find({
            "uploader.username": currentUsername
        }).sort({ upload_date: -1 });

        // console.log('Found events that were created by user:', events);  // Debug log

        if (!events || events.length === 0) {
            console.log('No events found');  // Debug log
            return [];  // Return empty array instead of null
        }

        // Transform the data
        const transformedEvents = events.map(event => ({
            id: event.id,
            uploader: {
                username: event.uploader.username,
                first_name: event.uploader.first_name,
                last_name: event.uploader.last_name,
                profile_pic: event.uploader.profile_pic,
                age: event.uploader.age,
                hobbies: event.uploader.hobbies,
            },
            category: event.category,
            summary: event.summary,
            location: {
                name: event.location.name,
                coordinates: {
                    latitude: event.location.coordinates.latitude,
                    longitude: event.location.coordinates.longitude
                },
                placeId: event.location.placeId,
                fullAddress: event.location.fullAddress
            },
            when_date: event.when_date,
            img: event.img,
            liked: event.liked
        }));

        // console.log('Transformed events:', transformedEvents);  // Debug log
        return transformedEvents;
    } catch (error) {
        console.error('Error in getAllEvents service:', error);
        return null;
    }
};

const addNewLikeToEventId = async (likeFromUser, id) => {
    try {
        const event = await Event.findOne({ id: id });
        if (!event){
            return null;
        } 

        // Check if user already liked this event
        const alreadyLiked = event.liked.some(like => like.username === likeFromUser);
        if (alreadyLiked) {
            // User already liked this event
           return event;
        }
   

        // Add new like
        event.liked.push({ 
            username: likeFromUser,
            likedAt: new Date().toISOString(),
            checked: false
        });
        
        return await event.save();
    } catch (error) {
        console.error('Error adding like:', error);
        return null;
    }
}

const getAllLikesByEventId = async (requestingUsername, eventId) => {
    try {
        console.log('Service: Getting likes for event:', {
            eventId,
            requestingUsername
        });
        
        const event = await Event.findOne({ id: parseInt(eventId) });
        console.log('Service: Found event:', event ? 'Yes' : 'No', 'ID:', eventId);
        
        if (!event) {
            return null;
        }

        // Remove duplicate likes (keep only the most recent like from each user)
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

        return uniqueLikes;
    } catch (error) {
        console.error('Error getting likes:', error);
        return null;
    }
};

const getAllEvents = async () => {
    try {
        return await Event.find({});
    } catch (err) {
        console.error("Error fetching events:", err);
        return null;
    }
}

const getAllEventsForUser = async (currentUsername) => {
    try {
        console.log('Getting events for user:', currentUsername);  // Debug log

        if (!currentUsername) {
            console.log('No username provided');  // Debug log
            return null;
        }

        // Find all events EXCEPT those created by the current user
        const events = await Event.find({
            "uploader.username": { $ne: currentUsername }
        }).sort({ upload_date: -1 });

        // console.log('Found events:', events);  // Debug log

        if (!events || events.length === 0) {
            console.log('No events found');  // Debug log
            return [];  // Return empty array instead of null
        }

        // Transform the data
        const transformedEvents = events.map(event => ({
            id: event.id,
            summary: event.summary,
            category: event.category,
            user: {
                name: event.uploader.username,
                image: '/default-user-image.jpg'
            },
            image: event.img,
            location: {
                name: event.location.name,
                coordinates: {
                    latitude: event.location.coordinates.latitude,
                    longitude: event.location.coordinates.longitude
                },
                placeId: event.location.placeId,
                fullAddress: event.location.fullAddress
            },
            when_date: event.when_date
        }));

        // console.log('Transformed events:', transformedEvents);  // Debug log
        return transformedEvents;
    } catch (error) {
        console.error('Error in getAllEvents service:', error);
        return null;
    }
};

const updateChecked = async (eventId, username) => {
    try {
        const result = await Event.updateOne(
            { id: eventId, "liked.username": username }, // Match the event and the specific user in the liked array
            { $set: { "liked.$.checked": true } } // Update the checked field for the matched user
        );

        if (result.modifiedCount > 0) {
            console.log(`Successfully updated checked for username: ${username} in event: ${eventId}`);
            return true;
        } else {
            console.log(`No update performed. Either the event or username was not found.`);
            return false;
        }
    } catch (error) {
        console.error(`Error updating checked: ${error}`);
        return false;
    }
};

const getAllLikesOfUser = async (username) => {
    try {
        console.log(`Fetching likes for events uploaded by user: ${username}`);

        // Fetch events uploaded by the specified user
        const events = await Event.find({ "uploader.username": username, when_date: { $gte: new Date() } });
        console.log('--------------------------------')
        console.log("Current Date:", new Date());
        console.log("Event Filtered:", new Date("2024-12-09T12:47:00.000Z") >= new Date());

        if (!events || events.length === 0) {
            console.log(`No events found for user: ${username}`);
            return [];
        }

        // Extract all liked usernames across events
        const likedUsernames = [...new Set(events.flatMap(event => event.liked.map(like => like.username)))];

        // Fetch detailed user data for all liked usernames in a single query
        const users = await Users.find({ username: { $in: likedUsernames } });

        // Create a user lookup map for quick access
        const userLookup = Object.fromEntries(
            users.map(user => [
                user.username,
                {
                    username: user.username,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    profile_pic: user.profile_pic,
                    age: dateParser.calculateAge(user.birthday)
                }
            ])
        );

        // Transform data to include like details with user information
        const likesData = events.map(event => {
            if (event.liked.length === 0) {
                return null;
            }

            // Map likes to include user information
            const likesWithUserData = event.liked.map(like => ({
                likedAt: like.likedAt,
                checked: like.checked,
                user: userLookup[like.username] || null
            }));

            return {
                id: event.id,
                category: event.category,
                summary: event.summary,
                location: event.location,
                when_date: event.when_date,
                img: event.img,
                uploader: event.uploader,
                liked: likesWithUserData
            };
        });

        // Filter out null values to exclude events with no likes
        const filteredLikesData = likesData.filter(event => event !== null);

        console.log(`Found likes for user: ${username}`, filteredLikesData);
        return filteredLikesData;
    } catch (error) {
        console.error(`Error fetching likes for user ${username}:`, error);
        return null;
    }
};




module.exports = {
    createEvent,
    getEventById,
    updateEvent,
    deleteEvent,
    getAllEvents,
    getAllEventsForUserExceptHisEvents,
    addNewLikeToEventId,
    getAllLikesByEventId,
    getLastEvent,
    getAllEventsCreatedByUser,
    getAllEventsForUser,
    updateChecked,
    getAllLikesOfUser
};