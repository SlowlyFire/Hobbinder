const UserEventsCategories = require('../models/userEventsCategories.js');

const createUserCategories = async (userId, categoryMatches) => {
    try {
        const userCategories = new UserEventsCategories({
            userId,
            categoryMatches: categoryMatches.map(match => ({
                ...match,
                calculatedAt: new Date()
            }))
        });

        return await userCategories.save();
    } catch (error) {
        console.error('Error in createUserCategories service:', error);
        throw error;
    }
};

const getUserCategories = async (userId) => {
    try {
        return await UserEventsCategories.findOne({ userId });
    } catch (error) {
        console.error('Error in getUserCategories service:', error);
        throw error;
    }
};

const updateUserCategories = async (userId, newCategoryMatches) => {
    try {
        return await UserEventsCategories.findOneAndUpdate(
            { userId },
            { 
                $set: { 
                    categoryMatches: newCategoryMatches.map(match => ({
                        ...match,
                        calculatedAt: new Date()
                    }))
                }
            },
            { new: true }
        );
    } catch (error) {
        console.error('Error in updateUserCategories service:', error);
        throw error;
    }
};

module.exports = {
    createUserCategories,
    getUserCategories,
    updateUserCategories
};