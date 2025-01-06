import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CLIENT_IP, PORT } from '@env';
import { AuthContext } from '../../context/AuthContext';
import EventImage from '../../components/EventImage';
import imageHandler from '../../lib/imageHandler';
import BottomNavigation from '../../components/BottomNavigation';
import UploadImage from '../../components/UploadImage';
import CategorySelector from '../../components/CategorySelector';
import LocationPicker from '../../components/LocationPicker';

const EventCreationScreen = ({ navigation }) => {
  const { token, isAuthenticated, username } = useContext(AuthContext);
  const [eventData, setEventData] = useState({
    category: '',
    summary: '',
    location: {
      name: '',
      coordinates: {
        latitude: null,
        longitude: null
      },
      placeId: null,
      fullAddress: ''
    },
    date: new Date(),
    time: new Date(),
    image: null,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hobbies, setHobbies] = useState([]);

  const pickImage = async () => {
    try {
      await imageHandler.handlePickImage(setCloudinaryUrl, setLoading);
    } catch (error) {
      Alert.alert('Error', 'Image upload failed.');
    } finally {
      setLoading(false);
    }
  };



  const handleLocationSelect = (locationData) => {
    console.log('Location data received:', locationData);  // Debugging log
    
    // Restructure the location data to match what the server expects
    setEventData(prev => ({
      ...prev,
      location: {
        name: locationData.name,
        coordinates: {  // Create the nested coordinates structure
          latitude: locationData.latitude,
          longitude: locationData.longitude
        },
        placeId: locationData.placeId,
        fullAddress: locationData.fullAddress
      }
    }));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Not Authenticated',
        'Please login first',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    }
  }, [isAuthenticated]);

  // Change the rendered photo
  useEffect(() => {
    if (cloudinaryUrl) {
      setEventData({ ...eventData, image: cloudinaryUrl });
    }
  }, [cloudinaryUrl]);

  // Fetch hobbies when component mounts
  useEffect(() => {
    fetchHobbies();
  }, []);

  const fetchHobbies = async () => {
    try {
      const response = await fetch(`http://${CLIENT_IP}:${PORT}/hobbies/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('--------------------------------')
        console.log(data);
        setHobbies(data);
        console.log('These are the hobbies:');
        for (let hobby of data) {
          console.log(hobby.hobby_name);
        }
      }
    } catch (error) {
      console.error('Error fetching hobbies:', error);
    }
  };

  const validateEventData = () => {
    const errors = [];
  
    // Check category
    if (!eventData.category) {
      errors.push('Please select a category');
    }
  
    // Check summary
    if (!eventData.summary?.trim()) {
      errors.push('Please provide an event summary');
    }
  
    // Check location
    if (!eventData.location?.name) {
      errors.push('Please select a location');
    }
  
    // Check if date and time are future dates
    const eventDateTime = new Date(
      eventData.date.getFullYear(),
      eventData.date.getMonth(),
      eventData.date.getDate(),
      eventData.time.getHours(),
      eventData.time.getMinutes()
    );
  
    if (eventDateTime <= new Date()) {
      errors.push('Please select a future date and time');
    }
  
    return errors;
  };

  // Handle the post button
  const handlePost = async () => {
    if (eventData.category === '' ||  eventData.summary === '' || eventData.location === '') {
      Alert.alert('Note', 'Please fill category, summary and location');
      return;
    }

    try {
      if (!isAuthenticated) {
        throw new Error('Not authenticated');
      }
  
      // First, let's validate that we have the coordinates (if a user enters a location not from google maps list)
      if (!eventData.location?.coordinates?.latitude || !eventData.location?.coordinates?.longitude) {
        Alert.alert('Please select a location from list');
        return;
      }
  
      // Validate all required fields
      const validationErrors = validateEventData();
      if (validationErrors.length > 0) {
        Alert.alert(
          'Missing Information',
          'Please fill in all required fields:\n\n' + validationErrors.join('\n'),
          [{ text: 'OK' }]
        );
        return;
      }

      const eventDateTime = new Date(
        eventData.date.getFullYear(),
        eventData.date.getMonth(),
        eventData.date.getDate(),
        eventData.time.getHours(),
        eventData.time.getMinutes()
      ).toISOString();

      // Use custom image if uploaded, otherwise use the pre-uploaded category image
      const categoryData = hobbies.find(hobby => hobby.hobby_name === eventData.category);
      const eventImage = eventData.image || categoryData.pic;

      const eventToSave = {
        category: eventData.category,
        summary: eventData.summary,
        location: {
          name: eventData.location.name,
          coordinates: eventData.location.coordinates, // Use the existing coordinates object directly
          placeId: eventData.location.placeId,
          fullAddress: eventData.location.fullAddress
        },
        when_date: eventDateTime,
        img: eventImage,
        uploader: { username }
      };
  
      console.log('Attempting to save event with data:', JSON.stringify(eventToSave, null, 2));
  
      const response = await fetch(`http://${CLIENT_IP}:${PORT}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventToSave),
      });
  
      // Add better error handling
      if (!response.ok) {
        const errorData = await response.json().catch(e => ({ error: 'Could not parse error response' }));
        console.error('Server error details:', errorData);
        
        if (response.status === 401 || response.status === 403) {
          navigation.navigate('Login');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`Server error: ${errorData.error || 'Unknown error'}`);
      }
  
      Alert.alert('Success', 'Event created successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', error.message || 'Failed to create event');
    }
  };

  const formData = [{
    key: 'formContent',
    content: (
      <View style={styles.form}>
        <UploadImage loading={loading} setLoading={setLoading} />

        <Text style={styles.title}>Create New Event</Text>

        <View style={styles.imageContainer}>
          <EventImage
            pickImage={pickImage}
            image={eventData.image}
          />
        </View>

        <CategorySelector
          value={eventData.category}
          onChange={(category) => setEventData({ ...eventData, category: category })}
          hobbies={hobbies}
        />

        <View style={styles.locationPickerContainer}>
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            defaultStyles={styles.input}
          />
        </View>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Event Summary"
          multiline
          numberOfLines={4}
          value={eventData.summary}
          onChangeText={(text) => setEventData({ ...eventData, summary: text })}
        />

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>Select Date: {eventData.date.toLocaleDateString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text>Select Time: {eventData.time.toLocaleTimeString()}</Text>
        </TouchableOpacity>

        {(showDatePicker || showTimePicker) && (
          <DateTimePicker
            value={showDatePicker ? eventData.date : eventData.time}
            mode={showDatePicker ? 'date' : 'time'}
            is24Hour={true}
            display="default"
            onChange={(event, selectedValue) => {
              if (showDatePicker) {
                setShowDatePicker(false);
                if (selectedValue) {
                  setEventData({ ...eventData, date: selectedValue });
                }
              } else {
                setShowTimePicker(false);
                if (selectedValue) {
                  setEventData({ ...eventData, time: selectedValue });
                }
              }
            }}
          />
        )}

        <TouchableOpacity style={styles.postButton} onPress={handlePost}>
          <Text style={styles.postButtonText}>Post Event</Text>
        </TouchableOpacity>
      </View>
    ),
  }];

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <FlatList
          data={formData}
          renderItem={({ item }) => item.content}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContentContainer}
        />
      </KeyboardAvoidingView>
      <View style={styles.bottomNavContainer}>
        <BottomNavigation navigation={navigation} currentScreen="EventCreation" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 80, // Adds space for bottom navigation
    flexGrow: 1,
  },
  form: {
    padding: 20,
    flex: 1,
  },
  locationPickerContainer: {
    zIndex: 2,
  },
  postButton: {
    backgroundColor: '#FF4F6F',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    marginTop: 30,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  imageContainer: {
    width: '50%',
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#e1e1e1',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  dateButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  postButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
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

});

export default EventCreationScreen;