import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import Header from '../../../components/Header'; 
import ScreenContainer from '../../../components/ScreenContainer'; 
import { AuthContext } from '../../../context/AuthContext';
import { CLIENT_IP, PORT } from '@env';

const HandleNotificationsScreen = ({ navigation }) => {
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');

  const { token } = useContext(AuthContext);

  const handleSendToAll = async () => {
    if (!message || !title) {
      Alert.alert('Note', 'Please enter both a title and a message.');
      return;
    }
  
    try {
      const response = await fetch(`http://${CLIENT_IP}:${PORT}/notifications/send/all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title,
          body: message,
        }),
      });
  
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        Alert.alert('Success', 'Notification sent to all users!');
      } else {
        Alert.alert('Error', data.error || 'Failed to send notification');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error('Error sending notification:', error);
    }
  };

  const handleSendToSpecificUsers = () => {
    if (!message || !title) {
      Alert.alert('Note', 'Please enter both a title and a message.');
      return;
    }
    navigation.navigate('NotifySpecificUser', { title, message });
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScreenContainer>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            {/* Header */}
            <Header 
              title="Notification & Communication" 
              onBackPress={() => navigation.goBack()} 
              icon={<Ionicons name="notifications-outline" size={24} color="black" />}
            />

            {/* Title Input Section */}
            <View style={styles.titleContainer}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="Enter title..."
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Wrapping message input in a flex container */}
            <View style={styles.flexContainer}>
              {/* Message Input Section */}
              <Text style={styles.label}>Message</Text>
              <TextInput
                style={styles.messageInput}
                placeholder="Enter message..."
                value={message}
                onChangeText={setMessage}
                multiline
              />
            </View>

            {/* Action Buttons */}
            <TouchableOpacity style={styles.specificProfileButton} onPress={handleSendToSpecificUsers}>
              <Text style={styles.buttonText}>Send to specific profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sendAllButton} onPress={handleSendToAll}>
              <Text style={styles.buttonText}>Send to all</Text>
            </TouchableOpacity>
          </ScrollView>
        </ScreenContainer>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    marginBottom: 20,
  },
  titleContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  titleInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  messageInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  specificProfileButton: {
    backgroundColor: '#7ABF53',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sendAllButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HandleNotificationsScreen;
