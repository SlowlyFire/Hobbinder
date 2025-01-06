import React from 'react';
import { Modal, View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const CalculatingMatchesModal = ({ visible }) => (
    <Modal transparent animationType="fade" visible={visible}>
        <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text style={styles.title}>Finding Your Perfect Matches</Text>
                <Text style={styles.subtitle}>
                    Using AI to discover events you'll love...
                </Text>
            </View>
        </View>
    </Modal>
);

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        width: '80%'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 15
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
        textAlign: 'center'
    }
});

export default CalculatingMatchesModal;