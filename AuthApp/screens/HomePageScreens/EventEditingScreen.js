import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CLIENT_IP, PORT } from '@env';
import { AuthContext } from '../../context/AuthContext';
import EventImage from '../../components/EventImage';
import UploadImage from '../../components/UploadImage';
import imageHandler from '../../lib/imageHandler';
import dateParser from '../../lib/dateParser';
import BottomNavigation from '../../components/BottomNavigation';
import CategorySelector from '../../components/CategorySelector';
import GoBackButton from '../../components/GoBackButton';

const EventEditingScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { token, isAuthenticated, username } = useContext(AuthContext);
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [hobbies, setHobbies] = useState([]);

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
        setHobbies(data);
      }
    } catch (error) {
      console.error('Error fetching hobbies:', error);
    }
  };

  const getEventDetails = async () => {
    try {
      const res = await fetch(`http://${CLIENT_IP}:${PORT}/events/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();

      if (res.ok) {
        setEventDetails(data)
      } else {
        Alert.alert('Error', 'Failed to fetch the event details');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while getting the event details');
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async () => {
    try {
      const res = await fetch(`http://${CLIENT_IP}:${PORT}/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        Alert.alert('Success', 'Event was deleted');
        navigation.goBack();
      } else {
        const errorData = await res.json();
        Alert.alert('Error', errorData.message || 'Failed to delete event');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while deleting the event');
    }
  };

  const updateEventDetails = async () => {
    try {
      const res = await fetch(`http://${CLIENT_IP}:${PORT}/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventDetails),
      });

      if (res.ok) {
        Alert.alert('Success', 'Event was updated');
        navigation.goBack();
      } else {
        const errorData = await res.json();
        Alert.alert('Error', errorData.message || 'Failed to update event');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while updating the event');
    }
  }

  useEffect(() => {
    getEventDetails();
  }, []);

  useEffect(() => {
    if (cloudinaryUrl) {
      setEventDetails((prevDetails) => ({ ...prevDetails, img: cloudinaryUrl }));
    }
  }, [cloudinaryUrl]);

  const startEdit = () => {
    setIsEditing(true);
  }

  const validateEventData = () => {
    const errors = [];
  
    // Check image
    if (!eventDetails?.img) {
      errors.push('Please upload an event image');
    }
  
    // Check summary
    if (!eventDetails?.summary?.trim()) {
      errors.push('Please provide an event summary');
    }
  
    // Check date and time
    try {
      if (!eventDetails?.when_date) {
        errors.push('Please select both date and time');
        return errors;
      }
  
      const eventDateTime = new Date(eventDetails.when_date);
  
      // Check if the date is valid
      if (isNaN(eventDateTime.getTime())) {
        errors.push('Please select a valid date and time');
      } else {
        // Compare with current date, ignoring milliseconds
        const now = new Date();
        now.setMilliseconds(0);
        eventDateTime.setMilliseconds(0);
        
        if (eventDateTime <= now) {
          errors.push('Please select a future date and time');
        }
      }
    } catch (error) {
      console.error('Date validation error:', error);
      errors.push('Please select a valid date and time');
    }
  
    return errors;
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

  const handleDateChange = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
  
    if (selectedDate && isEditing) {
      const currentDateTime = new Date(eventDetails.when_date);
      const updatedDateTime = new Date(currentDateTime.getTime());
      
      updatedDateTime.setFullYear(selectedDate.getFullYear());
      updatedDateTime.setMonth(selectedDate.getMonth());
      updatedDateTime.setDate(selectedDate.getDate());
      
      setEventDetails(prev => ({
        ...prev,
        when_date: updatedDateTime.toISOString()
      }));
    }
    setShowDatePicker(false);
  };

  const handleTimeChange = (event, selectedTime) => {
    if (event.type === 'dismissed') {
      setShowTimePicker(false);
      return;
    }
  
    if (selectedTime && isEditing) {
      const currentDateTime = new Date(eventDetails.when_date);
      const updatedDateTime = new Date(currentDateTime.getTime());
      
      updatedDateTime.setHours(selectedTime.getHours());
      updatedDateTime.setMinutes(selectedTime.getMinutes());
      updatedDateTime.setSeconds(0);
      updatedDateTime.setMilliseconds(0);
      
      setEventDetails(prev => ({
        ...prev,
        when_date: updatedDateTime.toISOString()
      }));
    }
    setShowTimePicker(false);
  };

  const handleEdit = () => {
    if (isEditing) {
      console.log('Current event details:', eventDetails); // Debug log
  
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
  
      // Add a confirmation dialog before saving changes
      Alert.alert(
        'Confirm Changes',
        'Are you sure you want to save these changes?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Save',
            onPress: () => {
              updateEventDetails(eventDetails);
              setIsEditing(false);
            }
          }
        ]
      );
    } else {
      startEdit();
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading the event data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.header}>
          <GoBackButton onBackPress={() => navigation.goBack()} />
        </View>
        <View>
        <Text style={styles.title}>Event Details</Text>
        </View>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.form}>
            <UploadImage loading={uploadLoading} setLoading={setUploadLoading} />

            <View style={styles.imageContainer}>
              <EventImage
                pickImage={isEditing ? pickImage : null}
                image={eventDetails.img}
              />
            </View>

            <CategorySelector
              value={eventDetails.category}
              isEditing={false}
              hobbies={hobbies}
            />

            <TextInput
              style={[styles.input, isEditing ? styles.textEnabled : styles.textDisabled]}
              placeholder={eventDetails.location.name}
              value={eventDetails.location}
              editable={false}
            />

            <TextInput
              style={[styles.input, styles.textArea, isEditing ? styles.textEnabled : styles.textDisabled]}
              placeholder="Event Summary"
              multiline
              numberOfLines={4}
              value={eventDetails.summary}
              editable={isEditing}
              onChangeText={(text) => setEventDetails({ ...eventDetails, summary: text })}
            />

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => isEditing && setShowDatePicker(true)}
            >
              <Text style={isEditing ? styles.textEnabled : styles.textDisabled}>
                Date: {dateParser.getFormattedDate(eventDetails.when_date)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => isEditing && setShowTimePicker(true)}
            >
              <Text style={isEditing ? styles.textEnabled : styles.textDisabled}>
                Time: {dateParser.getFormattedTime(eventDetails.when_date)}
              </Text>
            </TouchableOpacity>

            {(showDatePicker || showTimePicker) && (
              <DateTimePicker
                value={new Date(eventDetails.when_date)}
                mode={showDatePicker ? 'date' : 'time'}
                is24Hour={true}
                display="default"
                onChange={showDatePicker ? handleDateChange : handleTimeChange}
              />
            )}

            {isEditing ? (
              <TouchableOpacity
                style={[styles.postButton, { backgroundColor: '#4CAF50' }]}
                onPress={handleEdit}
              >
                <Text style={styles.postButtonText}>Save Changes</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.postButton}
                onPress={startEdit}
              >
                <Text style={styles.postButtonText}>Edit Event</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.postButton, { backgroundColor: '#f44336', marginBottom: 40 }]}
              onPress={deleteEvent}
            >
              <Text style={styles.postButtonText}>Delete Event</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.bottomNavContainer}>
        <BottomNavigation navigation={navigation} currentScreen="EventEditing" />
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
  header: {
    paddingLeft: 20,
    paddingTop: 40,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    flex: 1,
    marginBottom: 60,
  },
  form: {
    padding: 20,
  },
  title: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: 'bold',
    // marginBottom: 20,
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
  postButton: {
    backgroundColor: '#6ED784',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryContainer: {
    position: 'relative',
    zIndex: 1,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 2,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  textEnabled: {
    color: '#000',
  },
  textDisabled: {
    color: 'gray',
  },
});

export default EventEditingScreen;