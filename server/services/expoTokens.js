const ExpoToken = require('../models/expoTokens.js');

const addNewToken = async (username, token) => {
    try {
        // Check if the token already exists in the database
        const tokenExists = await ExpoToken.findOne({ token });

        if (tokenExists) {
            // Update the username for the existing token
            await ExpoToken.updateOne({ token }, { username });
            console.log(`Overridden username for existing token: ${token}`);
            return; // Exit since the token was updated
        }

        // Check if the username exists
        const existingUser = await ExpoToken.findOne({ username });
        if (existingUser) {
            // Update the existing token for the user
            await ExpoToken.updateOne({ username }, { token });
            console.log("Updated token for user:", username);
        } else {
            // Add a new document for the user
            await ExpoToken.create({ username, token });
            console.log("Added new token for user:", username);
        }
    } catch (error) {
        console.error("Error adding new token:", error);
        throw error; // Re-throw the error for handling elsewhere
    }
};


const removeToken = async (username) => {
    try {
        await ExpoToken.deleteOne({ username });
    } catch (error) {
        console.error("Error removing token:", error);
    }
};

const getTokens = async () => {
    try {
        return await ExpoToken.find();
    } catch (error) {
        console.error("Error getting tokens:", error);
        return [];
    }
};

const getTokenByUsername = async (username) => {
    try {
        const userToken = await ExpoToken.findOne({ username });
        return userToken ? userToken.token : null;
    } catch (error) {
        console.error("Error getting token by username:", error);
        return null;
    }
};

module.exports = { addNewToken, removeToken, getTokens, getTokenByUsername }