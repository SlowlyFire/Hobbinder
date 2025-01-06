const expoTokens = require('../services/expoTokens')

const addNewToken = async (req, res) => {
    try {
        const { username, token } = req.body;

        // Add or update the token
        await expoTokens.addNewToken(username, token.data);

        res.status(200).json({ message: 'Token added or updated successfully' });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ error: 'Duplicate token or username detected' });
        } else {
            res.status(500).json({ error: 'Failed to save token' });
        }
    }
};

const getTokens = async (req, res) => {
    try {
        const tokens = await expoTokens.getTokens();
        res.status(200).json(tokens);
    } catch (error) {
        console.error('Error getting tokens:', error);
        res.status(500).json({ error: 'Failed to get tokens' });
    }
};

const getTokenByUsername = async (req, res) => {
    try {
        const token = await expoTokens.getTokenByUsername(req.params.username);
        if (!token) {
            return res.status(404).json({ error: 'Token not found' });
        }
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error getting token:', error);
        res.status(500).json({ error: 'Failed to get token' });
    }
};

const removeToken = async (req, res) => {
    try {
        await expoTokens.removeToken(req.params.username);
        res.status(200).json({ message: 'Token removed successfully' });
    } catch (error) {
        console.error('Error removing token:', error);
        res.status(500).json({ error: 'Failed to remove token' });
    }
};

module.exports = { 
    addNewToken, 
    getTokens, 
    getTokenByUsername, 
    removeToken 
};
