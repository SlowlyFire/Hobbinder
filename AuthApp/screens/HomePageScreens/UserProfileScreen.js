import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  FlatList,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { CLIENT_IP, PORT } from '@env';
import BottomNavigation from '../../components/BottomNavigation';
import UploadImage from '../../components/UploadImage';
import imageHandler from '../../lib/imageHandler';
import ProfileImage from '../../components/ProfileImage';
import RenderImage from '../../components/RenderImage';
import LocationPicker from '../../components/LocationPicker';
import distanceCalculator from '../../lib/distanceCalculator';

const UserProfileScreen = ({ route, navigation }) => {
  const { token, isAuthenticated, username: currentUser, logout } = useContext(AuthContext);
  const profileUsername = route.params?.username || currentUser;
  const isOwnProfile = currentUser === profileUsername;
  const [userProfile, setUserProfile] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [hobbiesDetails, setHobbiesDetails] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://${CLIENT_IP}:${PORT}/users/${profileUsername}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          await logout();
          navigation.navigate('Login');
          throw new Error('Session expired');
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      console.log('Fetched user profile:', data);
      setUserProfile(data);

      const enrichedHobbies = await Promise.all(
        data.hobbies.map(async (hobby) => await getUserHobbyData(hobby))
      );

      setHobbiesDetails(enrichedHobbies);

      const eventsResponse = await fetch(`http://${CLIENT_IP}:${PORT}/events/createdBy/${profileUsername}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setUserEvents(eventsData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated, profileUsername]);

  const handleEditProfile = () => {
    navigation.navigate('ChooseHobbies', {
      userProfile,
      isAdmin: false
    });
  };


  const calculateEventDistances = async (userLocation) => {
    try {
      // Fetch all active events from your backend
      const response = await fetch(`http://${CLIENT_IP}:${PORT}/events`);
      const events = await response.json();

      // Let's see the structure of your events
      console.log('First event structure:', JSON.stringify(events[0], null, 2));

      // Calculate distances for each event
      const eventDistances = events.map(event => {
        // Make sure we have valid location data
        if (!event.location || !event.location.coordinates) {
          console.log('Event missing location data:', event.id || event._id);
          return null;
        }

        return {
          eventId: event.id, //or event._id
          distance: distanceCalculator.calculateDistance(
            {
              latitude: userLocation.coordinates.latitude,
              longitude: userLocation.coordinates.longitude
            },
            {
              latitude: event.location.coordinates.latitude,
              longitude: event.location.coordinates.longitude
            }
          )
        };
      }).filter(Boolean); // Remove any null entries

      console.log(JSON.stringify(eventDistances));
      return eventDistances;
    } catch (error) {
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        userLocation: JSON.stringify(userLocation, null, 2)
      });
      return [];
    }
  };

  const handleLocationSelect = async (locationData) => {
    try {
      const response = await fetch(`http://${CLIENT_IP}:${PORT}/users/${profileUsername}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          location: {
            name: locationData.name,
            coordinates: {
              latitude: locationData.latitude,
              longitude: locationData.longitude
            },
            placeId: locationData.placeId,
            fullAddress: locationData.fullAddress
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update location');
      }

      // Update local state
      setUserProfile(prev => ({
        ...prev,
        location: {
          name: locationData.name,
          coordinates: {
            latitude: locationData.latitude,
            longitude: locationData.longitude
          },
          placeId: locationData.placeId,
          fullAddress: locationData.fullAddress
        }
      }));

      console.log('calculating new distances for user');
      const eventDistances = await calculateEventDistances(userProfile.location);
      console.log(`calculated distances for user ${profileUsername} and the distances are: ${JSON.stringify(eventDistances)}`);
      // Edit the distances from the new location of user to all events
      const distanceResponse = await fetch(`http://${CLIENT_IP}:${PORT}/userEventsDistances`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: profileUsername, // Maybe we shall use newUser._id now that its stored in Mongo
          distances: eventDistances
        })
      });

      setShowLocationModal(false);
      Alert.alert('Success', 'Location updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update location');
    }
  };


  const LocationModal = () => {
    const [tempLocation, setTempLocation] = useState(null);

    const handleSave = () => {
      if (!tempLocation) {
        Alert.alert('Error', 'Please select a location');
        return;
      }
      handleLocationSelect(tempLocation);
    };

    return (
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Location</Text>
            <View style={styles.locationPickerContainer}>
              <LocationPicker
                onLocationSelect={setTempLocation}
                defaultStyles={styles.locationInput}
                initialLocation={userProfile?.location}
              />
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLocationModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };


  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await logout();
            navigation.navigate('Login');
          }
        }
      ]
    );
  };

  // Update handleAddPhoto
  const handleAddPhoto = async () => {
    try {
      if (userProfile?.photos?.length >= 5) {
        Alert.alert(
          'Photo Limit Reached',
          'You can only upload up to 5 photos. Please delete some photos before adding new ones.',
          [{ text: 'OK' }]
        );
        return;
      }

      setUploadLoading(true);
      const result = await imageHandler.handlePickImage(async (url) => {
        const updatedPhotos = userProfile.photos ? [...userProfile.photos, url] : [url];
        const response = await fetch(`http://${CLIENT_IP}:${PORT}/users/${profileUsername}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            photos: updatedPhotos
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update profile photos');
        }

        // Update local state instead of fetching entire profile
        // setPhotos(updatedPhotos);
        setUserProfile(prev => ({
          ...prev,
          photos: updatedPhotos
        }));
      }, setUploadLoading);
    } catch (error) {
      Alert.alert('Error', 'Failed to add photo');
    } finally {
      setUploadLoading(false);
    }
  };

  // Update handleChangeProfilePic
  const handleChangeProfilePic = async () => {
    try {
      const result = await imageHandler.handlePickImage(async (url) => {
        const response = await fetch(`http://${CLIENT_IP}:${PORT}/users/${profileUsername}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            profile_pic: url
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update profile photo');
        }

        // Update local state instead of fetching entire profile
        // setProfilePic(url);
        setUserProfile(prev => ({
          ...prev,
          profile_pic: url
        }));
      }, setUploadLoading);
    } catch (error) {
      Alert.alert('Error', 'Failed to update photo');
    } finally {
      setUploadLoading(false);
    }
  };

  // Update handleDeletePhoto
  const handleDeletePhoto = async (photoUrl) => {
    try {
      const updatedPhotos = userProfile.photos.filter(url => url !== photoUrl);
      const response = await fetch(`http://${CLIENT_IP}:${PORT}/users/${profileUsername}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          photos: updatedPhotos
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      // Update local state instead of fetching entire profile
      // setPhotos(updatedPhotos);
      setUserProfile(prev => ({
        ...prev,
        photos: updatedPhotos
      }));
      setShowPhotoModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete photo');
    }
  };

  const fetchEvents = async () => {
    try {
      const eventsResponse = await fetch(`http://${CLIENT_IP}:${PORT}/events/createdBy/${profileUsername}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setUserEvents(eventsData);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Fetch events or any data updates
      fetchEvents();
  
      // Get updated summary and hobbies from navigation params
      const route = navigation.getState().routes.find(
        route => route.name === 'UserProfile'
      );
      const updatedSummary = route?.params?.updatedSummary;
      const updatedHobbies = route?.params?.updatedHobbies;
      
      // Update the user profile state if updates are available
      if (updatedSummary || updatedHobbies) {
        setUserProfile(prev => ({
          ...prev,
          summary: updatedSummary || prev.summary, // Keep the previous summary if not updated
          hobbies: updatedHobbies || prev.hobbies
        }));
      }
  
      // Enrich and update hobbiesDetails if updatedHobbies is available
      if (updatedHobbies) {
        (async () => {
          try {
            const enrichedHobbies = await Promise.all(
              updatedHobbies.map(hobby => getUserHobbyData(hobby))
            );
            setHobbiesDetails(enrichedHobbies);
          } catch (error) {
            console.error("Failed to enrich hobbies:", error);
          }
        })();
      }
    });
  
    return unsubscribe;
  }, [navigation, fetchEvents]);
  


  // useFocusEffect(
  //   React.useCallback(() => {
  //     if (isAuthenticated) {
  //       fetchUserProfile();
  //     }
  //   }, [])
  // );


  const renderEventCard = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventEditing', { id: item.id })}
    >
      <RenderImage img={item.img} imgStyle={styles.eventImage}/>
      <View style={styles.eventInfo}>
        <Text style={styles.eventCategory}>{item.category}</Text>
        <Text style={styles.eventDate}>
          {new Date(item.when_date).toLocaleDateString()}
        </Text>
        <View style={styles.likesContainer}>
          <Ionicons name="heart" size={16} color="#FF4F6F" />
          <Text style={styles.likesCount}>{item.liked?.length || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPhotoItem = ({ item: photo }) => (
    <TouchableOpacity
      style={styles.photoCard}
      onPress={() => {
        setSelectedPhoto(photo);
        setShowPhotoModal(true);
      }}
    >
       <RenderImage img={photo} imgStyle={styles.photoCardImage}/>
    </TouchableOpacity>
  );

  const PhotoModal = () => (
    <Modal
      visible={showPhotoModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowPhotoModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Image source={{ uri: selectedPhoto }} style={styles.modalImage} />
          {isOwnProfile && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeletePhoto(selectedPhoto)}
            >
              <Text style={styles.deleteButtonText}>Delete Photo</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowPhotoModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
         <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6ED784" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            {!isOwnProfile && (
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
            )}
            <View style={styles.centerContent}>
              {isOwnProfile ? (
                <ProfileImage pickImage={handleChangeProfilePic} image={userProfile?.profile_pic || 'https://via.placeholder.com/150'} canEdit={true} />
              ) : (
                <ProfileImage pickImage={handleChangeProfilePic} image={userProfile?.profile_pic || 'https://via.placeholder.com/150'} canEdit={false} />
              )}
              <Text style={styles.name}>
                {userProfile?.first_name} {userProfile?.last_name}
              </Text>
              <Text style={styles.summary}>
                {userProfile?.summary}
              </Text>
            </View>
          </View>
          <TouchableOpacity
              style={styles.locationContainer}
              onPress={() => isOwnProfile && setShowLocationModal(true)}
            >
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.locationText}>
                {userProfile?.location?.name || 'Location not set'}
              </Text>
              {isOwnProfile && (
                <Ionicons name="pencil-outline" size={16} color="#666" style={styles.editIcon} />
              )}
            </TouchableOpacity>
          {isOwnProfile ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <></>
          )}
        </View>

        <View>
          <View style={styles.hobbiesSection}>
            <Text style={styles.sectionTitle}>Hobbies</Text>
            <View style={styles.hobbiesList}>
              {hobbiesDetails.map((hobby, index) => (
                <View key={index} style={styles.hobbyItem}>
                  <RenderImage img={hobby.pic} imgStyle={styles.hobbyImage}/>
                  <Text style={styles.hobbyName}>{hobby.hobby_name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.photoGallery}>
          <View style={styles.photoGalleryHeader}>
            <View style={styles.photoHeaderLeft}>
              <Text style={styles.sectionTitle}>Photos</Text>
              {isOwnProfile && (
                <Text style={styles.photoCount}>
                  {userProfile?.photos?.length || 0}/5 photos
                </Text>
              )}
            </View>
            {isOwnProfile && (
              <TouchableOpacity 
                style={[
                  styles.addPhotoButton,
                  userProfile?.photos?.length >= 5 && styles.addPhotoButtonDisabled
                ]} 
                onPress={handleAddPhoto}
              >
                <Ionicons 
                  name="add-circle-outline" 
                  size={24} 
                  color={userProfile?.photos?.length >= 5 ? '#ccc' : '#6ED784'} 
                />
                <Text style={[
                  styles.addPhotoText,
                  userProfile?.photos?.length >= 5 && styles.addPhotoTextDisabled
                ]}>
                  Add Photo
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {userProfile?.photos?.length > 0 ? (
            <FlatList
              data={userProfile.photos}
              renderItem={renderPhotoItem}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoList}
            />
          ) : (
            <Text style={styles.noPhotosText}>No photos added yet</Text>
          )}
        </View>

          { isOwnProfile ? (
            <View style={styles.eventsSection}>
            <Text style={styles.sectionTitle}>Events</Text>
            {userEvents.length > 0 ? (
              <FlatList
                data={userEvents}
                renderItem={renderEventCard}
                keyExtractor={item => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.eventsList}
              />
            ) : (
              <Text style={styles.noEventsText}>No events created yet</Text>
            )}
            </View>
          ) : (
            <></>
          )}
       </ScrollView>

       
      <PhotoModal />
      <LocationModal />
      <UploadImage loading={uploadLoading} setLoading={setUploadLoading} />

      { isOwnProfile ? (
        <View style={styles.bottomNavContainer}>
        <BottomNavigation navigation={navigation} currentScreen={ isOwnProfile ? "UserProfile" : "Chat" }/>
      </View>
      ) : (
        <></>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF4F6F',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#6ED784',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  summary: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#6ED784',
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    width: 120,
  },
  editButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF4F6F',
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    width: 120,
  },
  logoutButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  messageButton: {
    backgroundColor: '#6ED784',
    padding: 10,
    borderRadius: 20,
    width: 120,
  },
  messageButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  eventsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  eventsList: {
    paddingRight: 20,
  },
  eventCard: {
    width: 200,
    marginRight: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 70
  },
  eventImage: {
    width: '100%',
    height: 120,
  },
  eventInfo: {
    padding: 10,
  },
  eventCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesCount: {
    marginLeft: 5,
    color: '#666',
  },
  noEventsText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    elevation: 8, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  photoGallery: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  photoGalleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addPhotoText: {
    color: '#6ED784',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
  },
  photoThumbnail: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    maxHeight: '80%',
    // alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  deleteButton: {
    backgroundColor: '#FF4F6F',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    width: '100%',
  },
  deleteButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#6ED784',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  locationText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  editIcon: {
    marginLeft: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  locationInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  locationPickerContainer: {
    minHeight: 100, // Give enough space for location picker and its dropdown
    zIndex: 999, // Ensure dropdown appears above other elements
    marginBottom: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  photoHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  photoCount: {
    color: '#666',
    fontSize: 14,
  },
  addPhotoButtonDisabled: {
    opacity: 0.5,
  },
  addPhotoTextDisabled: {
    color: '#ccc',
  },
  photoList: {
    paddingRight: 20,
  },
  photoCard: {
    width: 200,
    height: 200,
    marginRight: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photoCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noPhotosText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#6ED784',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 5,
    padding: 5,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center', // Center the profile image, name, and summary
  },
  hobbiesSection: {
    marginTop: 10,
    padding: 20,
    backgroundColor: 'white'
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

export default UserProfileScreen;