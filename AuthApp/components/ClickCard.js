import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, } from 'react-native';
import RenderImage from './RenderImage';

const ClickCard = ({ event, onCardPress }) => {
  return (
    <View style={styles.card}>
      <View style={styles.container}>
        <RenderImage img={event.img} imgStyle={styles.cardImage}/>
        <TouchableOpacity
          style={styles.infoContainer}
          onPress={() => onCardPress(event)} 
        >
          <View style={styles.userInfo}>
            <Text style={styles.name}>{`${event.liked.user.username}, ${event.liked.user.age}`}</Text>
            <Text style={styles.detailsCategory}>{event.category}</Text>
            <Text style={styles.detailsLoaction}>
              {event.location.name.length > 15 ? `${event.location.name.substring(0, 15)}...` : event.location.name}
            </Text>
          </View>
          <Image source={{ uri: event.liked.user.profile_pic }} style={styles.avatar} />
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  card: {
    position: 'relative',
    width: 150, // Reduced width
    height: 200, // Reduced height
    borderRadius: 15, // Adjusted corner radius
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8, // Reduced shadow radius
    shadowOffset: { width: 0, height: 4 }, // Adjusted shadow
    elevation: 4, // Slightly reduced elevation
    left: 10, // Keep some margin
    marginRight: 10, // Keep some margin
  },
  container: { 
    flex: 1, 
    borderRadius: 15, // Match card's border radius
    overflow: 'hidden',
  },
  cardImage: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 15, // Match card's border radius
  },
  infoContainer: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  userInfo: { 
    flex: 1, 
    marginRight: 5, // Reduced margin
  },
  name: {
    color: 'white', 
    fontSize: 14, // Reduced font size
    fontWeight: 'bold',
    marginBottom: 3, // Reduced spacing
  },
  detailsCategory: { 
    color: 'white', 
    fontSize: 10, // Reduced font size
    opacity: 0.8, 
    marginBottom: 3, // Reduced spacing
  },
  detailsLoaction: { 
    color: 'white', 
    fontSize: 10, // Reduced font size
    opacity: 0.8, 
    marginBottom: 15, // Reduced spacing
  },
  avatar: { 
    width: 40, // Reduced size
    height: 40, // Reduced size
    borderRadius: 20, // Match avatar size
    borderWidth: 2, 
    borderColor: 'white',
  },
});

export default ClickCard;
