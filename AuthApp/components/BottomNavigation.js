import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const BottomNavigation = ({ navigation, currentScreen }) => {
    const routes = [
      { name: 'Discover', icon: 'home' },
      { name: 'Chat', icon: 'chatbubbles' },
      { name: 'EventCreation', icon: 'add-circle' },
      { name: 'UserProfile', icon: 'person' },
    ];
    
    return (
      <View style={styles.bottomNav}>
        {routes.map((route) => (
          <TouchableOpacity
            key={route.name}
            style={styles.navItem}
            onPress={() => navigation.navigate(route.name)}
          >
            <Ionicons
              name={route.icon}
              size={24}
              color={currentScreen === route.name ? '#FF4F6F' : '#8E8E8E'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    bottomNav: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: 'white',
      paddingVertical: 15,
      borderTopWidth: 1,
      borderTopColor: '#E5E5E5',
    },
    navItem: {
      alignItems: 'center',
    },
  });
  
  export default BottomNavigation;