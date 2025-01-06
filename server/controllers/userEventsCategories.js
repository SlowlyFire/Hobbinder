const userEventsCategoriesService = require('../services/userEventsCategories');

const createUserCategories = async (req, res) => {
    try {
        const { userId, categoryMatches } = req.body;
        
        if (!userId || !categoryMatches || !Array.isArray(categoryMatches)) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        const result = await userEventsCategoriesService.createUserCategories(
            userId, 
            categoryMatches
        );
        
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in createUserCategories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getUserCategories = async (req, res) => {
    try {
        const { userId } = req.params;
        const categories = await userEventsCategoriesService.getUserCategories(userId);
        
        if (!categories) {
            return res.status(404).json({ error: 'No categories found' });
        }

        res.status(200).json(categories);
    } catch (error) {
        console.error('Error in getUserCategories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateUserCategories = async (req, res) => {
    try {
        const { userId, categoryMatches } = req.body;
        
        const result = await userEventsCategoriesService.updateUserCategories(
            userId, 
            categoryMatches
        );
        
        if (!result) {
            return res.status(404).json({ error: 'User categories not found' });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in updateUserCategories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    createUserCategories,
    getUserCategories,
    updateUserCategories
};