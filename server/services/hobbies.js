const Hobby = require('../models/hobbies.js');

const AddNewHobby = async (hobby_name, pic, icon, icon_lib) => {
  var flag = await isHobbyExist(hobby_name);
  if (!flag) {
    const newHobby = new Hobby({
        hobby_name: hobby_name,
        pic: pic,
        icon: icon,
        icon_lib: icon_lib
    });
    return await newHobby.save();
  } else {
    return null;
  } 
}

const updateHobbyData = async (hobby_name, updateData) => {
  const flag = await isHobbyExist(hobby_name);
  if (flag) {
    // Find the hobby by name and update its information
    const updatedHobby = await Hobby.findOneAndUpdate(
      { hobby_name: hobby_name },
      { $set: updateData },
      { new: true }
    );
    return updatedHobby;
  } else {
    return null;
  }
}

const deleteHobby = async (hobby_name) => {
  const flag = await isHobbyExist(hobby_name);
  if (flag) {
    // Delete the hobby
    const deletedHobby = await Hobby.findOneAndDelete({ hobby_name: hobby_name });
    return deletedHobby;
  } else {
    return null;
  }
}

const getHobbyByName = async (hobby_name) => {
  const flag = await isHobbyExist(hobby_name);
  if (flag) {
    return await Hobby.findOne({hobby_name: hobby_name});
  } else {
    return null;
  }
}

const isHobbyExist = async (hobby_name) => {
  const hobby = await Hobby.findOne({hobby_name: hobby_name});
  return hobby !== null;
}

const getAllHobbies = async () => {
  try {
    return hobbies = await Hobby.find({});
  } catch (err) {
    console.error("Error fetching hobbies:", err);
    return null;
  }
}


module.exports = { AddNewHobby, updateHobbyData, deleteHobby, getHobbyByName, getAllHobbies };