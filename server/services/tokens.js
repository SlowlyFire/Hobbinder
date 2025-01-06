const jwt = require("jsonwebtoken");
const users = require('../models/users.js');
const customEnv = require('custom-env').env(process.env.NODE_ENV, './config');
customEnv.env(process.env.NODE_ENV, './config');
const secretKey =  process.env.KEY;
const expiration = process.env.TOKEN_EXPIRATION;


const createToken = async (username, password) => {    
    const user = await users.findOne({ username: username, password: password });   
    if (!user) {
        return null;
    }
    const payload = { username: user.username }; 
    const token = jwt.sign(payload, secretKey, { expiresIn: expiration });
        
    return token;
}

const getUsernameFromToken = (token) => {
    try {
        console.log('Verifying token:', token);  // Debug log
        const decoded = jwt.verify(token, secretKey);
        console.log('Decoded token:', decoded);  // Debug log
        return decoded.username;
    } catch (error) {
        console.error('Token verification failed:', error);  // Debug log
        return null;
    }
};

module.exports = { createToken, getUsernameFromToken };