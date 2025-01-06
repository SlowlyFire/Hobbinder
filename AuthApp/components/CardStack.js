import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import EventCard from './EventCard';

const SCREEN_WIDTH = Dimensions.get('window').width;

const CardStack = React.memo(({ 
    events,
    position,
    panResponder,
    navigation,
    onCardPress
  }) => {
    // If there are no events, we show the "no more cards" message
    if (events.length === 0) {
      return (
        <View style={styles.card}>
          <View style={styles.noMoreCardsContent}>
            <Text style={styles.noMoreCardsText}>No More Events!</Text>
            <Text style={styles.noMoreCardsSubText}>
              Check back later for new events
            </Text>
          </View>
        </View>
      );
    }
  
    // We only render the top two cards for better performance
    return events
      .slice(0, 2)
      .map((event, index) => (
        <EventCard
          key={event.id}
          event={event}
          position={position}
          isFirst={index === 0}
          isSecond={index === 1}
          panHandlers={index === 0 ? panResponder.panHandlers : {}}
          navigation={navigation}
          onCardPress={() => onCardPress(event.id)}
        />
      ))
      .reverse();
  });
  
  // Moving the styles related to cards to this component
  const styles = StyleSheet.create({
    card: {
      position: 'absolute',
      width: SCREEN_WIDTH - 40,
      height: SCREEN_WIDTH * 1.4,
      borderRadius: 20,
      backgroundColor: 'white',
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 5 },
      elevation: 5,
      left: 20
    },
    noMoreCardsContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8f8f8',
      borderRadius: 20,
    },
    noMoreCardsText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#888',
      marginBottom: 10,
    },
    noMoreCardsSubText: {
      fontSize: 16,
      color: '#999',
    },
  });
  
  export default CardStack;