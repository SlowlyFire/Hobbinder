import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import RenderImage from './RenderImage';

const ChatRow = ({ username, imageUri, messagePreview, timestamp }) => {
  return (
    <View style={styles.row}>
      <RenderImage img={imageUri ? imageUri : require('../assets/default-avatar.png')}  imgStyle={styles.profileImage}/>
      <View style={styles.textContainer}>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.messagePreview} numberOfLines={1}>
          {messagePreview}
        </Text>
      </View>
      <Text style={styles.timestamp}>{timestamp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 1,
    marginHorizontal: 8,
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  messagePreview: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
});

export default ChatRow;
