import React from 'react';
import { View, Modal, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const UploadImage = ({ loading, setLoading }) => {
  return (
     <Modal
        visible={loading}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLoading(false)}
    >
        <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
            <Ionicons name="download-outline" size={40} color="#4A90E2" />
            <Text style={styles.loadingText}>Uploading image</Text>
            <Text style={styles.loadingText}>please wait a while...</Text>
        </View>
        </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
      },
      loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#4A90E2',
        fontWeight: 'bold',
      },
});

export default UploadImage;

