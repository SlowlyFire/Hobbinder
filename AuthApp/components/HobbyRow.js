import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import RenderImage from './RenderImage';

const HobbyRow = ({ hobby_name, imageUri }) => {
  return (
    <View style={styles.row}>
      <View style={styles.imageWrapper}>
        <RenderImage img={imageUri} imgStyle={styles.image}/>
      </View>
      <Text style={styles.hobby_name}>{hobby_name}</Text>
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
  imageWrapper: {
    marginRight: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  hobby_name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default HobbyRow;
