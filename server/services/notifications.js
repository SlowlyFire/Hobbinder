const { Expo } = require('expo-server-sdk');
const expo = new Expo();
const expoTokens = require('../models/expoTokens');
const logo =  process.env.LOGO;

const sendNotification = async (tokens, message) => {
  const messages = tokens
    .filter(token => Expo.isExpoPushToken(token))
    .map(token => ({
      to: token,
      sound: 'default',
      title: message.title,
      body: message.body,
    }));

    console.log('Notification Payload:', messages);


  try {
    const response = await expo.sendPushNotificationsAsync(messages);
    console.log('Notifications sent:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

const sendNotificationToUsers = async (selectedUsers, message) => {
  try {
    const tokens = await expoTokens.find({ username: { $in: selectedUsers } }).select('token');

    if (!tokens || tokens.length === 0) {
      throw new Error('No valid tokens found for selected users');
    }

    const tokenList = tokens.map(item => item.token);
    return await sendNotification(tokenList, message);
  } catch (error) {
    console.error('Error in sendNotificationToUsers:', error);
    throw error;
  }
};

const sendNotificationToAll = async (message) => {
  try {
    const tokens = await expoTokens.find().select('token');
    if (!tokens || tokens.length === 0) {
      throw new Error('No tokens available to send notifications.');
    }

    const tokenList = tokens.map(item => item.token);
    return await sendNotification(tokenList, message);
  } catch (error) {
    console.error('Error in sendNotificationToAll:', error);
    throw error;
  }
};

module.exports = { sendNotification, sendNotificationToUsers, sendNotificationToAll };
