import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { CLIENT_IP, PORT } from '@env';
import dateParser from '../../lib/dateParser';
import ProfileImage from '../../components/ProfileImage';
import UploadImage from '../../components/UploadImage';
import GoBackButton from '../../components/GoBackButton';
import imageHandler from '../../lib/imageHandler';
import LocationPicker from '../../components/LocationPicker';
import distanceCalculator from '../../lib/distanceCalculator';


const CreateProfileDetailsScreen = ({ route, navigation }) => {
  const { username, password, selectedPermission, isAdmin } = route.params;
  const [cloudinaryUrl, setCloudinaryUrl] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [location, setLocation] = useState(null);
  const [birthday, setBirthday] = useState(null);
  const [loading, setLoading] = useState(false);

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


  const handleLocationSelect = (locationData) => {
    console.log('Selected location:', locationData);
    setLocation(locationData);
  };

  const handleConfirm = async () => {
    if (!firstName || !lastName || !birthday || !cloudinaryUrl || !location) {
      Alert.alert('Note', 'Please fill out all fields.');
      return;
    }

    if (!dateParser.isAgeValid(birthday)) {
      Alert.alert('Note', 'You must be at least 16 years old.');
      return;
    }

    // Check if the location is chosen from google list
    if (!location.name || !location.latitude || !location.longitude ||
      !location.placeId || !location.fullAddress) {
      console.log('Invalid location structure:', location);
      Alert.alert('Error', 'Please select your location again.');
      return;
    }

    const userProfile = {
      username,
      password,
      profile_pic: cloudinaryUrl,
      first_name: firstName,
      last_name: lastName,
      location: {
        name: location.name,
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude
        },
        placeId: location.placeId,
        fullAddress: location.fullAddress
      },
      birthday: dateParser.getAppFormattedDate(birthday),
      permission: selectedPermission,
    };

    console.log('--------------------------------');
    console.log(userProfile);
    // Calculate distances before navigation
    const eventDistances = await calculateEventDistances(userProfile.location);

    // Add distances to the userProfile object that we pass to next screen
    const userProfileWithDistances = {
      ...userProfile,
      eventDistances  // We'll use this later when creating the user
    };

    // Navigate to next screen with the enhanced profile data
    console.log('navigating to ChooseHobbies');
    navigation.navigate('ChooseHobbies', { userProfile : userProfileWithDistances, isAdmin });
  };

  const pickImage = async () => {
    try {
      await imageHandler.handlePickImage(setCloudinaryUrl, setLoading);
    } catch (error) {
      Alert.alert('Error', 'Image upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const openDatePicker = () => {
    DateTimePickerAndroid.open({
      value: birthday || new Date(),
      onChange: (event, date) => {
        if (date) setBirthday(date);
      },
      mode: 'date',
      display: 'spinner',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.mainContentContainer}>
          <View style={styles.header}>
            <GoBackButton onBackPress={() => navigation.goBack()}/>
          </View>
  
          <View style={styles.content}>
            <View style={styles.titleSection}>
              <Text style={styles.welcomeText}>Create Profile 📸</Text>
              <Text style={styles.subtitleText}>Let's make it personal</Text>
            </View>
  
            <View style={styles.profileImageSection}>
              <ProfileImage pickImage={pickImage} image={cloudinaryUrl} canEdit={true} />
              <Text style={styles.uploadText}>Upload profile picture</Text>
            </View>
  
            <View style={styles.inputSection}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your first name"
                  placeholderTextColor="#999"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
  
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your last name"
                  placeholderTextColor="#999"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
  
              <View style={styles.locationContainer}>
                <Text style={styles.label}>Your Location</Text>
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  defaultStyles={styles.input}
                />
              </View>
  
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Birthday</Text>
                <TouchableOpacity
                  style={styles.birthdayButton}
                  onPress={openDatePicker}
                >
                  <Ionicons name="calendar-outline" size={24} color="#666" />
                  <Text style={styles.birthdayText}>
                    {birthday ? birthday.toDateString() : 'Choose your birthday'}
                  </Text>
                </TouchableOpacity>
              </View>
  
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
      <UploadImage loading={loading} setLoading={setLoading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  mainContentContainer: {
    flex: 1,
    minHeight: 1,  // Helps with initial layout calculation
    minWidth: 1,   // Helps with initial layout calculation
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 80,
  },
  backButtonText: {
    fontSize: 18,
    color: '#4A90E2',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  titleSection: {
    marginTop: -15,
    paddingHorizontal: 5,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  uploadText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  inputSection: {
    marginTop: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
    paddingLeft: 4,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    shadowColor: '#000',
  },
  inputContainer: {
    marginBottom: 16,
    zIndex: 1, // This helps with the location picker suggestions
  },
  locationContainer: {
    marginBottom: 16,
    zIndex: 2, 
  },
  birthdayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    shadowColor: '#000',
  },
  birthdayText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#4A90E2',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default CreateProfileDetailsScreen;