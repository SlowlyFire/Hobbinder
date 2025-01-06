import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import RenderImage from './RenderImage';

const EventRow = ({ category, imageUri, summary }) => {
  const limitWords = 30;
  // Limit the summary text to 30 characters with ellipsis
  const truncatedSummary = summary.length > limitWords ? summary.slice(0, limitWords) + '...' : summary;

  return (
    <View style={styles.row}>
      <View style={styles.imageWrapper}>
        <RenderImage img={imageUri} imgStyle={styles.profileImage}/>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.summary}>{truncatedSummary}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'white',
    marginVertical: 5,
    elevation: 2,
    shadowColor: '#000',
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
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  textContainer: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  summary: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default EventRow;
