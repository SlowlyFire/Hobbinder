import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RenderImage from './RenderImage';

const EventImage = ({ pickImage, image }) => {
  return (
    <View style={styles.profileImageWrapper}>
      <TouchableOpacity style={styles.touchableArea} onPress={pickImage}>
        {image ? (
          <RenderImage img={image} imgStyle={styles.profileImage}/>
        ) : (
          <View style={styles.placeholderPic}>
            <Ionicons name="image-outline" size={40} color="#999" />
          </View>
        )}
        <View style={styles.cameraIconWrapper}>
          <Ionicons name="camera" size={20} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    profileImageWrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    touchableArea: {
        width: '100%',
        height: '100%',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    cameraIconWrapper: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'black',
        borderRadius: 12,
        padding: 8,
    },
    placeholderPic: {
        width: '100%',
        height: '100%',
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ccc',
    },
});

export default EventImage;