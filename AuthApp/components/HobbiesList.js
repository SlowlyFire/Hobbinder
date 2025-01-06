import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import HobbyRow from './HobbyRow';

const HobbiesList = ({ hobbies, onHobbyPress }) => {
  return (
    <ScrollView>
      {hobbies.length > 0 ? (
        hobbies.map((hobby, index) => (
          <TouchableOpacity 
            key={index} 
            onPress={() => onHobbyPress(hobby.hobby_name)}
          >
            <HobbyRow 
              hobby_name={hobby.hobby_name} 
              imageUri={hobby.pic} 
            />
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noResults}>No hobbies found</Text>
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

export default HobbiesList;
