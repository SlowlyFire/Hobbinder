import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export const ActionButtons = ({ onSwipeLeft, onSwipeRight }) => (
    <View style={styles.buttonsContainer}>
        <TouchableOpacity
            style={[styles.button, styles.nopeButton]}
            onPress={onSwipeLeft}
        >
            <Ionicons name="close" size={30} color="#FF4F6F" />
        </TouchableOpacity>

        <TouchableOpacity
            style={[styles.button, styles.superlikeButton]}
            onPress={() => { console.log("Wait for premium!") }}
        >
            <Ionicons name="star" size={30} color="#64EDCC" />
        </TouchableOpacity>

        <TouchableOpacity
            style={[styles.button, styles.likeButton]}
            onPress={onSwipeRight}
        >
            <Ionicons name="checkmark" size={30} color="#6ED784" />
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        padding: 20,
      },
      button: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
      },
      nopeButton: {
        borderWidth: 2,
        borderColor: '#FF4F6F',
      },
      superlikeButton: {
        borderWidth: 2,
        borderColor: '#64EDCC',
      },
      likeButton: {
        borderWidth: 2,
        borderColor: '#6ED784',
      },
    
});

export default ActionButtons;