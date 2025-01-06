import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const Header = ({ title, onBackPress, hasLogoutButton }) => {
  return (
    <View style={styles.headerContainer}>
      {hasLogoutButton ? (
        <></>
      ) : (
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      )}
      <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20, // Added padding for balance
  },
  backButton: {
    position: 'absolute',
    left: 0,
  },
  logoutButton: {
    position: 'absolute',
    left: 0,
    backgroundColor: 'red',  // Red background color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,  // Rounded corners
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flexShrink: 1, // Allows the title to wrap within the available space
  },
  logoutText: {
    fontSize: 16,
    color: 'white',  // White text color
    fontWeight: 'bold',
  },
});

export default Header;
