import React, { useState, useEffect, useContext } from 'react';
import { Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../../components/Header';
import SearchBar from '../../../components/SearchBar';
import ScreenContainer from '../../../components/ScreenContainer'; 
import UserList from '../../../components/UserList'; 
import LoadingComp from '../../../components/LoadingComp';
import { FuncNavigationContext } from '../../../context/FuncNavigationContext'; 
import { AuthContext } from '../../../context/AuthContext';
import { CLIENT_IP, PORT } from '@env';

const UserManagementScreen = ({ route, navigation }) => {
  const { toFilter } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { setFilteredUser } = useContext(FuncNavigationContext);
  const { token } = useContext(AuthContext);

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
  }, [users]);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserPress = (username) => {
    navigation.navigate('SomeUserProfile', { 
      username
    });
  };

  const handleFilter = (username) => {
    setFilteredUser(username);
    navigation.goBack();
  }

  if (loading) {
    return (
      <LoadingComp loadingText="Loading users..."/>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <Header 
        title={!toFilter ? "User Management" : "Filter by uploader" }
        onBackPress={() => navigation.goBack()} 
        icon={<Ionicons name="person-circle-outline" size={24} color="black" />}
      />

      {/* Search Bar */}
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search" />

      {/* User List */}
      <UserList users={filteredUsers} onUserPress={!toFilter ? handleUserPress : handleFilter } />

      {!toFilter ? (
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('Register', true)}>
          <Text style={styles.buttonText}>Add new profile</Text>
        </TouchableOpacity>
      ) : (
        <></>
      )}
     
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

export default UserManagementScreen;
