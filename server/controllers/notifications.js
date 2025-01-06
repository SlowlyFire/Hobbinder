const notificationsService = require('../services/notifications');

const sendNotificationToUser = async (req, res) => {
  try {
    const { selectedUsers, title, body } = req.body;

    if (!Array.isArray(selectedUsers) || selectedUsers.length === 0) {
      return res.status(400).json({ error: 'selectedUsers must be a non-empty array' });
    }

    const response = await notificationsService.sendNotificationToUsers(selectedUsers, { title, body });
    res.status(200).json({ message: 'Notification sent successfully', response });
  } catch (error) {
    console.error('Error in sendNotificationToUser:', error);
    res.status(500).json({ error: error.message || 'Failed to send notification' });
  }
};

const sendNotificationToAllUsers = async (req, res) => {
  try {
    const { title, body } = req.body;

    const response = await notificationsService.sendNotificationToAll({ title, body });
    res.status(200).json({ message: 'Notification sent to all users', response });
  } catch (error) {
    console.error('Error in sendNotificationToAllUsers:', error);
    res.status(500).json({ message: 'Failed to send notification', error: error.message });
  }
};

module.exports = { sendNotificationToUser, sendNotificationToAllUsers };
