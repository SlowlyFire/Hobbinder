import React from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';
import background from '../assets/background.png';

const ScreenContainer = ({ children }) => {
  return (
    <ImageBackground
      source={background} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {children}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background for the content container
    margin: 20,
    marginTop: 60,
    borderRadius: 15,
  },
});

export default ScreenContainer;
