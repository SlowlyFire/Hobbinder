const hobbiesService = require('../services/hobbies.js');

const getHobbyByName = async (req, res) => {
    const hobby = await hobbiesService.getHobbyByName(req.params.hobby_name);
    if (!hobby) {
        return res.status(404).json({ error: 'Hobby not found' });
    }
    res.status(200).json(hobby); 
}

const AddNewHobby = async (req, res) => {
    const hobby = await hobbiesService.AddNewHobby(req.body.hobby_name, req.body.pic, req.body.icon, req.body.icon_lib);
    if (!hobby) {
        return res.status(404).json({ error: 'didnt create hobby' });
    }
    res.status(200).json(hobby); 
}

const updateHobbyData = async (req, res) => {
    const updateData = {
        pic: req.body.pic,
        icon: req.body.icon,
        icon_lib: req.body.icon_lib
      };
    const hobby = await hobbiesService.updateHobbyData(req.params.hobby_name, updateData);
    if (!hobby) {
        return res.status(404).json({ error: 'didnt updated hobby' });
    }
    res.status(200).json(hobby); 
}

const deleteHobby = async (req, res) => {
    const hobby = await hobbiesService.deleteHobby(req.params.hobby_name);
    if (!hobby) {
        return res.status(404).json({ error: 'didnt deleted hobby' });
    }
    res.status(200).json(hobby); 
}

const getAllHobbies = async (req, res) => {
    const hobby = await hobbiesService.getAllHobbies();
    if (!hobby) {
        return res.status(404).json({ error: 'didnt get all the hobby' });
    }
    res.status(200).json(hobby); 
}

module.exports = { getHobbyByName, AddNewHobby, updateHobbyData, deleteHobby, getAllHobbies }