const userEventsDistancesService = require('../services/userEventsDistances');

const createUserDistances = async (req, res) => {
    try {
        const { userId, distances } = req.body;
        
        // Validate input
        if (!userId || !distances || !Array.isArray(distances)) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        // Create distances record
        const result = await userEventsDistancesService.createUserDistances(userId, distances);
        
        if (!result) {
            return res.status(404).json({ error: 'Failed to create distances' });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in createUserDistances controller:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateUserDistances = async (req, res) => {
    try {
        const { userId, distances } = req.body;
        
        const result = await userEventsDistancesService.updateUserDistances(userId, distances);
        if (!result) {
            return res.status(404).json({ error: 'User distances not found' });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in updateUserDistances controller:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getUserDistances = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const distances = await userEventsDistancesService.getUserDistances(userId);
        if (!distances) {
            return res.status(404).json({ error: 'No distances found for user' });
        }

        res.status(200).json(distances);
    } catch (error) {
        console.error('Error in getUserDistances controller:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getSpecificEventDistance = async (req, res) => {
    try {
        const { userId, eventId } = req.params;
        
        const distance = await userEventsDistancesService.getSpecificEventDistance(userId, eventId);
        if (!distance) {
            return res.status(404).json({ error: 'Distance not found' });
        }

        res.status(200).json(distance);
    } catch (error) {
        console.error('Error in getSpecificEventDistance controller:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateSpecificEventDistance = async (req, res) => {
    try {
        const { userId, eventId } = req.params;
        const { distance } = req.body;
        
        const result = await userEventsDistancesService.updateSpecificEventDistance(
            userId, 
            eventId, 
            distance
        );
        
        if (!result) {
            return res.status(404).json({ error: 'Failed to update distance' });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in updateSpecificEventDistance controller:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteUserDistances = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const result = await userEventsDistancesService.deleteUserDistances(userId);
        if (!result) {
            return res.status(404).json({ error: 'User distances not found' });
        }

        res.status(200).json({ message: 'User distances deleted successfully' });
    } catch (error) {
        console.error('Error in deleteUserDistances controller:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    createUserDistances,
    updateUserDistances,
    getUserDistances,
    getSpecificEventDistance,
    updateSpecificEventDistance,
    deleteUserDistances
};