import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Header from '../../../components/Header';  
import ScreenContainer from '../../../components/ScreenContainer'; 
import SearchBar from '../../../components/SearchBar';
import ProfileImage from '../../../components/ProfileImage';
import UploadImage from '../../../components/UploadImage';
import LoadingComp from '../../../components/LoadingComp';
import { ioniconsNames, fontAwesomeNames }  from '../../../lib/iconLibraries';
import imageHandler from '../../../lib/imageHandler';
import { AuthContext } from '../../../context/AuthContext';
import { CLIENT_IP, PORT } from '@env';

const HobbyDetailsScreen = ({ route, navigation }) => {
  const { hobby_name } = route.params;
  const [hobbyDetails, setHobbyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cloudinaryUrl, setCloudinaryUrl] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const { token } = useContext(AuthContext);

  const iconLibrary = [
    ...ioniconsNames.map(icon => ({ name: icon, library: 'Ionicons' })),
    ...fontAwesomeNames.map(icon => ({ name: icon, library: 'FontAwesome5' }))
  ];

  const filteredIconLibrary = iconLibrary.filter(icon => 
    icon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getHobbyDetails = async () => {
    try {
      const res = await fetch(`http://${CLIENT_IP}:${PORT}/hobbies/${hobby_name}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      const data = await res.json();
      
      if (res.ok) {
        setHobbyDetails(data);
      } else {
        Alert.alert('Error', 'Failed to fetch the hobby details');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while getting the hobby details');
    } finally {
      setLoading(false);
    }
  };

  const deleteHobby = async () => {
    try {
      const res = await fetch(`http://${CLIENT_IP}:${PORT}/hobbies/${hobby_name}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
  
      if (res.ok) {
        const users = await getAllUsers();
        updateUsersHobbyAfterDeletion(users);
        
        Alert.alert('Success', 'Hobby was deleted and removed from relevant users');
        navigation.navigate('HobbiesManagement'); 
      } else {
        const errorData = await res.json(); 
        Alert.alert('Error', errorData.message || 'Failed to delete hobby');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while deleting the hobby');
    }
  };
  

  const updateHobbyData = async () => {
    try {
      const res = await fetch(`http://${CLIENT_IP}:${PORT}/hobbies/${hobby_name}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(hobbyDetails),
      });

      if (res.ok) {
        Alert.alert('Success', 'Hobby was updated');
      } else {
        const errorData = await res.json(); 
        Alert.alert('Error', errorData.message || 'Failed to update hobby');
        setIsEditing(true);
      }
    } catch (error) { 
      Alert.alert('Error', 'An error occurred while updating the hobby');
    }
  };

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
        return data;
      } else {
        Alert.alert('Error', 'Failed to fetch users');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while getting the users');
    } 
  };

  // Filter out the deleted hobby from each user's hobby list
  const updateUsersHobbyAfterDeletion = async (users) => {
    const updateUserPromises = users.map(async (user) => {
      if (user.hobbies.includes(hobby_name)) {
        const updatedHobbies = user.hobbies.filter(hobby => hobby !== hobby_name);

        try {
          await fetch(`http://${CLIENT_IP}:${PORT}/users/${user.username}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ hobbies: updatedHobbies }),
          });
        }
        catch (error) {
          Alert.alert('Error', 'An error occurred while updating all the users hobbies data');
        } 
      }
    });

    // Wait for all user updates to complete
    await Promise.all(updateUserPromises);
  }

  useEffect(() => {
    getHobbyDetails();
  }, []);

  useEffect(() => {
    if (cloudinaryUrl) {
      setHobbyDetails((prevDetails) => ({ ...prevDetails, pic: cloudinaryUrl }));
    }
  }, [cloudinaryUrl]);

  const selectIcon = (icon, icon_lib) => {
    setHobbyDetails((prevDetails) => ({ ...prevDetails, icon: icon, icon_lib: icon_lib }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      updateHobbyData();
      setIsEditing(false); 
    } else {
      setIsEditing(true); 
    }
  };

  const pickImage = async () => {
    try {
      await imageHandler.handlePickImage(setCloudinaryUrl, setUploadLoading);
      setIsEditing(true);
    } catch (error) {
      Alert.alert('Error', 'Image upload failed.');
    } finally {
      setUploadLoading(false);
    }
  }

  const renderIcon = (icon, library) => {
    if (library === 'Ionicons') {
      return <Ionicons name={icon} size={32} color="gray" />;
    }
    if (library === 'FontAwesome5') {
      return <FontAwesome5 name={icon} size={32} color="gray" />;
    }
  };

  if (loading) {
    return (
      <LoadingComp loadingText="Loading the hobby data..."/>
    );
  }

  const renderIconRows = () => {
    const rows = [];
    for (let i = 0; i < filteredIconLibrary.length; i += 5) {
      const iconsInRow = filteredIconLibrary.slice(i, i + 5);
      rows.push(
        <View key={i} style={[styles.iconRow, iconsInRow.length < 5 && styles.leftAlignedRow]}>
          {iconsInRow.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={styles.iconItem}
              onPress={() => selectIcon(item.name, item.library)}
            >
              {renderIcon(item.name, item.library)}
            </TouchableOpacity>
          ))}
        </View>
      );
    }
    return rows;
  };

  return (
    <ScreenContainer>
      <Header 
        title="Hobby" 
        onBackPress={() => navigation.goBack()} 
        icon={<Ionicons name="book-outline" size={24} color="black" />} 
      />

      {/* Modal for loading state */}
      <UploadImage loading={uploadLoading} setLoading={setUploadLoading} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.hobbySection}>
          <ProfileImage pickImage={pickImage} image={hobbyDetails.pic} canEdit={true} />
          <View style={styles.hobbyNameContainer}>
            {hobbyDetails.icon ? (
              hobbyDetails.icon_lib === 'Ionicons' ? (
                <Ionicons name={hobbyDetails.icon} size={32} color="gray" />
              ) : (
                <FontAwesome5 name={hobbyDetails.icon} size={32} color="gray" />
              )
            ) : (
              <Text>No icon selected</Text>
            )}
            <Text style={styles.hobbyName}>{hobbyDetails.hobby_name}</Text>
          </View>
        </View>

       {isEditing && (
          <>
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search for an icon..." />

            <View style={styles.iconLibrary}>
              <Text style={styles.sectionTitle}>Icons List</Text>
              <ScrollView
                contentContainerStyle={styles.iconScrollContainer}
                nestedScrollEnabled
                style={styles.fixedIconListContainer}
              >
                {renderIconRows()}
              </ScrollView>
            </View>
          </>
        )}

        <TouchableOpacity
          style={[styles.editHobbyButton, isEditing && styles.saveChangesButton]}
          onPress={handleEditToggle}
        >
          <Text style={styles.buttonText}>{isEditing ? 'Save changes' : 'Edit Hobby'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteHobbyButton} onPress={deleteHobby}>
          <Text style={styles.buttonText}>Delete hobby</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  hobbySection: {
    alignItems: 'center',
    marginTop: 20,
  },
  hobbyNameContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  hobbyName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  hobbyNameInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontSize: 20,
    marginVertical: 10,
    width: '80%',
    textAlign: 'center',
  },
  iconSection: {
    marginVertical: 10,
  },
  iconLibrary: {
    marginVertical: 10,
  },
  iconListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  iconItem: {
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  editHobbyButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  saveChangesButton: {
    backgroundColor: 'blue',
  },
  deleteHobbyButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
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
  fixedIconListContainer: {
    height: 250, // Adjust this height based on your icon size and padding/margins
    overflow: 'scroll', // Allow for scrolling
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  leftAlignedRow: {
    justifyContent: 'flex-start', // Align to the left if less than 5 icons
  },
});

export default HobbyDetailsScreen;
