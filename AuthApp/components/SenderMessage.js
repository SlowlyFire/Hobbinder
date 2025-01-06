import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import dateParser from '../lib/dateParser';

const ReceiverMessage = ({ message }) => {
    return (
        <View style={styles.senderMessageContainer}>
            <Text style={styles.senderText}>{message.content}</Text>
            <Text style={styles.timeText}>{dateParser.getFormattedTimeNonSeconds(message.created)}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    senderMessageContainer: {
        alignSelf: 'flex-end',
        backgroundColor: '#E0E0E0',
        padding: 10,
        borderRadius: 15,
        marginVertical: 5,
        maxWidth: '70%',
    },
    senderText: {
        color: 'black',
        marginBottom: 5, // Adds spacing between the message and the time
    },
    timeText: {
        fontSize: 12,
        color: '#555', // Subtle color for the timestamp
        alignSelf: 'flex-end', // Aligns the time to the right within the bubble
    },
});

export default ReceiverMessage;
