import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GoBackButton = ({ onBackPress }) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
        <Ionicons name="arrow-back" size={24} color="black" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  backButton: {
    flexDirection: 'row', // Ensures icon and text are in the same row
    alignItems: 'center', // Vertically centers the text and icon
  },
  backButtonText: {
    fontSize: 18,
    color: 'black',
    fontWeight: '500',
    marginLeft: 8, // Adds spacing between the icon and the text
  },
});

export default GoBackButton;
