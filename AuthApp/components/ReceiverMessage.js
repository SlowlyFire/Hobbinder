import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import dateParser from '../lib/dateParser';

const ReceiverMessage = ({ message }) => {
    return (
        <View style={styles.receiverMessageContainer}>
          {/* <Image
            style={styles.receiverImage}
            source={{ uri: message.photoURL }}
          /> */}
          <Text style={styles.receiverText}>{message.content}</Text>
          <Text style={styles.timeText}>{dateParser.getFormattedTimeNonSeconds(message.created)}</Text>
        </View>
      );
};

const styles = StyleSheet.create({
    receiverMessageContainer: {
        alignSelf: 'flex-start',
        backgroundColor: '#fca5a5',
        padding: 10,
        borderRadius: 15,
        marginVertical: 5,
        marginLeft: 5,
        maxWidth: '70%',
    },
    receiverText: {
        color: 'black',
    },
    timeText: {
      fontSize: 12,
      color: '#555', // Subtle color for the timestamp
      alignSelf: 'flex-start', // Aligns the time to the right within the bubble
  },
    // receiverImage: {
    //     width: 40,
    //     height: 40,
    //     borderRadius: 20,
    //     position: 'absolute',
    //     left: -50,
    //     top: 0,
    // },
});

export default ReceiverMessage;
