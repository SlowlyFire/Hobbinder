import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../../components/Header';  
import ScreenContainer from '../../../components/ScreenContainer'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import imageHandler from '../../../lib/imageHandler';
import dateParser from '../../../lib/dateParser';
import EventImage from '../../../components/EventImage'
import UploadImage from '../../../components/UploadImage';
import LoadingComp from '../../../components/LoadingComp';
import { CLIENT_IP, PORT } from '@env';

const EventDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
   
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

  const updateEventData = async () => {
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

  const handleEdit = () => { 
    if (isEditing) {
      updateEventData(eventDetails);
      setIsEditing(false);
    }
  }

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
    if (selectedDate && isEditing) {
      const updatedDate = new Date(eventDetails.when_date);
      updatedDate.setFullYear(selectedDate.getFullYear());
      updatedDate.setMonth(selectedDate.getMonth());
      updatedDate.setDate(selectedDate.getDate());
      setEventDetails({ ...eventDetails, when_date: updatedDate });
    }
    setShowDatePicker(false);
  };

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime  && isEditing) {
      const updatedTime = new Date(eventDetails.when_date);
      updatedTime.setHours(selectedTime.getHours());
      updatedTime.setMinutes(selectedTime.getMinutes());
      updatedTime.setSeconds(selectedTime.getSeconds());
      updatedTime.setMilliseconds(0); // Optional, if you want to reset milliseconds to 0
      setEventDetails({ ...eventDetails, when_date: updatedTime });
    }
    setShowTimePicker(false);
  };

  if (loading) {
    return (
      <LoadingComp loadingText="Loading the event data..."/>
    );
  }

  return (
    <ScreenContainer>
      <Header 
        title="Event Details" 
        onBackPress={() => navigation.goBack()} 
        icon={<Ionicons name="person-circle-outline" size={24} color="black" />} 
      />

      {/* Modal for loading state */}
      <UploadImage loading={uploadLoading} setLoading={setUploadLoading} />

      <ScrollView>
        <View style={styles.imageContainer}>
          <EventImage
            pickImage={pickImage}
            image={eventDetails.img}
          />
        </View>


        <Text style={styles.label}>Type</Text>
        <TextInput
          style={[styles.input, isEditing ? styles.textEnabled : styles.textDisabled]}
          placeholder="Event Type"
          value={eventDetails.type}
          editable={isEditing} // Editable only when isEditing is true
          onChangeText={(text) => setEventDetails({ ...eventDetails, type: text })}
        />

        <Text style={styles.label}>Category</Text>
        <TextInput
          style={[styles.input, isEditing ? styles.textEnabled : styles.textDisabled]}
          placeholder="Event Category"
          value={eventDetails.category}
          editable={isEditing} // Editable only when isEditing is true
          onChangeText={(text) => setEventDetails({ ...eventDetails, category: text })}
        />

        <Text style={styles.label}>Summary</Text>
        <TextInput
          style={[styles.input, styles.textArea, isEditing ? styles.textEnabled : styles.textDisabled]}
          placeholder="Event summary"
          multiline
          numberOfLines={4}
          value={eventDetails.summary}
          editable={isEditing} // Editable only when isEditing is true
          onChangeText={(text) => setEventDetails({ ...eventDetails, summary: text })}
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={[styles.input, isEditing ? styles.textEnabled : styles.textDisabled]}
          placeholder="Event Location"
          value={eventDetails.location}
          editable={isEditing} // Editable only when isEditing is true
          onChangeText={(text) => setEventDetails({ ...eventDetails, location: text })}
        />

        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => isEditing && setShowDatePicker(true)}
        >
          <Text style={isEditing ? styles.textEnabled : styles.textDisabled}>
          {dateParser.getFormattedDate(eventDetails.when_date)}
        </Text>

        </TouchableOpacity>

        <Text style={styles.label}>Time</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => isEditing && setShowTimePicker(true)}
        >
          <Text style={isEditing ? styles.textEnabled : styles.textDisabled}>
            {dateParser.getFormattedTime(eventDetails.when_date)}
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
            style={[styles.editEventButton, styles.saveChangesButton]}
            onPress={handleEdit}
          >
            <Text style={styles.buttonText}>Save changes</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.editEventButton}
            onPress={startEdit}
          >
            <Text style={styles.buttonText}>Edit Event</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.deleteEventButton} onPress={deleteEvent}>
          <Text style={styles.buttonText}>Delete Event</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
};
const styles = StyleSheet.create({
  editEventButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  saveChangesButton: {
    backgroundColor: 'blue', 
  },
  deleteEventButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#000',
    fontWeight: 'bold',
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
    backgroundColor: '#FF4F6F',
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
  textEnabled: {
    color: '#000',  // Color for editable fields or normal state
  },
  textDisabled: {
    color: 'gray',  // Color for non-editable fields, to match
  },
});

export default EventDetailsScreen;