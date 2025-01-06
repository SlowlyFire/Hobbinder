import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../../components/Header';  
import ScreenContainer from '../../../components/ScreenContainer'; 
import ProfileImage from '../../../components/ProfileImage';
import UploadImage from '../../../components/UploadImage';
import LoadingComp from '../../../components/LoadingComp';
import RenderImage from '../../../components/RenderImage';
import dateParser from '../../../lib/dateParser';
import imageHandler from '../../../lib/imageHandler';
import { FuncNavigationContext} from '../../../context/FuncNavigationContext'; 
import { AuthContext } from '../../../context/AuthContext';
import { CLIENT_IP, PORT } from '@env';

const SomeUserProfileScreen = ({ route, navigation }) => {
  const { username } = route.params;
  const [userDetails, setUserDetails] = useState(null);
  const [hobbiesDetails, setHobbiesDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveChanges, setSaveChanges] = useState(true);
  const [isEditingAbout, setIsEditingAbout] = useState(false);  
  const [aboutText, setAboutText] = useState(''); 
  const [isEditingHobbies, setIsEditingHobbies] = useState(false); 
  const [cloudinaryUrl, setCloudinaryUrl] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const { currentHobbies, setCurrentHobbies } = useContext(FuncNavigationContext);
  const { token } = useContext(AuthContext);
   
  const getUserDetails = async () => {
    try {
      const res = await fetch(`http://${CLIENT_IP}:${PORT}/users/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      const data = await res.json();
      
      if (res.ok) {
        setUserDetails(data);
        setAboutText(data.summary);
        setCurrentHobbies(data.hobbies);
        // Fetch additional data for each hobby
        const enrichedHobbies = await Promise.all(
          data.hobbies.map(async (hobby) => await getUserHobbyData(hobby))
        );

        setHobbiesDetails(enrichedHobbies);
      } else {
        Alert.alert('Error', 'Failed to fetch the user details');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while getting the user details');
    } finally {
      setLoading(false);
    }
  };

  // Fetches additional data for each hobby
  const getUserHobbyData = async (hobby) => {
    try {
      const res = await fetch(`http://${CLIENT_IP}:${PORT}/hobbies/${hobby}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      const data = await res.json();
      if (res.ok) {
        // Return enriched hobby with the additional details
        return { ...hobby, hobby_name: data.hobby_name, pic: data.pic };
      } else {
        Alert.alert('Error', 'Failed to fetch hobby data');
        return hobby;
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while getting the hobby details');
      return hobby; 
    }
  };

  const deleteUser = async () => {
    try {
      const res = await fetch(`http://${CLIENT_IP}:${PORT}/users/${username}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (res.ok) {
        Alert.alert('Success', 'User was deleted');
        navigation.goBack(); 
      } else {
        const errorData = await res.json(); 
        Alert.alert('Error', errorData.message || 'Failed to delete user');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while deleting the user');
    }
  };

  const updateUserData = async () => {
    try {
      const res = await fetch(`http://${CLIENT_IP}:${PORT}/users/${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userDetails),
      });

      if (res.ok) {
        Alert.alert('Success', 'User was updated');
      } else {
        const errorData = await res.json(); 
        Alert.alert('Error', errorData.message || 'Failed to update user');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while updating the user');
    }
  }

  useEffect(() => {
    getUserDetails();
  }, []);

  useEffect(() => {
    const updateHobbiesDetails = async () => {
      if (currentHobbies.length) {
        const enrichedHobbies = await Promise.all(
          currentHobbies.map(async (hobby) => await getUserHobbyData(hobby))
        );
        setHobbiesDetails(enrichedHobbies);
        setUserDetails((prevDetails) => ({ ...prevDetails, hobbies: currentHobbies }));
      }
    };
  
    updateHobbiesDetails();
  }, [currentHobbies]);

  useEffect(() => {
    setUserDetails((prevDetails) => ({ ...prevDetails, summary: aboutText }));
  }, [aboutText]);

  useEffect(() => {
    if (cloudinaryUrl) {
      setUserDetails((prevDetails) => ({ ...prevDetails, profile_pic: cloudinaryUrl }));
    }
  }, [cloudinaryUrl]);

  const pickImage = async () => {
    try {
      await imageHandler.handlePickImage(setCloudinaryUrl, setUploadLoading);
      setSaveChanges(false);
    } catch (error) {
      Alert.alert('Error', 'Image upload failed.');
    } finally {
      setUploadLoading(false);
    }
  }

  const startEdit = () => {
    setSaveChanges(false);
    setIsEditingAbout(true);
    setIsEditingHobbies(true);
  }

  const handleAboutEditToggle = () => {
    setSaveChanges(false);
    setIsEditingAbout(!isEditingAbout); 
    if (isEditingAbout) { 
      setUserDetails((prevDetails) => ({ ...prevDetails, summary: aboutText }));
    }
  };

  const handleHobbiesEditToggle = () => {
    setSaveChanges(false);
    setIsEditingHobbies(!isEditingHobbies);
    if (isEditingHobbies) { 
      setUserDetails((prevDetails) => ({ ...prevDetails, hobbies: currentHobbies }));
    }
  };

  const deleteHobby = (index) => {
    setSaveChanges(false);
    const updatedHobbiesDetails = hobbiesDetails.filter((_, i) => i !== index);
    const currentUpdatedHobbies = currentHobbies.filter((_, i) => i !== index);
    setHobbiesDetails(updatedHobbiesDetails);
    setCurrentHobbies(currentUpdatedHobbies);
    if (isEditingHobbies) {
      setUserDetails((prevDetails) => ({ ...prevDetails, hobbies: currentUpdatedHobbies }));
    }
  };

  const addNewHobby = () => {
    navigation.navigate('AdminChooseHobbies', {
      userProfile: userDetails,
      isAdmin: true,
      isToSetCurrentHobbies: true,
    });
  };

  const handleEdit = () => { 
    if (!saveChanges) {
      updateUserData(userDetails);
      setSaveChanges(true);
      setIsEditingAbout(false);
      setIsEditingHobbies(false);
    }
  }

  if (loading) {
    return (
      <LoadingComp loadingText="Loading the user data..."/>
    );
  }

  return (
    <ScreenContainer>
      <Header 
        title="Profile" 
        onBackPress={() => navigation.goBack()} 
        icon={<Ionicons name="person-circle-outline" size={24} color="black" />} 
      />

      {/* Modal for loading state */}
      <UploadImage loading={uploadLoading} setLoading={setUploadLoading} />

      <ScrollView>
        <View style={styles.profileSection}>
          <ProfileImage pickImage={pickImage} image={userDetails.profile_pic} canEdit={true} />
          <Text style={styles.profileName}>{userDetails.first_name + " " + userDetails.last_name}</Text>
          <Text style={styles.profileLocation}>{dateParser.calculateAge(userDetails.birthday)}</Text>
        </View>

        {/* Container for About and Hobbies */}
        <View style={styles.detailsContainer}>
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>About myself</Text>
            <TouchableOpacity style={styles.editIcon} onPress={handleAboutEditToggle}>
              <Ionicons name={isEditingAbout ? "checkmark" : "pencil"} size={16} color="black" />
            </TouchableOpacity>
            {isEditingAbout ? (
              <TextInput
                style={styles.aboutTextInput}
                value={aboutText}
                onChangeText={setAboutText}
                multiline
              />
            ) : (
              <Text style={styles.aboutText}>{aboutText}</Text>
            )}
          </View>
        </View>
        <View style={styles.detailsContainer}>
          <View style={styles.hobbiesSection}>
            <Text style={styles.sectionTitle}>Hobbies</Text>
            <TouchableOpacity style={styles.editIcon} onPress={handleHobbiesEditToggle}>
              <Ionicons name={isEditingHobbies ? "checkmark" : "pencil"} size={16} color="black" />
            </TouchableOpacity>
            <View style={styles.hobbiesList}>
              {hobbiesDetails.map((hobby, index) => (
                <View key={index} style={styles.hobbyItem}>
                  <RenderImage img={hobby.pic} imgStyle={styles.hobbyImage}/>
                  <Text style={styles.hobbyName}>{hobby.hobby_name}</Text>
                  {isEditingHobbies && (
                    <TouchableOpacity style={styles.deleteIcon} onPress={() => deleteHobby(index)}>
                      <Ionicons name="close-circle" size={24} color="red" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {isEditingHobbies && (
                <TouchableOpacity style={styles.addHobby} onPress={addNewHobby}>
                  <Ionicons name="add-circle" size={50} color="green" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        {!saveChanges && (
          <TouchableOpacity
            style={[styles.editProfileButton, styles.saveChangesButton]}
            onPress={handleEdit}
          >
            <Text style={styles.buttonText}>Save changes</Text>
          </TouchableOpacity>
        )}
        
        {/* Edit Profile Button */}
        {saveChanges && (
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={startEdit}
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.deleteProfileButton} onPress={deleteUser}>
          <Text style={styles.buttonText}>Delete profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  profileSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  profileLocation: {
    fontSize: 16,
    color: 'gray',
  },
  detailsContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    marginVertical: 5,
  },
  aboutSection: {
    marginBottom: 20,
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  editIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  aboutText: {
    fontSize: 16,
    color: 'gray',
  },
  hobbiesSection: {
    marginBottom: 20,
  },
  hobbiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  hobbyItem: {
    width: '30%', 
    alignItems: 'center',
    marginBottom: 20,
  },
  hobbyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  hobbyName: {
    marginTop: 8,
    fontSize: 14,
  },
  editProfileButton: {
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
  deleteProfileButton: {
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
  deleteIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addHobby: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    margin: 10,
  },
});

export default SomeUserProfileScreen;