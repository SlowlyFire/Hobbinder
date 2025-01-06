const User = require('../models/users.js');

const createUser = async (username, password, profile_pic, first_name, last_name, location, birthday, hobbies, summary, permission) => {
  var flag = await isUserExist(username);
  if (!flag) {
    const newUser = new User({
      username: username, 
      password: password, 
      profile_pic: profile_pic, 
      first_name: first_name,
      last_name: last_name,
      location: location,
      birthday: birthday,
      hobbies: hobbies,
      summary: summary,
      permission: permission
    });
    return await newUser.save();
  } else {
    return null;
  } 
}

const updateUser = async (username, updateData) => {
  const flag = await isUserExist(username);
  if (flag) {
    // Find the user by username and update their information
    const updatedUser = await User.findOneAndUpdate(
      { username: username },
      { $set: updateData },
      { new: true }
    );
    return updatedUser;
  } else {
    return res.status(404).json({ message: 'User not found' });
  }
}

const deleteUser = async (username) => {
  const flag = await isUserExist(username);
  if (flag) {
    // Delete the user
    const deletedUser = await User.findOneAndDelete({ username: username });
    return deletedUser;
  } else {
    return null;
  }
}

const getUserByUsername = async (username) => {
  const flag = await isUserExist(username);
  if (flag) {
    return await User.findOne({username: username});
  } else {
    return null;
  }
}

const isUserExist = async (username) => {
  const user = await User.findOne({username: username});
  return user !== null;
}

const getAllUsers = async () => {
  try {
    const users = await User.find({});
    const usersDataToReturn = users.map((user) => {
      return {
        username: user.username, 
        first_name: user.first_name,
        last_name: user.last_name,
        profile_pic: user.profile_pic, 
        location: user.location,
        birthday: user.birthday,
        hobbies: user.hobbies,
        summary: user.summary
      };
    });
    
    return usersDataToReturn;
  } catch (err) {
    console.error("Error fetching users:", err);
    return null;
  }
}

const updateEventInteractions = async (username, eventId, isLike) => {
  try {
      const user = await User.findOne({ username });
      if (!user) return null;

      // Get current timestamp
      const now = new Date();
      
      // Check if it's time to recalculate ratio (e.g., every 10 interactions or once per day)
      const shouldUpdateRatio = 
          ((user.eventInteractions.likes + user.eventInteractions.dislikes + 1) % 10 === 0) || 
          ((now - user.eventInteractions.lastRatioUpdate) > (24 * 60 * 60 * 1000));

      const updateField = isLike ? 'eventInteractions.likes' : 'eventInteractions.dislikes';

      let updateOperation;
      if (shouldUpdateRatio) {
          // Calculate new totals
          const newLikes = user.eventInteractions.likes + (isLike ? 1 : 0);
          const newDislikes = user.eventInteractions.dislikes + (isLike ? 0 : 1);
          const total = newLikes + newDislikes;
          const newRatio = total > 0 ? Number((newLikes / total).toFixed(2)) : 0;

          updateOperation = {
            $inc: { [updateField]: 1 },
            $set: {
                'eventInteractions.likeRatio': newRatio,
                'eventInteractions.lastRatioUpdate': now
            },
            $push: {
                interactedEvents: {
                    eventId,
                    interactionType: isLike ? 'LIKE' : 'DISLIKE',
                    interactedAt: now
                }
            }
        };
    } else {
        updateOperation = {
            $inc: { [updateField]: 1 },
            $push: {
                interactedEvents: {
                    eventId,
                    interactionType: isLike ? 'LIKE' : 'DISLIKE',
                    interactedAt: now
                }
            }
        };
    }

    return await User.findOneAndUpdate(
        { username },
        updateOperation,
        { new: true }
    );
  } catch (error) {
      console.error('Error updating event interactions:', error);
      return null;
  }
};


module.exports = { createUser, getUserByUsername, updateUser, deleteUser, getAllUsers, updateEventInteractions };