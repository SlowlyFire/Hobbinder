import React, { useState, useEffect, useContext } from 'react';
import { Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../../components/Header';
import SearchBar from '../../../components/SearchBar';
import ScreenContainer from '../../../components/ScreenContainer'; 
import HobbiesList from '../../../components/HobbiesList'; 
import LoadingComp from '../../../components/LoadingComp';
import { AuthContext } from '../../../context/AuthContext';
import { CLIENT_IP, PORT } from '@env';

const HobbiesManagementScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hobbies, setHobbies] = useState([]);
  const [loading, setLoading] = useState(true);

  const { token } = useContext(AuthContext);

  // Fetch hobbies from the server
  const getAllHobbies = async () => {
    try {
      const res = await fetch(`http://${CLIENT_IP}:${PORT}/hobbies/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await res.json();

      if (res.ok) {
        setHobbies(data);
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
    getAllHobbies();
  }, [hobbies]);

  const filteredHobbies = hobbies.filter((hobby) =>
    hobby.hobby_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleHobbyPress = (hobby_name) => {
    navigation.navigate('HobbyDetails', { 
      hobby_name
    });
  };

  if (loading) {
    return (
      <LoadingComp loadingText="Loading hobbies..."/>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <Header 
        title="Hobbies Management" 
        onBackPress={() => navigation.goBack()} 
        icon={<Ionicons name="person-circle-outline" size={24} color="black" />}
      />

      {/* Search Bar */}
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search" />

      {/* User List */}
      <HobbiesList hobbies={filteredHobbies} onHobbyPress={handleHobbyPress} />

      {/* Add New Hobby Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddNewHobby', true)}>
        <Text style={styles.buttonText}>Add new hobby</Text>
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

export default HobbiesManagementScreen;
