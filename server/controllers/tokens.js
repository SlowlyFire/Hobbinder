const tokensService = require('../services/tokens.js');
const firebase = require('../services/expoTokens.js');

const createToken = async (req, res) => {
    const token = await tokensService.createToken(req.body.username, req.body.password);
    if (!token) {
        return res.status(404).json({ error: `didnt created a token` });
    }
    firebase.removeToken(req.body.username);
    res.status(200).json(token);
}

const getUsernameFromToken = async (req, res) => {
    if (req.headers.authorization) {   
        // Get everything after 'Bearer '
        const token = req.headers.authorization.split("Bearer ")[1];
        try {
            let returnVal = tokensService.getUsernameFromToken(token);
            return returnVal;
        } 
        catch (err) {
            console.error('Token verification error:', err);
            return res.status(401).send("Invalid Token");
        }
    }
    else
        return res.status(403).send('Token required');
};

const validateToken = async (req, res) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split("Bearer ")[1];
        try {
            const username = tokensService.getUsernameFromToken(token);
            if (!username) {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }
            return res.status(200).json({ username });
        } catch (error) {
            console.error('Token validation error:', error);
            return res.status(401).json({ error: 'Invalid token' });
        }
    } else {
        return res.status(403).json({ error: 'Token is required' });
    }
};

module.exports = { createToken, getUsernameFromToken, validateToken }
