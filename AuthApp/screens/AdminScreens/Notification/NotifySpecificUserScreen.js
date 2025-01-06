import React, { useState, useEffect, useContext } from 'react';
import { Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../../components/Header';
import SearchBar from '../../../components/SearchBar';
import ScreenContainer from '../../../components/ScreenContainer'; 
import UserList from '../../../components/UserList'; 
import LoadingComp from '../../../components/LoadingComp';
import { AuthContext } from '../../../context/AuthContext';
import { CLIENT_IP, PORT } from '@env';

const NotifySpecificUserScreen = ({ route, navigation }) => {
  const { title, message } = route.params;

  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState(new Set()); 

  const { token } = useContext(AuthContext);

  const SendNotification = async () => {
    if (selectedUsers.size === 0) {
        Alert.alert('Note', 'Please choose user to send notification to.');
        return;
    }
    const selectedUsersArray = Array.from(selectedUsers);

    try {
      const response = await fetch(`http://${CLIENT_IP}:${PORT}/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          selectedUsers: selectedUsersArray,
          title: title,
          body: message,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Notification sent to the chosen users!');
      } else {
        Alert.alert('Error', data.error || 'Failed to send notification');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error('Error sending notification:', error);
    }
  }

  // Fetch users from the server
  const getAllUsers = async () => {
    try {
      const res = await fetch(`http://${CLIENT_IP}:${PORT}/users/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await res.json();

      if (res.ok) {
        setUsers(data);
      } else {
        Alert.alert('Error', 'Failed to fetch users');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while getting the users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserPress = (username) => {
    setSelectedUsers(prevSelected => {
      const updatedSelected = new Set(prevSelected);
      if (updatedSelected.has(username)) {
        updatedSelected.delete(username); 
      } else {
        updatedSelected.add(username); 
      }
      return updatedSelected;
    });
  };

  if (loading) {
    return (
      <LoadingComp loadingText="Loading users..."/>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <Header 
        title="Notification & Communication" 
        onBackPress={() => navigation.goBack()} 
        icon={<Ionicons name="person-circle-outline" size={24} color="black" />}
      />

      {/* Search Bar */}
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search" />

      {/* User List */}
      <UserList 
        users={filteredUsers} 
        onUserPress={handleUserPress} 
        selectedUsers={selectedUsers} 
      />

      {/* Add New Profile Button */}
      <TouchableOpacity style={styles.addButton} onPress={SendNotification}>
        <Text style={styles.buttonText}>Send message</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 20,
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

export default NotifySpecificUserScreen;
