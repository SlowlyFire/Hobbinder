import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import EventRow from './EventRow';

const EventsList = ({ events, onEventPress }) => {
  return (
    <ScrollView>
      {events.length > 0 ? (
        events.map((event, index) => (
          <TouchableOpacity 
            key={index} 
            onPress={() => onEventPress(event.id)}
          >
            <EventRow 
              category={event.category} 
              imageUri={event.img} 
              summary={event.summary} 
            />
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noResults}>No events found</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
});

export default EventsList;
