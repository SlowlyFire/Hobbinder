import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import RenderImage from './RenderImage';

const UserRow = ({ username, imageUri, selected }) => {
  return (
    <View style={[styles.row, selected && styles.selectedRow]}>
      <View style={styles.imageWrapper}>
        <RenderImage img={imageUri} imgStyle={styles.profileImage}/>
      </View>
      <Text style={styles.username}>{username}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20, // Rounded edges
    backgroundColor: 'white', // Default background color
    marginVertical: 5, // Margin between rows
    elevation: 2, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  selectedRow: {
    borderColor: '#ffcccb', // Light red color for selected edge
    borderWidth: 2, // Width of the border when selected
  },
  imageWrapper: {
    marginRight: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default UserRow;
