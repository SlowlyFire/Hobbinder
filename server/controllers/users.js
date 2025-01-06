const usersService = require('../services/users.js');

const getUserByUsername = async (req, res) => {
    const user = await usersService.getUserByUsername(req.params.username);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user); 
}

const createUser = async (req, res) => {
    try {
        const user = await usersService.createUser(
            req.body.username,
            req.body.password,
            req.body.profile_pic,
            req.body.first_name,
            req.body.last_name,
            req.body.location,
            req.body.birthday,
            req.body.hobbies,
            req.body.summary,
            req.body.permission,
        );  
        if (!user) {
            return res.status(400).json({ error: 'Failed to create user' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('User creation error:', error);
        res.status(500).json({ 
            error: 'Server error during user creation',
            details: error.message 
        });
    }
}

const updateUser = async (req, res) => {
    const updateData = {
        password: req.body.password,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        profile_pic: req.body.profile_pic,
        photos: req.body.photos,
        location: req.body.location,
        birthday: req.body.birthday,
        hobbies: req.body.hobbies,
        summary: req.body.summary
      };
    const user = await usersService.updateUser(req.params.username, updateData);
    if (!user) {
        return res.status(404).json({ error: 'didnt updated user' });
    }
    res.status(200).json(user); 
}

const deleteUser = async (req, res) => {
    const user = await usersService.deleteUser(req.params.username);
    if (!user) {
        return res.status(404).json({ error: 'didnt deleted user' });
    }
    res.status(200).json(user); 
}

const getAllUsers = async (req, res) => {
    const users = await usersService.getAllUsers();
    if (!users) {
        return res.status(404).json({ error: 'didnt get all the users' });
    }
    res.status(200).json(users); 
}

const handleEventInteraction = async (req, res) => {
    try {
        const { eventId, isLike } = req.body;
        const username = req.params.username;

        const updatedUser = await usersService.updateEventInteractions(username, eventId, isLike);
        if (!updatedUser) {
            return res.status(404).json({ error: 'Failed to update user interactions' });
        }

        res.status(200).json({
            likeRatio: updatedUser.eventInteractions.likeRatio
        });
    } catch (error) {
        console.error('Error handling event interaction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports = { getUserByUsername, createUser, updateUser, deleteUser, getAllUsers, handleEventInteraction }