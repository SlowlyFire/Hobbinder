import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RenderImage from './RenderImage';

const ProfileImage = ({ pickImage, image, canEdit }) => {
  return (
    <View style={styles.profileImageWrapper}>
      { !canEdit ? (
        <View>
          { image ? (
              <RenderImage img={image} imgStyle={styles.profileImage}/>
            ) : (
              <View style={styles.placeholderPic}>
             
              </View>
            )}
        </View>
      ) : (
        <TouchableOpacity onPress={pickImage}>
          { image ? (
            <RenderImage img={image} imgStyle={styles.profileImage}/>
          ) : (
            <View style={styles.placeholderPic}>
          
            </View>
          )}
          <View style={styles.cameraIconWrapper}>
              <Ionicons name="camera" size={20} color="white" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    profileImageWrapper: {
        position: 'relative',
        alignSelf: 'center',
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    cameraIconWrapper: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'black',
        borderRadius: 12,
        padding: 4,
    },
    placeholderPic: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ccc',
    },
});

export default ProfileImage;
